import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    Search,
    Plus,
    DollarSign,
    Award,
    ClipboardCheck,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Star,
    FileText,
    Eye,
    BarChart3,
    Settings,
    Users,
    Calendar
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const franchises = [
    {
        id: "FR001",
        name: "Hotel Exemplo - São Paulo",
        location: "São Paulo, SP",
        owner: "Grupo ABC Hotéis",
        contractDate: "2022-03-15",
        renewalDate: "2027-03-15",
        rooms: 120,
        qualityScore: 92,
        royaltyRate: 5.5,
        monthlyRevenue: 485000,
        status: "active",
        lastAudit: "2024-01-10",
        auditScore: 88
    },
    {
        id: "FR002",
        name: "Hotel Exemplo - Rio de Janeiro",
        location: "Rio de Janeiro, RJ",
        owner: "Investimentos Hoteleiros Ltda",
        contractDate: "2021-08-01",
        renewalDate: "2026-08-01",
        rooms: 200,
        qualityScore: 95,
        royaltyRate: 5.0,
        monthlyRevenue: 720000,
        status: "active",
        lastAudit: "2024-01-05",
        auditScore: 94
    },
    {
        id: "FR003",
        name: "Hotel Exemplo - Belo Horizonte",
        location: "Belo Horizonte, MG",
        owner: "MG Hospitality",
        contractDate: "2023-01-20",
        renewalDate: "2028-01-20",
        rooms: 80,
        qualityScore: 78,
        royaltyRate: 6.0,
        monthlyRevenue: 280000,
        status: "warning",
        lastAudit: "2023-12-20",
        auditScore: 72
    },
    {
        id: "FR004",
        name: "Hotel Exemplo - Salvador",
        location: "Salvador, BA",
        owner: "Nordeste Hotels Group",
        contractDate: "2020-06-10",
        renewalDate: "2025-06-10",
        rooms: 150,
        qualityScore: 88,
        royaltyRate: 5.5,
        monthlyRevenue: 420000,
        status: "renewal_pending",
        lastAudit: "2024-01-08",
        auditScore: 85
    }
];

const royaltyPayments = [
    { id: 1, franchise: "São Paulo", month: "Janeiro/2024", revenue: 485000, rate: 5.5, royalty: 26675, status: "paid", paymentDate: "2024-02-05" },
    { id: 2, franchise: "Rio de Janeiro", month: "Janeiro/2024", revenue: 720000, rate: 5.0, royalty: 36000, status: "paid", paymentDate: "2024-02-05" },
    { id: 3, franchise: "Belo Horizonte", month: "Janeiro/2024", revenue: 280000, rate: 6.0, royalty: 16800, status: "pending", paymentDate: "-" },
    { id: 4, franchise: "Salvador", month: "Janeiro/2024", revenue: 420000, rate: 5.5, royalty: 23100, status: "paid", paymentDate: "2024-02-04" }
];

const brandStandards = [
    { id: 1, category: "Atendimento", items: 25, compliance: 92 },
    { id: 2, category: "Limpeza", items: 30, compliance: 88 },
    { id: 3, category: "Manutenção", items: 20, compliance: 85 },
    { id: 4, category: "Alimentos & Bebidas", items: 35, compliance: 90 },
    { id: 5, category: "Segurança", items: 15, compliance: 95 },
    { id: 6, category: "Tecnologia", items: 10, compliance: 78 }
];

