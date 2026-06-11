import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Cog,
  X,
  Save,
  AlertTriangle,
  Bell,
  Clock,
  Calculator,
  FileText,
  Barcode,
  Warehouse,
  TrendingDown,
  RefreshCw,
  Mail,
  Layers,
  Settings2,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConfigStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Cog;
  color: string;
  bgColor: string;
}

const configSteps: ConfigStep[] = [
  { id: "general", title: "Geral", description: "Configurações básicas", icon: Settings2, color: "text-blue-500", bgColor: "bg-blue-500" },
  { id: "stock", title: "Estoque", description: "Regras de estoque", icon: Warehouse, color: "text-emerald-500", bgColor: "bg-emerald-500" },
  { id: "alerts", title: "Alertas", description: "Notificações automáticas", icon: Bell, color: "text-amber-500", bgColor: "bg-amber-500" },
  { id: "codes", title: "Codificação", description: "SKU e códigos de barras", icon: Barcode, color: "text-purple-500", bgColor: "bg-purple-500" },
  { id: "fiscal", title: "Fiscal", description: "Configurações fiscais", icon: FileText, color: "text-rose-500", bgColor: "bg-rose-500" },
];

export function ProductConfigModal({ open, onOpenChange }: ProductConfigModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // General Settings
  const [generalConfig, setGeneralConfig] = useState({
    allowNegativeStock: false,
    requireCategory: true,
    requireBrand: false,
    requireSupplier: true,
    autoGenerateSku: true,
    skuPrefix: "PRD",
    skuDigits: 6,
    defaultUnit: "un",
    showCostOnList: true,
    showMarginOnList: false,
  });

  // Stock Settings
  const [stockConfig, setStockConfig] = useState({
    enableMinStock: true,
    enableMaxStock: true,
    enableReorderPoint: true,
    defaultMinStock: 10,
    defaultMaxStock: 100,
    defaultReorderPoint: 20,
    autoCalculateReorder: true,
    reorderLeadDays: 7,
    countFrequency: "monthly",
    requireJustificationForAdjust: true,
    trackExpirationDate: true,
    expirationAlertDays: 30,
  });

  // Alert Settings
  const [alertConfig, setAlertConfig] = useState({
    enableLowStockAlert: true,
    enableCriticalStockAlert: true,
    enableExpirationAlert: true,
    enableOverstockAlert: false,
    lowStockEmailNotify: true,
    criticalStockEmailNotify: true,
    lowStockThresholdPercent: 30,
    criticalStockThresholdPercent: 10,
    alertRecipients: "",
  });

  // Code Settings
  const [codeConfig, setCodeConfig] = useState({
    skuFormat: "prefix-sequential",
    enableBarcode: true,
    barcodeType: "ean13",
    autoGenerateBarcode: false,
    enableQRCode: true,
    includePropertyInSku: false,
    includeCategoryInSku: true,
  });

  // Fiscal Settings
  const [fiscalConfig, setFiscalConfig] = useState({
    requireNCM: true,
    requireCFOP: true,
    defaultCFOP: "5102",
    requireCST: true,
    defaultCST: "00",
    enablePIS: true,
    enableCOFINS: true,
    enableICMS: true,
    defaultPISRate: 1.65,
    defaultCOFINSRate: 7.60,
    defaultICMSRate: 18,
  });

  const progressPercent = ((currentStep + 1) / configSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === configSteps.length - 1;
  const currentStepData = configSteps[currentStep];

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const renderStepContent = () => {
    switch (configSteps[currentStep].id) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Settings2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Configurações Gerais</h3>
                  <p className="text-sm text-muted-foreground">Parâmetros básicos do módulo de produtos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Permitir Estoque Negativo</Label>
                    <p className="text-xs text-muted-foreground">Autoriza movimentações que resultem em estoque negativo</p>
                  </div>
                  <Switch
                    checked={generalConfig.allowNegativeStock}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, allowNegativeStock: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Categoria Obrigatória</Label>
                    <p className="text-xs text-muted-foreground">Exige categoria no cadastro de produtos</p>
                  </div>
                  <Switch
                    checked={generalConfig.requireCategory}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, requireCategory: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Marca Obrigatória</Label>
                    <p className="text-xs text-muted-foreground">Exige marca no cadastro de produtos</p>
                  </div>
                  <Switch
                    checked={generalConfig.requireBrand}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, requireBrand: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Fornecedor Obrigatório</Label>
                    <p className="text-xs text-muted-foreground">Exige fornecedor padrão no cadastro</p>
                  </div>
                  <Switch
                    checked={generalConfig.requireSupplier}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, requireSupplier: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Exibir Custo na Listagem</Label>
                    <p className="text-xs text-muted-foreground">Mostra o custo unitário na lista de produtos</p>
                  </div>
                  <Switch
                    checked={generalConfig.showCostOnList}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, showCostOnList: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Exibir Margem na Listagem</Label>
                    <p className="text-xs text-muted-foreground">Mostra a margem de lucro na lista de produtos</p>
                  </div>
                  <Switch
                    checked={generalConfig.showMarginOnList}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, showMarginOnList: v })}
                  />
                </div>
              </div>
            </div>

            {/* SKU Configuration */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                  <Barcode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Geração de SKU</h3>
                  <p className="text-sm text-muted-foreground">Configurações de código interno</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Gerar SKU Automaticamente</Label>
                    <p className="text-xs text-muted-foreground">Cria código SKU sequencial ao cadastrar produto</p>
                  </div>
                  <Switch
                    checked={generalConfig.autoGenerateSku}
                    onCheckedChange={(v) => setGeneralConfig({ ...generalConfig, autoGenerateSku: v })}
                  />
                </div>

                {generalConfig.autoGenerateSku && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/30 border">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Prefixo SKU</Label>
                      <Input
                        value={generalConfig.skuPrefix}
                        onChange={(e) => setGeneralConfig({ ...generalConfig, skuPrefix: e.target.value.toUpperCase() })}
                        maxLength={5}
                        placeholder="PRD"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Quantidade de Dígitos</Label>
                      <Select 
                        value={String(generalConfig.skuDigits)} 
                        onValueChange={(v) => setGeneralConfig({ ...generalConfig, skuDigits: Number(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 dígitos</SelectItem>
                          <SelectItem value="5">5 dígitos</SelectItem>
                          <SelectItem value="6">6 dígitos</SelectItem>
                          <SelectItem value="8">8 dígitos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Exemplo: <Badge variant="outline">{generalConfig.skuPrefix}-{"0".repeat(generalConfig.skuDigits - 1)}1</Badge>
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Unidade Padrão</Label>
                  <Select 
                    value={generalConfig.defaultUnit} 
                    onValueChange={(v) => setGeneralConfig({ ...generalConfig, defaultUnit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade (un)</SelectItem>
                      <SelectItem value="kg">Quilograma (kg)</SelectItem>
                      <SelectItem value="lt">Litro (lt)</SelectItem>
                      <SelectItem value="mt">Metro (mt)</SelectItem>
                      <SelectItem value="cx">Caixa (cx)</SelectItem>
                      <SelectItem value="pc">Pacote (pc)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case "stock":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                  <Warehouse className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Controle de Níveis</h3>
                  <p className="text-sm text-muted-foreground">Configurações de estoque mínimo, máximo e ponto de reposição</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Habilitar Estoque Mínimo</Label>
                    <p className="text-xs text-muted-foreground">Exibe alertas quando o estoque atinge o mínimo</p>
                  </div>
                  <Switch
                    checked={stockConfig.enableMinStock}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, enableMinStock: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Habilitar Estoque Máximo</Label>
                    <p className="text-xs text-muted-foreground">Alerta quando o estoque ultrapassa o máximo</p>
                  </div>
                  <Switch
                    checked={stockConfig.enableMaxStock}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, enableMaxStock: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Habilitar Ponto de Reposição</Label>
                    <p className="text-xs text-muted-foreground">Sugere pedido de compra ao atingir o ponto de reposição</p>
                  </div>
                  <Switch
                    checked={stockConfig.enableReorderPoint}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, enableReorderPoint: v })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-background/30 border">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Estoque Mínimo Padrão</Label>
                    <Input
                      type="number"
                      value={stockConfig.defaultMinStock}
                      onChange={(e) => setStockConfig({ ...stockConfig, defaultMinStock: Number(e.target.value) })}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Estoque Máximo Padrão</Label>
                    <Input
                      type="number"
                      value={stockConfig.defaultMaxStock}
                      onChange={(e) => setStockConfig({ ...stockConfig, defaultMaxStock: Number(e.target.value) })}
                      min={0}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Ponto de Reposição</Label>
                    <Input
                      type="number"
                      value={stockConfig.defaultReorderPoint}
                      onChange={(e) => setStockConfig({ ...stockConfig, defaultReorderPoint: Number(e.target.value) })}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Reposição Automática</h3>
                  <p className="text-sm text-muted-foreground">Cálculo inteligente de pedidos de compra</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Calcular Reposição Automaticamente</Label>
                    <p className="text-xs text-muted-foreground">Sugere quantidade baseada no consumo médio</p>
                  </div>
                  <Switch
                    checked={stockConfig.autoCalculateReorder}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, autoCalculateReorder: v })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Lead Time (dias)</Label>
                    <Input
                      type="number"
                      value={stockConfig.reorderLeadDays}
                      onChange={(e) => setStockConfig({ ...stockConfig, reorderLeadDays: Number(e.target.value) })}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Frequência de Contagem</Label>
                    <Select 
                      value={stockConfig.countFrequency} 
                      onValueChange={(v) => setStockConfig({ ...stockConfig, countFrequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diária</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Exigir Justificativa para Ajustes</Label>
                    <p className="text-xs text-muted-foreground">Obriga descrição do motivo ao ajustar estoque</p>
                  </div>
                  <Switch
                    checked={stockConfig.requireJustificationForAdjust}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, requireJustificationForAdjust: v })}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Validade de Produtos</h3>
                  <p className="text-sm text-muted-foreground">Controle de data de vencimento</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Rastrear Data de Validade</Label>
                    <p className="text-xs text-muted-foreground">Permite registrar e monitorar validade dos itens</p>
                  </div>
                  <Switch
                    checked={stockConfig.trackExpirationDate}
                    onCheckedChange={(v) => setStockConfig({ ...stockConfig, trackExpirationDate: v })}
                  />
                </div>

                {stockConfig.trackExpirationDate && (
                  <div className="p-4 rounded-lg bg-background/30 border">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Dias de Antecedência para Alerta de Vencimento
                    </Label>
                    <Input
                      type="number"
                      value={stockConfig.expirationAlertDays}
                      onChange={(e) => setStockConfig({ ...stockConfig, expirationAlertDays: Number(e.target.value) })}
                      min={1}
                      max={365}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "alerts":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Alertas de Estoque</h3>
                  <p className="text-sm text-muted-foreground">Configure notificações automáticas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Alerta de Estoque Baixo</Label>
                    <p className="text-xs text-muted-foreground">Notifica quando o estoque atinge o nível baixo</p>
                  </div>
                  <Switch
                    checked={alertConfig.enableLowStockAlert}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, enableLowStockAlert: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Alerta de Estoque Crítico</Label>
                    <p className="text-xs text-muted-foreground">Notifica quando o estoque atinge o nível crítico</p>
                  </div>
                  <Switch
                    checked={alertConfig.enableCriticalStockAlert}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, enableCriticalStockAlert: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Alerta de Vencimento</Label>
                    <p className="text-xs text-muted-foreground">Notifica produtos próximos ao vencimento</p>
                  </div>
                  <Switch
                    checked={alertConfig.enableExpirationAlert}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, enableExpirationAlert: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Alerta de Excesso de Estoque</Label>
                    <p className="text-xs text-muted-foreground">Notifica quando o estoque ultrapassa o máximo</p>
                  </div>
                  <Switch
                    checked={alertConfig.enableOverstockAlert}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, enableOverstockAlert: v })}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-red-500/5 to-rose-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-500">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Limites de Alerta</h3>
                  <p className="text-sm text-muted-foreground">Defina os percentuais para classificação</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Limite Estoque Baixo (% do mínimo)
                  </Label>
                  <Input
                    type="number"
                    value={alertConfig.lowStockThresholdPercent}
                    onChange={(e) => setAlertConfig({ ...alertConfig, lowStockThresholdPercent: Number(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Limite Estoque Crítico (% do mínimo)
                  </Label>
                  <Input
                    type="number"
                    value={alertConfig.criticalStockThresholdPercent}
                    onChange={(e) => setAlertConfig({ ...alertConfig, criticalStockThresholdPercent: Number(e.target.value) })}
                    min={1}
                    max={100}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Notificações por E-mail</h3>
                  <p className="text-sm text-muted-foreground">Configure destinatários dos alertas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">E-mail para Estoque Baixo</Label>
                    <p className="text-xs text-muted-foreground">Envia e-mail quando o estoque fica baixo</p>
                  </div>
                  <Switch
                    checked={alertConfig.lowStockEmailNotify}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, lowStockEmailNotify: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">E-mail para Estoque Crítico</Label>
                    <p className="text-xs text-muted-foreground">Envia e-mail quando o estoque fica crítico</p>
                  </div>
                  <Switch
                    checked={alertConfig.criticalStockEmailNotify}
                    onCheckedChange={(v) => setAlertConfig({ ...alertConfig, criticalStockEmailNotify: v })}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Destinatários (separados por vírgula)
                  </Label>
                  <Textarea
                    placeholder="estoque@hotel.com, gerente@hotel.com"
                    value={alertConfig.alertRecipients}
                    onChange={(e) => setAlertConfig({ ...alertConfig, alertRecipients: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "codes":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                  <Barcode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Formato de SKU</h3>
                  <p className="text-sm text-muted-foreground">Estrutura do código interno</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Formato do SKU</Label>
                  <Select 
                    value={codeConfig.skuFormat} 
                    onValueChange={(v) => setCodeConfig({ ...codeConfig, skuFormat: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prefix-sequential">Prefixo + Sequencial (PRD-000001)</SelectItem>
                      <SelectItem value="category-sequential">Categoria + Sequencial (ENX-000001)</SelectItem>
                      <SelectItem value="property-category-seq">Propriedade + Categoria + Seq</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Incluir Propriedade no SKU</Label>
                    <p className="text-xs text-muted-foreground">Adiciona código da propriedade ao SKU</p>
                  </div>
                  <Switch
                    checked={codeConfig.includePropertyInSku}
                    onCheckedChange={(v) => setCodeConfig({ ...codeConfig, includePropertyInSku: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Incluir Categoria no SKU</Label>
                    <p className="text-xs text-muted-foreground">Adiciona código da categoria ao SKU</p>
                  </div>
                  <Switch
                    checked={codeConfig.includeCategoryInSku}
                    onCheckedChange={(v) => setCodeConfig({ ...codeConfig, includeCategoryInSku: v })}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Códigos de Barras</h3>
                  <p className="text-sm text-muted-foreground">Configurações de código de barras e QR Code</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Habilitar Código de Barras</Label>
                    <p className="text-xs text-muted-foreground">Permite cadastrar código de barras nos produtos</p>
                  </div>
                  <Switch
                    checked={codeConfig.enableBarcode}
                    onCheckedChange={(v) => setCodeConfig({ ...codeConfig, enableBarcode: v })}
                  />
                </div>

                {codeConfig.enableBarcode && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">Tipo de Código de Barras</Label>
                      <Select 
                        value={codeConfig.barcodeType} 
                        onValueChange={(v) => setCodeConfig({ ...codeConfig, barcodeType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ean13">EAN-13</SelectItem>
                          <SelectItem value="ean8">EAN-8</SelectItem>
                          <SelectItem value="code128">Code 128</SelectItem>
                          <SelectItem value="code39">Code 39</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div>
                        <Label className="font-medium">Gerar Código de Barras Automaticamente</Label>
                        <p className="text-xs text-muted-foreground">Cria código de barras ao cadastrar produto</p>
                      </div>
                      <Switch
                        checked={codeConfig.autoGenerateBarcode}
                        onCheckedChange={(v) => setCodeConfig({ ...codeConfig, autoGenerateBarcode: v })}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">Habilitar QR Code</Label>
                    <p className="text-xs text-muted-foreground">Gera QR Code para identificação rápida</p>
                  </div>
                  <Switch
                    checked={codeConfig.enableQRCode}
                    onCheckedChange={(v) => setCodeConfig({ ...codeConfig, enableQRCode: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "fiscal":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Classificação Fiscal</h3>
                  <p className="text-sm text-muted-foreground">Obrigatoriedade de campos fiscais</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">NCM Obrigatório</Label>
                    <p className="text-xs text-muted-foreground">Exige código NCM no cadastro de produtos</p>
                  </div>
                  <Switch
                    checked={fiscalConfig.requireNCM}
                    onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, requireNCM: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">CFOP Obrigatório</Label>
                    <p className="text-xs text-muted-foreground">Exige código CFOP no cadastro</p>
                  </div>
                  <Switch
                    checked={fiscalConfig.requireCFOP}
                    onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, requireCFOP: v })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <Label className="font-medium">CST Obrigatório</Label>
                    <p className="text-xs text-muted-foreground">Exige código de situação tributária</p>
                  </div>
                  <Switch
                    checked={fiscalConfig.requireCST}
                    onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, requireCST: v })}
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-amber-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Configuração de Impostos</h3>
                  <p className="text-sm text-muted-foreground">Alíquotas padrão para produtos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">CFOP Padrão</Label>
                    <Input
                      value={fiscalConfig.defaultCFOP}
                      onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultCFOP: e.target.value })}
                      placeholder="5102"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">CST Padrão</Label>
                    <Input
                      value={fiscalConfig.defaultCST}
                      onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultCST: e.target.value })}
                      placeholder="00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-background/30 border">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">PIS (%)</Label>
                      <Switch
                        checked={fiscalConfig.enablePIS}
                        onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, enablePIS: v })}
                      />
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={fiscalConfig.defaultPISRate}
                      onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultPISRate: Number(e.target.value) })}
                      disabled={!fiscalConfig.enablePIS}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">COFINS (%)</Label>
                      <Switch
                        checked={fiscalConfig.enableCOFINS}
                        onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, enableCOFINS: v })}
                      />
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={fiscalConfig.defaultCOFINSRate}
                      onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultCOFINSRate: Number(e.target.value) })}
                      disabled={!fiscalConfig.enableCOFINS}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">ICMS (%)</Label>
                      <Switch
                        checked={fiscalConfig.enableICMS}
                        onCheckedChange={(v) => setFiscalConfig({ ...fiscalConfig, enableICMS: v })}
                      />
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      value={fiscalConfig.defaultICMSRate}
                      onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultICMSRate: Number(e.target.value) })}
                      disabled={!fiscalConfig.enableICMS}
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Cog className="h-24 w-24 text-purple-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Cog className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Configuração de Produtos</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Etapa {currentStep + 1} de {configSteps.length} — {currentStepData.title}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between">
              {configSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium",
                      isCompleted && "text-emerald-600 bg-emerald-500/10",
                      isCurrent && "text-primary bg-primary/10",
                      !isCompleted && !isCurrent && "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Icon className={cn("h-4 w-4", isCurrent ? step.color : "")} />
                    )}
                    <span className="hidden md:inline">{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          <div className="p-6 pb-10">
            {renderStepContent()}
          </div>
        </ScrollArea>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-muted/30 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={isFirstStep}
            size="lg"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {configSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep ? "bg-primary w-6" : index < currentStep ? "bg-emerald-500" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {isLastStep ? (
              <Button 
                onClick={handleSubmit}
                size="lg"
                className="min-w-[180px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                size="lg"
                className="min-w-[140px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}