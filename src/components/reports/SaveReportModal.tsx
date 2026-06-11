import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Hotel, 
  Building, 
  TreePine, 
  Home,
  Calendar,
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Users,
  DollarSign,
  BedDouble,
  Download,
  Clock,
  Mail,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; bgColor: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", bgColor: "bg-emerald-500/10" }
};

const properties = [
  { id: "hotel-central", name: "Hotel Central", type: "hotel" as PropertyType },
  { id: "hotel-praia", name: "Hotel Praia Mar", type: "hotel" as PropertyType },
  { id: "apart-business", name: "Apart Business Center", type: "apart-hotel" as PropertyType },
  { id: "apart-residence", name: "Residence Premium", type: "apart-hotel" as PropertyType },
  { id: "loft-urban", name: "Loft Urban Studio", type: "loft" as PropertyType },
  { id: "temp-casa-praia", name: "Casa Praia Premium", type: "temporada" as PropertyType },
];

const reportTypes = [
  { 
    id: "occupancy", 
    label: "Ocupação", 
    description: "Taxa de ocupação por período e unidade",
    icon: BedDouble,
    category: "Operacional",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "revenue", 
    label: "Receita", 
    description: "Faturamento por canal e categoria",
    icon: DollarSign,
    category: "Financeiro",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    id: "adr-revpar", 
    label: "ADR & RevPAR", 
    description: "Métricas de performance de receita",
    icon: TrendingUp,
    category: "Financeiro",
    color: "from-purple-500 to-pink-500"
  },
  { 
    id: "guests", 
    label: "Hóspedes", 
    description: "Perfil e comportamento dos hóspedes",
    icon: Users,
    category: "CRM",
    color: "from-violet-500 to-purple-500"
  },
  { 
    id: "channels", 
    label: "Canais", 
    description: "Distribuição de reservas por canal",
    icon: PieChart,
    category: "Comercial",
    color: "from-amber-500 to-orange-500"
  },
  { 
    id: "longstay", 
    label: "Long Stay", 
    description: "Contratos e receita de longa duração",
    icon: Calendar,
    category: "Híbrido",
    color: "from-emerald-500 to-green-500"
  },
  { 
    id: "owners", 
    label: "Proprietários", 
    description: "Comissões e repasses por proprietário",
    icon: Home,
    category: "Híbrido",
    color: "from-rose-500 to-pink-500"
  },
  { 
    id: "forecast", 
    label: "Previsão", 
    description: "Projeção de demanda e receita",
    icon: LineChart,
    category: "Operacional",
    color: "from-cyan-500 to-blue-500"
  },
];

const scheduleOptions = [
  { value: "once", label: "Uma vez" },
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

const formatOptions = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
];

export function SaveReportModal({ open, onOpenChange }: SaveReportModalProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [allProperties, setAllProperties] = useState(true);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | "all">("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dateRange: "month",
    schedule: "once",
    format: "pdf",
    sendEmail: false,
    email: "",
  });

  const filteredProperties = propertyTypeFilter === "all" 
    ? properties 
    : properties.filter(p => p.type === propertyTypeFilter);

  const toggleProperty = (propertyId: string) => {
    setAllProperties(false);
    setSelectedProperties(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSubmit = () => {
    if (!selectedReportType || !formData.name) {
      toast.error("Selecione o tipo de relatório e dê um nome");
      return;
    }
    
    toast.success("Relatório salvo com sucesso!");
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedReportType("");
      setSelectedProperties([]);
      setAllProperties(true);
      setFormData({
        name: "",
        description: "",
        dateRange: "month",
        schedule: "once",
        format: "pdf",
        sendEmail: false,
        email: "",
      });
    }, 300);
  };

  const selectedReport = reportTypes.find(r => r.id === selectedReportType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            Novo Relatório
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Relatório *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                const isSelected = selectedReportType === report.id;
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReportType(report.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg bg-gradient-to-br mb-2 flex items-center justify-center",
                      report.color
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium text-sm">{report.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {report.category}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report Name & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Relatório *</Label>
              <Input
                placeholder="Ex: Ocupação Mensal - Hotel Central"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={formData.dateRange} onValueChange={(v) => setFormData({ ...formData, dateRange: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Propriedades</Label>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={allProperties} 
                  onCheckedChange={(checked) => {
                    setAllProperties(!!checked);
                    if (checked) setSelectedProperties([]);
                  }}
                  id="all-props"
                />
                <label htmlFor="all-props" className="text-sm text-muted-foreground cursor-pointer">
                  Todas as propriedades
                </label>
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={propertyTypeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPropertyTypeFilter("all")}
              >
                Todas
              </Button>
              {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                const config = propertyTypeConfig[type];
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={propertyTypeFilter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropertyTypeFilter(type)}
                    className="gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Properties List */}
            <div className="max-h-32 overflow-y-auto border border-border/50 rounded-xl p-2 space-y-1 bg-muted/10">
              {filteredProperties.map((property) => {
                const config = propertyTypeConfig[property.type];
                const Icon = config.icon;
                const isSelected = allProperties || selectedProperties.includes(property.id);
                
                return (
                  <div
                    key={property.id}
                    onClick={() => !allProperties && toggleProperty(property.id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
                      isSelected 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/50",
                      allProperties && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      disabled={allProperties}
                      className="pointer-events-none"
                    />
                    <div className={cn("p-1.5 rounded-md", config.bgColor)}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    <span className="text-sm flex-1">{property.name}</span>
                    <Badge variant="outline" className={cn("text-xs", config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule & Format */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Agendamento</Label>
              <Select value={formData.schedule} onValueChange={(v) => setFormData({ ...formData, schedule: v })}>
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scheduleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                <SelectTrigger>
                  <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Enviar por Email</Label>
              <div className="flex items-center gap-2 h-10">
                <Checkbox 
                  checked={formData.sendEmail}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: !!checked })}
                  id="send-email"
                />
                <label htmlFor="send-email" className="text-sm cursor-pointer">
                  Ativar
                </label>
              </div>
            </div>
          </div>

          {formData.sendEmail && (
            <div className="space-y-2">
              <Label>Email de Destino</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedReport && formData.name && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  selectedReport.color
                )}>
                  <selectedReport.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{formData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.label} • {allProperties ? "Todas propriedades" : `${selectedProperties.length} propriedades`} • {formatOptions.find(f => f.value === formData.format)?.label}
                  </p>
                </div>
                <Badge>{scheduleOptions.find(s => s.value === formData.schedule)?.label}</Badge>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