const qualityAudits = [
    { id: "AUD001", franchise: "São Paulo", date: "2024-01-10", auditor: "Maria Silva", score: 88, status: "completed", findings: 3 },
    { id: "AUD002", franchise: "Rio de Janeiro", date: "2024-01-05", auditor: "Carlos Santos", score: 94, status: "completed", findings: 1 },
    { id: "AUD003", franchise: "Belo Horizonte", date: "2023-12-20", auditor: "Ana Costa", score: 72, status: "action_required", findings: 8 },
    { id: "AUD004", franchise: "Salvador", date: "2024-01-08", auditor: "Pedro Alves", score: 85, status: "completed", findings: 4 }
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const FranchiseManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>;
            case "warning":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Atenção</Badge>;
            case "renewal_pending":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Renovação Pendente</Badge>;
            case "suspended":
                return <Badge variant="destructive">Suspenso</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentStatus = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Pago</Badge>;
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Pendente</Badge>;
            case "overdue":
                return <Badge variant="destructive">Atrasado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getAuditStatus = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluída</Badge>;
            case "action_required":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Ação Necessária</Badge>;
            case "scheduled":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Agendada</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-500";
        if (score >= 80) return "text-blue-500";
        if (score >= 70) return "text-amber-500";
        return "text-destructive";
    };

    const totalRoyalties = royaltyPayments.reduce((sum, p) => sum + p.royalty, 0);
    const paidRoyalties = royaltyPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.royalty, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Gestão de Franquias</h1>
                        <p className="text-muted-foreground">
                            Royalties, padrões de marca e auditorias de qualidade
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Relatórios
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Franquia
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Franquias</p>
                                    <p className="text-2xl font-bold">{franchises.length}</p>
                                </div>
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Royalties Mês</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRoyalties)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Score Médio</p>
                                    <p className="text-2xl font-bold text-blue-500">
                                        {Math.round(franchises.reduce((sum, f) => sum + f.qualityScore, 0) / franchises.length)}%
                                    </p>
                                </div>
                                <Award className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Auditorias Pendentes</p>
                                    <p className="text-2xl font-bold text-amber-500">
                                        {qualityAudits.filter(a => a.status === "action_required").length}
                                    </p>
                                </div>
                                <ClipboardCheck className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="franchises" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="franchises">Franquias</TabsTrigger>
                        <TabsTrigger value="royalties">Royalties</TabsTrigger>
                        <TabsTrigger value="standards">Padrões de Marca</TabsTrigger>
                        <TabsTrigger value="audits">Auditorias</TabsTrigger>
                    </TabsList>

                    <TabsContent value="franchises" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Franquias Ativas</CardTitle>
                                        <CardDescription>Gerenciamento de todas as unidades franqueadas</CardDescription>
                                    </div>
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar franquia..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Unidade</TableHead>
                                            <TableHead>Proprietário</TableHead>
                                            <TableHead>UHs</TableHead>
                                            <TableHead>Quality Score</TableHead>
                                            <TableHead>Royalty</TableHead>
                                            <TableHead>Receita Mensal</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {franchises.map((franchise) => (
                                            <TableRow key={franchise.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{franchise.name}</p>
                                                        <p className="text-sm text-muted-foreground">{franchise.location}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{franchise.owner}</TableCell>
                                                <TableCell>{franchise.rooms}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold ${getScoreColor(franchise.qualityScore)}`}>
                                                            {franchise.qualityScore}%
                                                        </span>
                                                        <Progress value={franchise.qualityScore} className="w-16 h-2" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>{franchise.royaltyRate}%</TableCell>
                                                <TableCell>{formatCurrency(franchise.monthlyRevenue)}</TableCell>
                                                <TableCell>{getStatusBadge(franchise.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <BarChart3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="royalties" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Total Esperado</p>
                                        <p className="text-2xl font-bold">{formatCurrency(totalRoyalties)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Total Recebido</p>
                                        <p className="text-2xl font-bold text-emerald-500">{formatCurrency(paidRoyalties)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Pendente</p>
                                        <p className="text-2xl font-bold text-amber-500">{formatCurrency(totalRoyalties - paidRoyalties)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pagamentos de Royalties</CardTitle>
                                <CardDescription>Histórico de pagamentos das franquias</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Franquia</TableHead>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Receita Base</TableHead>
                                            <TableHead>Taxa</TableHead>
                                            <TableHead>Valor Royalty</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data Pagamento</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {royaltyPayments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">{payment.franchise}</TableCell>
                                                <TableCell>{payment.month}</TableCell>
                                                <TableCell>{formatCurrency(payment.revenue)}</TableCell>
                                                <TableCell>{payment.rate}%</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(payment.royalty)}</TableCell>
                                                <TableCell>{getPaymentStatus(payment.status)}</TableCell>
                                                <TableCell>{payment.paymentDate}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="standards" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Padrões de Marca</CardTitle>
                                <CardDescription>Conformidade com os padrões estabelecidos pela rede</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {brandStandards.map((standard) => (
                                        <Card key={standard.id}>
                                            <CardContent className="pt-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">{standard.category}</h4>
                                                        <span className={`text-lg font-bold ${getScoreColor(standard.compliance)}`}>
                                                            {standard.compliance}%
                                                        </span>
                                                    </div>
                                                    <Progress value={standard.compliance} className="h-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {standard.items} itens de verificação
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Checklist de Padrões</CardTitle>
                                <CardDescription>Manual de padrões e procedimentos da marca</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div>
                                                <h4 className="font-semibold">Manual de Operações</h4>
                                                <p className="text-sm text-muted-foreground">Versão 3.2 - Atualizado em Jan/2024</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Visualizar
                                        </Button>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Award className="h-8 w-8 text-primary" />
                                            <div>
                                                <h4 className="font-semibold">Padrões de Qualidade</h4>
                                                <p className="text-sm text-muted-foreground">Versão 2.1 - Atualizado em Dez/2023</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" />
                                            Visualizar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="audits" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Auditorias de Qualidade</CardTitle>
                                        <CardDescription>Histórico e agendamento de auditorias</CardDescription>
                                    </div>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agendar Auditoria
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Franquia</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Auditor</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Achados</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {qualityAudits.map((audit) => (
                                            <TableRow key={audit.id}>
                                                <TableCell className="font-mono">{audit.id}</TableCell>
                                                <TableCell className="font-medium">{audit.franchise}</TableCell>
                                                <TableCell>{audit.date}</TableCell>
                                                <TableCell>{audit.auditor}</TableCell>
                                                <TableCell>
                                                    <span className={`font-bold ${getScoreColor(audit.score)}`}>
                                                        {audit.score}%
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={audit.findings > 5 ? "destructive" : "secondary"}>
                                                        {audit.findings} {audit.findings === 1 ? "achado" : "achados"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getAuditStatus(audit.status)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Detalhes
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default FranchiseManagement;
