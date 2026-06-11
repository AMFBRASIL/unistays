import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  BedDouble,
  CreditCard,
  Sparkles,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  File,
  Mail,
  Printer,
  ChevronRight,
  DollarSign,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;

const reportCategories = [
  {
    id: "operational",
    name: "Operacional",
    icon: BedDouble,
    color: "from-blue-500 to-cyan-500",
    reports: [
      { id: "occupancy", name: "Taxa de Ocupação", description: "Análise detalhada da ocupação por período" },
      { id: "checkins", name: "Check-ins/Check-outs", description: "Movimentação de hóspedes" },
      { id: "housekeeping", name: "Governança", description: "Relatório de limpezas e manutenção" },
    ],
  },
  {
    id: "financial",
    name: "Financeiro",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-500",
    reports: [
      { id: "revenue", name: "Receita Total", description: "Faturamento por período e categoria" },
      { id: "payments", name: "Pagamentos", description: "Entradas e formas de pagamento" },
      { id: "pending", name: "Contas a Receber", description: "Valores pendentes de cobrança" },
    ],
  },
  {
    id: "commercial",
    name: "Comercial",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500",
    reports: [
      { id: "channels", name: "Canais de Venda", description: "Performance por canal de reserva" },
      { id: "adr", name: "ADR & RevPAR", description: "Indicadores de receita por quarto" },
      { id: "forecast", name: "Forecast", description: "Previsão de ocupação e receita" },
    ],
  },
  {
    id: "guests",
    name: "Hóspedes",
    icon: Users,
    color: "from-amber-500 to-orange-500",
    reports: [
      { id: "guest_history", name: "Histórico de Hóspedes", description: "Base de dados de clientes" },
      { id: "loyalty", name: "Programa Fidelidade", description: "Pontos e resgates" },
      { id: "nps", name: "NPS & Avaliações", description: "Satisfação dos hóspedes" },
    ],
  },
];

const exportFormats = [
  { id: "pdf", name: "PDF", icon: File, color: "text-red-500" },
  { id: "excel", name: "Excel", icon: FileSpreadsheet, color: "text-green-600" },
  { id: "email", name: "E-mail", icon: Mail, color: "text-blue-500" },
  { id: "print", name: "Imprimir", icon: Printer, color: "text-slate-500" },
];

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date());
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3);
    }, 2000);
  };

  const resetModal = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedReport(null);
    setExportFormat("pdf");
    setIsGenerating(false);
  };

  const selectedCategoryData = reportCategories.find((c) => c.id === selectedCategory);
  const selectedReportData = selectedCategoryData?.reports.find((r) => r.id === selectedReport);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetModal();
    }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-0 flex-shrink-0">
          <div className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 p-6 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Gerador de Relatórios</DialogTitle>
                <DialogDescription className="text-white/80 mt-1">Crie relatórios personalizados em segundos</DialogDescription>
              </div>
            </div>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { step: 1, label: "Tipo" },
                { step: 2, label: "Período" },
                { step: 3, label: "Exportar" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        step >= s.step
                          ? "bg-white text-slate-700"
                          : "bg-white/20 text-white/60"
                      )}
                    >
                      {step > s.step ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                    </div>
                    <span className="text-xs text-white/70 mt-1">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div
                      className={cn(
                        "w-16 h-1 mx-2 rounded-full transition-all",
                        step > s.step ? "bg-white" : "bg-white/20"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 pb-24">
            {/* Step 1: Select Report Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Selecione o Relatório</h3>
                  <p className="text-muted-foreground">Escolha a categoria e o tipo de relatório desejado</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportCategories.map((category) => (
                    <div
                      key={category.id}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedCategory === category.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedReport(null);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", category.color)}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold">{category.name}</h4>
                      </div>
                      {selectedCategory === category.id && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-border">
                          {category.reports.map((report) => (
                            <div
                              key={report.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReport(report.id);
                              }}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-all",
                                selectedReport === report.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/50 hover:bg-secondary"
                              )}
                            >
                              <p className="font-medium text-sm">{report.name}</p>
                              <p className={cn(
                                "text-xs",
                                selectedReport === report.id ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {report.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date Range & Options */}
            {step === 2 && selectedReportData && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Configurar Período</h3>
                  <p className="text-muted-foreground">Defina o intervalo de datas para o relatório</p>
                </div>

                {/* Selected Report Summary */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", selectedCategoryData?.color)}>
                      {selectedCategoryData && <selectedCategoryData.icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                      <p className="font-semibold">{selectedReportData.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedReportData.description}</p>
                    </div>
                  </div>
                </div>

                {/* Date Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Data Inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="mb-2 block">Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-12">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quick Date Options */}
                <div>
                  <Label className="mb-3 block">Períodos Rápidos</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Hoje", days: 0 },
                      { label: "Últimos 7 dias", days: 7 },
                      { label: "Últimos 30 dias", days: 30 },
                      { label: "Este mês", days: -1 },
                      { label: "Mês anterior", days: -2 },
                    ].map((period) => (
                      <Button
                        key={period.label}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          if (period.days === 0) {
                            setDateFrom(today);
                            setDateTo(today);
                          } else if (period.days > 0) {
                            const from = new Date();
                            from.setDate(from.getDate() - period.days);
                            setDateFrom(from);
                            setDateTo(today);
                          }
                        }}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <Label className="mb-3 block">Formato de Exportação</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {exportFormats.map((fmt) => (
                      <div
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                          exportFormat === fmt.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <fmt.icon className={cn("w-8 h-8 mx-auto mb-2", fmt.color)} />
                        <p className="text-sm font-medium">{fmt.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Generated Report */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Relatório Gerado!</h3>
                  <p className="text-muted-foreground">Seu relatório está pronto para download</p>
                </div>

                {/* Report Preview */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center", selectedCategoryData?.color)}>
                        {selectedCategoryData && <selectedCategoryData.icon className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-bold">{selectedReportData?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dateFrom && dateTo && (
                            <>
                              {format(dateFrom, "dd/MM/yyyy", { locale: ptBR })} - {format(dateTo, "dd/MM/yyyy", { locale: ptBR })}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Gerado agora
                    </Badge>
                  </div>

                  {/* Mock Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <Percent className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-xs text-muted-foreground">Taxa Ocupação</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                      <p className="text-2xl font-bold">R$ 45k</p>
                      <p className="text-xs text-muted-foreground">Receita</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">247</p>
                      <p className="text-xs text-muted-foreground">Hóspedes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-2xl font-bold">+12%</p>
                      <p className="text-xs text-muted-foreground">vs. Anterior</p>
                    </div>
                  </div>

                  {/* Mock Chart Area */}
                  <div className="h-48 rounded-lg bg-white dark:bg-slate-900 border flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Visualização do gráfico</p>
                    </div>
                  </div>
                </div>

                {/* Download Actions */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Download className="w-4 h-4" />
                    Baixar {exportFormats.find(f => f.id === exportFormat)?.name}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar por E-mail
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button
                onClick={handleNext}
                disabled={!selectedReport}
                className="gap-2"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 2 && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={() => {
                  resetModal();
                  onOpenChange(false);
                }}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
