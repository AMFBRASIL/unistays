import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveReportModal } from "@/components/reports/SaveReportModal";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  BedDouble,
  DollarSign,
  PieChart,
  LineChart,
  ArrowRight,
  Clock,
  Filter,
  Plus,
} from "lucide-react";

interface Report {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
  lastGenerated?: string;
  popular?: boolean;
}

const reports: Report[] = [
  {
    id: "occupancy",
    icon: BedDouble,
    title: "Relatório de Ocupação",
    description: "Taxa de ocupação por período, tipo de quarto e canal",
    category: "Operacional",
    lastGenerated: "Hoje, 08:00",
    popular: true,
  },
  {
    id: "revenue",
    icon: DollarSign,
    title: "Receita por Canal",
    description: "Faturamento detalhado por canal de distribuição",
    category: "Financeiro",
    lastGenerated: "Hoje, 06:00",
    popular: true,
  },
  {
    id: "adr-revpar",
    icon: TrendingUp,
    title: "ADR & RevPAR",
    description: "Métricas de performance de receita por quarto",
    category: "Financeiro",
    lastGenerated: "Ontem, 23:00",
    popular: true,
  },
  {
    id: "guests",
    icon: Users,
    title: "Perfil de Hóspedes",
    description: "Análise demográfica e comportamental dos hóspedes",
    category: "CRM",
    lastGenerated: "15/12/2024",
  },
  {
    id: "forecast",
    icon: LineChart,
    title: "Previsão de Demanda",
    description: "Projeção de ocupação para os próximos 90 dias",
    category: "Operacional",
    lastGenerated: "Hoje, 07:00",
  },
  {
    id: "channels",
    icon: PieChart,
    title: "Mix de Canais",
    description: "Distribuição de reservas por canal de venda",
    category: "Comercial",
    lastGenerated: "14/12/2024",
  },
  {
    id: "housekeeping",
    icon: BedDouble,
    title: "Governança",
    description: "Produtividade e status de limpeza por camareira",
    category: "Operacional",
  },
  {
    id: "financial",
    icon: FileText,
    title: "Demonstrativo Financeiro",
    description: "DRE completo com receitas, custos e despesas",
    category: "Financeiro",
    lastGenerated: "01/12/2024",
  },
  {
    id: "cancellations",
    icon: BarChart3,
    title: "Cancelamentos",
    description: "Análise de cancelamentos e no-shows por período",
    category: "Operacional",
  },
];

const categoryColors: Record<string, string> = {
  Operacional: "bg-blue-500/10 text-blue-400",
  Financeiro: "bg-emerald-500/10 text-emerald-400",
  CRM: "bg-violet-500/10 text-violet-400",
  Comercial: "bg-amber-500/10 text-amber-400",
};

export default function Reports() {
  const [isSaveReportModalOpen, setIsSaveReportModalOpen] = useState(false);
  const popularReports = reports.filter((r) => r.popular);
  const allReports = reports;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Análises e insights do seu negócio</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button 
              onClick={() => setIsSaveReportModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{reports.length}</p>
                  <p className="text-xs text-muted-foreground">Relatórios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Download className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">156</p>
                  <p className="text-xs text-muted-foreground">Downloads/mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Calendar className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Agendados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Hoje</p>
                  <p className="text-xs text-muted-foreground">Última Atualização</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Reports */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Mais Utilizados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularReports.map((report) => (
              <Card key={report.id} className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <report.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <Badge className={categoryColors[report.category]}>{report.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-blue-400 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {report.lastGenerated}
                    </span>
                    <Button variant="ghost" size="sm" className="text-blue-400">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Reports */}
        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle>Todos os Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <report.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-blue-400 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={categoryColors[report.category]}>{report.category}</Badge>
                    {report.lastGenerated && (
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {report.lastGenerated}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Report Modal */}
        <SaveReportModal 
          open={isSaveReportModalOpen} 
          onOpenChange={setIsSaveReportModalOpen} 
        />
      </div>
    </DashboardLayout>
  );
}
