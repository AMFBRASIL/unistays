import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Warehouse,
  Settings,
  Bell,
  Barcode,
  Calculator,
  Check,
  Package,
  AlertTriangle,
  RefreshCw,
  Clock,
  TrendingUp,
  Mail,
  Smartphone,
  FileText,
  QrCode,
  Hash,
  Percent,
  Save,
  ChevronRight,
  Building2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StockConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const wizardSteps = [
  { id: "general", title: "Geral", icon: Settings, description: "Configurações básicas" },
  { id: "levels", title: "Níveis", icon: TrendingUp, description: "Estoque e reposição" },
  { id: "alerts", title: "Alertas", icon: Bell, description: "Notificações" },
  { id: "coding", title: "Codificação", icon: Barcode, description: "SKU e códigos" },
  { id: "fiscal", title: "Fiscal", icon: Calculator, description: "Tributação" },
];

export function StockConfigModal({ open, onOpenChange }: StockConfigModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // General settings
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [autoGenerateSKU, setAutoGenerateSKU] = useState(true);
  const [trackExpirationDate, setTrackExpirationDate] = useState(true);
  const [trackBatchNumber, setTrackBatchNumber] = useState(false);
  const [defaultUnitId, setDefaultUnitId] = useState<string | null>(null);
  const [measurementUnits, setMeasurementUnits] = useState<Array<{ id: string; code: string; name: string; abbreviation: string }>>([]);
  const [stockMethod, setStockMethod] = useState("fifo");

  // Levels settings
  const [defaultMinStock, setDefaultMinStock] = useState("10");
  const [defaultMaxStock, setDefaultMaxStock] = useState("100");
  const [defaultReorderPoint, setDefaultReorderPoint] = useState("20");
  const [autoReorder, setAutoReorder] = useState(false);
  const [reorderLeadTime, setReorderLeadTime] = useState("7");
  const [safetyStockPercent, setSafetyStockPercent] = useState("15");

  // Alert settings
  const [enableLowStockAlert, setEnableLowStockAlert] = useState(true);
  const [enableExpirationAlert, setEnableExpirationAlert] = useState(true);
  const [expirationAlertDays, setExpirationAlertDays] = useState("30");
  const [enableReorderAlert, setEnableReorderAlert] = useState(true);
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertPush, setAlertPush] = useState(true);
  const [alertSMS, setAlertSMS] = useState(false);

  // Coding settings
  const [skuPrefix, setSkuPrefix] = useState("PRD");
  const [skuDigits, setSkuDigits] = useState("6");
  const [enableEAN, setEnableEAN] = useState(true);
  const [eanPrefix, setEanPrefix] = useState("789");
  const [enableQRCode, setEnableQRCode] = useState(true);
  const [qrCodeContent, setQrCodeContent] = useState("sku");

  // Fiscal settings
  const [defaultNCM, setDefaultNCM] = useState("");
  const [defaultCFOP, setDefaultCFOP] = useState("5102");
  const [defaultICMS, setDefaultICMS] = useState("18");
  const [defaultPIS, setDefaultPIS] = useState("1.65");
  const [defaultCOFINS, setDefaultCOFINS] = useState("7.6");
  const [defaultIPI, setDefaultIPI] = useState("0");

  const progress = ((currentStep + 1) / wizardSteps.length) * 100;

  useEffect(() => {
    if (!open) return;
    api.getProperties().then((res) => {
      const data = res.data as { properties?: { id: number; name: string }[] };
      const list = Array.isArray(data?.properties) ? data.properties : [];
      setProperties(list);
      if (list.length > 0) setPropertyId((prev) => prev ?? list[0].id);
    }).catch(() => setProperties([]));
    // Carrega todas as unidades (ativas/inativas) para garantir exibição da unidade já vinculada.
    api.getUnitsOfMeasure().then((res) => {
      const data = res.data as { unitsOfMeasure?: Array<{ id: string | number; code: string; name: string; abbreviation?: string; symbol?: string }> };
      const list = Array.isArray(data?.unitsOfMeasure) ? data.unitsOfMeasure : [];
      setMeasurementUnits(
        list.map((u) => ({
          id: String(u.id),
          code: u.code,
          name: u.name,
          abbreviation: u.abbreviation || u.symbol || u.code,
        }))
      );
    }).catch(() => setMeasurementUnits([]));
  }, [open]);

  useEffect(() => {
    if (!open || !propertyId) return;
    setLoading(true);
    api.getStockConfig(propertyId).then((res) => {
      const data = res.data as StockConfigResponse | null;
      if (data) {
        setAllowNegativeStock(data.allowNegativeStock);
        setAutoGenerateSKU(data.autoGenerateSKU);
        setTrackExpirationDate(data.trackExpirationDate);
        setTrackBatchNumber(data.trackBatchNumber);
        setDefaultUnitId(data.defaultUnitId != null ? String(data.defaultUnitId) : null);
        setStockMethod(data.stockMethod ?? "fifo");
        setDefaultMinStock(String(data.defaultMinStock ?? 10));
        setDefaultMaxStock(String(data.defaultMaxStock ?? 100));
        setDefaultReorderPoint(String(data.defaultReorderPoint ?? 20));
        setAutoReorder(data.autoReorder);
        setReorderLeadTime(String(data.reorderLeadTime ?? 7));
        setSafetyStockPercent(String(data.safetyStockPercent ?? 15));
        setEnableLowStockAlert(data.enableLowStockAlert);
        setEnableExpirationAlert(data.enableExpirationAlert);
        setExpirationAlertDays(String(data.expirationAlertDays ?? 30));
        setEnableReorderAlert(data.enableReorderAlert);
        setAlertEmail(data.alertEmail);
        setAlertPush(data.alertPush);
        setAlertSMS(data.alertSMS);
        setSkuPrefix(data.skuPrefix ?? "PRD");
        setSkuDigits(String(data.skuDigits ?? 6));
        setEnableEAN(data.enableEAN);
        setEanPrefix(data.eanPrefix ?? "789");
        setEnableQRCode(data.enableQRCode);
        setQrCodeContent((data.qrCodeContent as "sku" | "ean" | "url" | "json") ?? "sku");
        setDefaultNCM(data.defaultNCM ?? "");
        setDefaultCFOP(data.defaultCFOP ?? "5102");
        setDefaultICMS(String(data.defaultICMS ?? 18));
        setDefaultPIS(String(data.defaultPIS ?? 1.65));
        setDefaultCOFINS(String(data.defaultCOFINS ?? 7.6));
        setDefaultIPI(String(data.defaultIPI ?? 0));
      }
    }).catch(() => toast.error("Erro ao carregar configuração.")).finally(() => setLoading(false));
  }, [open, propertyId]);

  type StockConfigResponse = {
    allowNegativeStock?: boolean;
    autoGenerateSKU?: boolean;
    trackExpirationDate?: boolean;
    trackBatchNumber?: boolean;
    defaultUnit?: string;
    defaultUnitId?: string | null;
    stockMethod?: string;
    defaultMinStock?: number;
    defaultMaxStock?: number;
    defaultReorderPoint?: number;
    autoReorder?: boolean;
    reorderLeadTime?: number;
    safetyStockPercent?: number;
    enableLowStockAlert?: boolean;
    enableExpirationAlert?: boolean;
    expirationAlertDays?: number;
    enableReorderAlert?: boolean;
    alertEmail?: boolean;
    alertPush?: boolean;
    alertSMS?: boolean;
    skuPrefix?: string;
    skuDigits?: number;
    enableEAN?: boolean;
    eanPrefix?: string;
    enableQRCode?: boolean;
    qrCodeContent?: string;
    defaultNCM?: string | null;
    defaultCFOP?: string;
    defaultICMS?: number;
    defaultPIS?: number;
    defaultCOFINS?: number;
    defaultIPI?: number;
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!propertyId) {
      toast.error("Selecione uma propriedade.");
      return;
    }
    setSaving(true);
    try {
      const selectedUnit = measurementUnits.find((u) => String(u.id) === String(defaultUnitId));
      const defaultUnitCode = (selectedUnit?.code || "").toLowerCase();
      await api.createOrUpdateStockConfig({
        propertyId,
        allowNegativeStock,
        autoGenerateSKU,
        trackExpirationDate,
        trackBatchNumber,
        defaultUnit: (defaultUnitCode as "un" | "kg" | "lt" | "mt" | "cx" | "pc") || undefined,
        defaultUnitId: defaultUnitId ?? undefined,
        stockMethod: stockMethod as "fifo" | "lifo" | "average" | "specific",
        defaultMinStock: parseFloat(defaultMinStock) || 10,
        defaultMaxStock: parseFloat(defaultMaxStock) || 100,
        defaultReorderPoint: parseFloat(defaultReorderPoint) || 20,
        autoReorder,
        reorderLeadTime: parseInt(reorderLeadTime, 10) || 7,
        safetyStockPercent: parseFloat(safetyStockPercent) || 15,
        enableLowStockAlert,
        enableExpirationAlert,
        expirationAlertDays: parseInt(expirationAlertDays, 10) || 30,
        enableReorderAlert,
        enableOverstockAlert: false,
        alertEmail,
        alertPush,
        alertSMS,
        skuPrefix: skuPrefix || "PRD",
        skuDigits: parseInt(skuDigits, 10) || 6,
        enableEAN,
        eanPrefix: eanPrefix || "789",
        enableQRCode,
        qrCodeContent: qrCodeContent as "sku" | "ean" | "url" | "json",
        defaultNCM: defaultNCM || null,
        defaultCFOP: defaultCFOP || "5102",
        defaultICMS: parseFloat(defaultICMS) || 18,
        defaultPIS: parseFloat(defaultPIS) || 1.65,
        defaultCOFINS: parseFloat(defaultCOFINS) || 7.6,
        defaultIPI: parseFloat(defaultIPI) || 0,
      });
      toast.success("Configurações de estoque salvas com sucesso!");
      onOpenChange(false);
      setCurrentStep(0);
    } catch {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setCurrentStep(0), 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Permitir Estoque Negativo</p>
                    <p className="text-sm text-muted-foreground">Permite vendas mesmo sem estoque</p>
                  </div>
                </div>
                <Switch checked={allowNegativeStock} onCheckedChange={setAllowNegativeStock} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Hash className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Gerar SKU Automaticamente</p>
                    <p className="text-sm text-muted-foreground">Cria código único ao cadastrar</p>
                  </div>
                </div>
                <Switch checked={autoGenerateSKU} onCheckedChange={setAutoGenerateSKU} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-100">
                    <Clock className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rastrear Validade</p>
                    <p className="text-sm text-muted-foreground">Controle de data de vencimento</p>
                  </div>
                </div>
                <Switch checked={trackExpirationDate} onCheckedChange={setTrackExpirationDate} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rastrear Lote</p>
                    <p className="text-sm text-muted-foreground">Controle por número de lote</p>
                  </div>
                </div>
                <Switch checked={trackBatchNumber} onCheckedChange={setTrackBatchNumber} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidade Padrão</Label>
                <Select value={defaultUnitId ?? ""} onValueChange={(v) => setDefaultUnitId(v || null)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits.map((u) => (
                      <SelectItem key={String(u.id)} value={String(u.id)}>
                        {u.name} ({u.abbreviation || u.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Método de Custeio</Label>
                <Select value={stockMethod} onValueChange={setStockMethod}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO (Primeiro a Entrar)</SelectItem>
                    <SelectItem value="lifo">LIFO (Último a Entrar)</SelectItem>
                    <SelectItem value="average">Custo Médio</SelectItem>
                    <SelectItem value="specific">Custo Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <Label className="text-red-700 font-medium">Estoque Mínimo</Label>
                </div>
                <Input
                  type="number"
                  value={defaultMinStock}
                  onChange={(e) => setDefaultMinStock(e.target.value)}
                  className="bg-background border-red-200"
                />
                <p className="text-xs text-red-600 mt-2">Alerta crítico</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-amber-100">
                    <RefreshCw className="h-4 w-4 text-amber-600" />
                  </div>
                  <Label className="text-amber-700 font-medium">Ponto Reposição</Label>
                </div>
                <Input
                  type="number"
                  value={defaultReorderPoint}
                  onChange={(e) => setDefaultReorderPoint(e.target.value)}
                  className="bg-background border-amber-200"
                />
                <p className="text-xs text-amber-600 mt-2">Dispara pedido</p>
              </div>

              <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100">
                    <Package className="h-4 w-4 text-emerald-600" />
                  </div>
                  <Label className="text-emerald-700 font-medium">Estoque Máximo</Label>
                </div>
                <Input
                  type="number"
                  value={defaultMaxStock}
                  onChange={(e) => setDefaultMaxStock(e.target.value)}
                  className="bg-background border-emerald-200"
                />
                <p className="text-xs text-emerald-600 mt-2">Limite máximo</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Reposição Automática</p>
                  <p className="text-sm text-muted-foreground">Gera pedido de compra automaticamente</p>
                </div>
              </div>
              <Switch checked={autoReorder} onCheckedChange={setAutoReorder} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lead Time de Reposição (dias)</Label>
                <Input
                  type="number"
                  value={reorderLeadTime}
                  onChange={(e) => setReorderLeadTime(e.target.value)}
                  className="bg-background"
                  placeholder="Tempo médio de entrega"
                />
              </div>
              <div className="space-y-2">
                <Label>Estoque de Segurança (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={safetyStockPercent}
                    onChange={(e) => setSafetyStockPercent(e.target.value)}
                    className="bg-background"
                  />
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Tipos de Alerta
                </h4>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">Quando atingir mínimo</p>
                  </div>
                  <Switch checked={enableLowStockAlert} onCheckedChange={setEnableLowStockAlert} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Produtos Vencendo</p>
                    <p className="text-sm text-muted-foreground">Antes da validade</p>
                  </div>
                  <Switch checked={enableExpirationAlert} onCheckedChange={setEnableExpirationAlert} />
                </div>

                {enableExpirationAlert && (
                  <div className="ml-4 space-y-2">
                    <Label>Dias antes do vencimento</Label>
                    <Input
                      type="number"
                      value={expirationAlertDays}
                      onChange={(e) => setExpirationAlertDays(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Ponto de Reposição</p>
                    <p className="text-sm text-muted-foreground">Nível de reposição</p>
                  </div>
                  <Switch checked={enableReorderAlert} onCheckedChange={setEnableReorderAlert} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-500" />
                  Canais de Notificação
                </h4>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-sm text-muted-foreground">Alertas por e-mail</p>
                    </div>
                  </div>
                  <Switch checked={alertEmail} onCheckedChange={setAlertEmail} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-100">
                      <Bell className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium">Push Notification</p>
                      <p className="text-sm text-muted-foreground">No navegador</p>
                    </div>
                  </div>
                  <Switch checked={alertPush} onCheckedChange={setAlertPush} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-muted-foreground">Alertas críticos</p>
                    </div>
                  </div>
                  <Switch checked={alertSMS} onCheckedChange={setAlertSMS} />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  Configuração de SKU
                </h4>

                <div className="space-y-2">
                  <Label>Prefixo do SKU</Label>
                  <Input
                    value={skuPrefix}
                    onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                    className="bg-background uppercase"
                    placeholder="PRD"
                    maxLength={5}
                  />
                  <p className="text-xs text-muted-foreground">Ex: PRD, PROD, SKU</p>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade de Dígitos</Label>
                  <Select value={skuDigits} onValueChange={setSkuDigits}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 dígitos (0001-9999)</SelectItem>
                      <SelectItem value="5">5 dígitos (00001-99999)</SelectItem>
                      <SelectItem value="6">6 dígitos (000001-999999)</SelectItem>
                      <SelectItem value="8">8 dígitos (00000001-99999999)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">Exemplo de SKU:</p>
                  <p className="font-mono text-lg font-bold">{skuPrefix}-{"0".repeat(parseInt(skuDigits) - 1)}1</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-emerald-500" />
                  Código de Barras (EAN-13)
                </h4>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Habilitar EAN-13</p>
                    <p className="text-sm text-muted-foreground">Código de barras padrão</p>
                  </div>
                  <Switch checked={enableEAN} onCheckedChange={setEnableEAN} />
                </div>

                {enableEAN && (
                  <div className="space-y-2">
                    <Label>Prefixo EAN (País)</Label>
                    <Input
                      value={eanPrefix}
                      onChange={(e) => setEanPrefix(e.target.value)}
                      className="bg-background"
                      placeholder="789"
                      maxLength={3}
                    />
                    <p className="text-xs text-muted-foreground">789 = Brasil</p>
                  </div>
                )}

                <h4 className="font-medium flex items-center gap-2 mt-6">
                  <QrCode className="h-4 w-4 text-violet-500" />
                  QR Code
                </h4>

                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Habilitar QR Code</p>
                    <p className="text-sm text-muted-foreground">Gerar QR para produtos</p>
                  </div>
                  <Switch checked={enableQRCode} onCheckedChange={setEnableQRCode} />
                </div>

                {enableQRCode && (
                  <div className="space-y-2">
                    <Label>Conteúdo do QR Code</Label>
                    <Select value={qrCodeContent} onValueChange={setQrCodeContent}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sku">SKU do Produto</SelectItem>
                        <SelectItem value="ean">Código EAN</SelectItem>
                        <SelectItem value="url">URL do Produto</SelectItem>
                        <SelectItem value="json">Dados JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Classificação Fiscal
                </h4>

                <div className="space-y-2">
                  <Label>NCM Padrão</Label>
                  <Input
                    value={defaultNCM}
                    onChange={(e) => setDefaultNCM(e.target.value)}
                    className="bg-background"
                    placeholder="0000.00.00"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">Nomenclatura Comum do Mercosul</p>
                </div>

                <div className="space-y-2">
                  <Label>CFOP Padrão</Label>
                  <Select value={defaultCFOP} onValueChange={setDefaultCFOP}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5102">5102 - Venda mercadoria (dentro UF)</SelectItem>
                      <SelectItem value="5405">5405 - Venda ST (dentro UF)</SelectItem>
                      <SelectItem value="6102">6102 - Venda mercadoria (fora UF)</SelectItem>
                      <SelectItem value="6108">6108 - Venda a não contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-emerald-500" />
                  Alíquotas Padrão
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ICMS (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={defaultICMS}
                        onChange={(e) => setDefaultICMS(e.target.value)}
                        className="bg-background"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>IPI (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={defaultIPI}
                        onChange={(e) => setDefaultIPI(e.target.value)}
                        className="bg-background"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>PIS (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={defaultPIS}
                        onChange={(e) => setDefaultPIS(e.target.value)}
                        className="bg-background"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>COFINS (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={defaultCOFINS}
                        onChange={(e) => setDefaultCOFINS(e.target.value)}
                        className="bg-background"
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                  <p className="text-sm font-medium text-orange-800 mb-1">Carga Tributária Estimada</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {(parseFloat(defaultICMS || "0") + parseFloat(defaultIPI || "0") + parseFloat(defaultPIS || "0") + parseFloat(defaultCOFINS || "0")).toFixed(2)}%
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Soma das alíquotas padrão</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 bg-gradient-to-b from-violet-600 to-purple-700 p-6 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <div className="p-3 rounded-2xl bg-white/10 w-fit mb-4">
                <Warehouse className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Configuração de Estoque</h2>
              <p className="text-violet-200 text-sm mt-1">
                Defina os parâmetros do sistema
              </p>
            </div>

            {properties.length > 0 && (
              <div className="mb-6">
                <Label className="text-violet-200 text-xs font-medium mb-2 block">Propriedade</Label>
                <Select
                  value={propertyId?.toString() ?? ""}
                  onValueChange={(v) => setPropertyId(parseInt(v, 10))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Building2 className="h-4 w-4 mr-2 text-violet-200" />
                    <SelectValue placeholder="Selecione a propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-violet-200">Progresso</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>

            {/* Steps */}
            <div className="flex-1 space-y-2">
              {wizardSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                      isActive && "bg-white/20 shadow-lg",
                      !isActive && "hover:bg-white/10"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        isActive && "bg-white text-violet-600",
                        isCompleted && "bg-emerald-400 text-white",
                        !isActive && !isCompleted && "bg-white/10 text-violet-200"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isActive ? "text-white" : "text-violet-200"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-violet-300 truncate">{step.description}</p>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-white flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Step indicator */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-violet-200 text-sm">
                Etapa {currentStep + 1} de {wizardSteps.length}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content Header */}
            <div className="px-8 py-6 border-b bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-center gap-3">
                {React.createElement(wizardSteps[currentStep].icon, {
                  className: "h-6 w-6 text-violet-600"
                })}
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {wizardSteps[currentStep].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {wizardSteps[currentStep].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    Carregando configuração...
                  </div>
                ) : (
                  renderStepContent()
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-muted/30">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancelar
                </Button>
                {currentStep === wizardSteps.length - 1 ? (
                  <Button
                    onClick={handleSave}
                    disabled={saving || !propertyId}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 min-w-[160px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
