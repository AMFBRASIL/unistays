import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Shield,
    Search,
    Download,
    Filter,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    LogIn,
    LogOut,
    Settings,
    Database,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock,
    User,
    Calendar,
    Activity,
    Lock,
    Unlock,
    RefreshCw
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const auditLogs = [
    {
        id: "LOG001",
        timestamp: "2024-01-15 14:32:15",
        user: "João Silva",
        userRole: "Gerente",
        action: "UPDATE",
        module: "Reservas",
        resource: "Reserva #RES-2024-001",
        details: "Alterou status de 'Confirmada' para 'Check-in'",
        ipAddress: "192.168.1.45",
        severity: "info",
        success: true
    },
    {
        id: "LOG002",
        timestamp: "2024-01-15 14:28:03",
        user: "Maria Santos",
        userRole: "Recepcionista",
        action: "CREATE",
        module: "Hóspedes",
        resource: "Hóspede Carlos Oliveira",
        details: "Novo cadastro de hóspede criado",
        ipAddress: "192.168.1.22",
        severity: "info",
        success: true
    },
    {
        id: "LOG003",
        timestamp: "2024-01-15 14:15:47",
        user: "Admin Sistema",
        userRole: "Administrador",
        action: "DELETE",
        module: "Usuários",
        resource: "Usuário temporário",
        details: "Exclusão de conta temporária expirada",
        ipAddress: "192.168.1.1",
        severity: "warning",
        success: true
    },
    {
        id: "LOG004",
        timestamp: "2024-01-15 13:58:22",
        user: "Pedro Alves",
        userRole: "Financeiro",
        action: "EXPORT",
        module: "Relatórios",
        resource: "Relatório Financeiro Jan/2024",
        details: "Exportação de dados sensíveis para PDF",
        ipAddress: "192.168.1.67",
        severity: "warning",
        success: true
    },
    {
        id: "LOG005",
        timestamp: "2024-01-15 13:45:11",
        user: "Desconhecido",
        userRole: "-",
        action: "LOGIN_FAILED",
        module: "Autenticação",
        resource: "Sistema",
        details: "Tentativa de login falha - senha incorreta (3ª tentativa)",
        ipAddress: "201.45.78.123",
        severity: "critical",
        success: false
    },
    {
        id: "LOG006",
        timestamp: "2024-01-15 13:30:00",
        user: "Sistema",
        userRole: "Automático",
        action: "BACKUP",
        module: "Database",
        resource: "Backup diário",
        details: "Backup automático concluído com sucesso",
        ipAddress: "localhost",
        severity: "info",
        success: true
    },
    {
        id: "LOG007",
        timestamp: "2024-01-15 12:15:33",
        user: "Ana Costa",
        userRole: "Gerente",
        action: "ACCESS",
        module: "LGPD",
        resource: "Dados Pessoais",
        details: "Acesso a dados pessoais de hóspede para solicitação de portabilidade",
        ipAddress: "192.168.1.89",
        severity: "warning",
        success: true
    }
];

const complianceChecks = [
    { id: 1, name: "Criptografia de Dados", status: "compliant", lastCheck: "2024-01-15", framework: "LGPD" },
    { id: 2, name: "Backup Automático", status: "compliant", lastCheck: "2024-01-15", framework: "ISO 27001" },
    { id: 3, name: "Controle de Acesso", status: "compliant", lastCheck: "2024-01-14", framework: "LGPD" },
    { id: 4, name: "Logs de Auditoria", status: "compliant", lastCheck: "2024-01-15", framework: "GDPR" },
    { id: 5, name: "Consentimento de Dados", status: "warning", lastCheck: "2024-01-13", framework: "LGPD" },
    { id: 6, name: "Retenção de Dados", status: "compliant", lastCheck: "2024-01-15", framework: "GDPR" },
    { id: 7, name: "Anonimização", status: "non_compliant", lastCheck: "2024-01-10", framework: "LGPD" },
    { id: 8, name: "Direito ao Esquecimento", status: "compliant", lastCheck: "2024-01-14", framework: "GDPR" }
];

const dataRequests = [
    { id: "REQ001", type: "Portabilidade", requester: "Carlos Oliveira", date: "2024-01-14", status: "pending", deadline: "2024-01-29" },
    { id: "REQ002", type: "Exclusão", requester: "Maria Fernandes", date: "2024-01-12", status: "completed", deadline: "2024-01-27" },
    { id: "REQ003", type: "Acesso", requester: "João Santos", date: "2024-01-10", status: "in_progress", deadline: "2024-01-25" },
    { id: "REQ004", type: "Retificação", requester: "Ana Paula", date: "2024-01-08", status: "completed", deadline: "2024-01-23" }
];

const AuditTrail = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState("all");
    const [selectedSeverity, setSelectedSeverity] = useState("all");

    const getActionIcon = (action: string) => {
        switch (action) {
            case "CREATE": return <UserPlus className="h-4 w-4" />;
            case "UPDATE": return <Edit className="h-4 w-4" />;
            case "DELETE": return <Trash2 className="h-4 w-4" />;
            case "LOGIN": return <LogIn className="h-4 w-4" />;
            case "LOGOUT": return <LogOut className="h-4 w-4" />;
            case "LOGIN_FAILED": return <AlertTriangle className="h-4 w-4" />;
            case "ACCESS": return <Eye className="h-4 w-4" />;
            case "EXPORT": return <Download className="h-4 w-4" />;
            case "BACKUP": return <Database className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "critical":
                return <Badge variant="destructive">Crítico</Badge>;
            case "warning":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Atenção</Badge>;
            case "info":
                return <Badge variant="secondary">Info</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    };

    const getComplianceStatus = (status: string) => {
        switch (status) {
            case "compliant":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Conforme</Badge>;
            case "warning":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><AlertTriangle className="h-3 w-3 mr-1" />Atenção</Badge>;
            case "non_compliant":
                return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Não Conforme</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getRequestStatus = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>;
            case "in_progress":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Em Andamento</Badge>;
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Pendente</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === "all" || log.module === selectedModule;
        const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
        return matchesSearch && matchesModule && matchesSeverity;
    });

    const complianceStats = {
        total: complianceChecks.length,
        compliant: complianceChecks.filter(c => c.status === "compliant").length,
        warning: complianceChecks.filter(c => c.status === "warning").length,
        nonCompliant: complianceChecks.filter(c => c.status === "non_compliant").length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Audit Trail & Compliance</h1>
                        <p className="text-muted-foreground">
                            Log completo de ações, conformidade LGPD/GDPR e relatórios de auditoria
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Atualizar
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar Logs
                        </Button>
                        <Button>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar Relatório
                        </Button>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Logs (24h)</p>
                                    <p className="text-2xl font-bold">1.247</p>
                                </div>
                                <Activity className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                                    <p className="text-2xl font-bold text-destructive">3</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Conformidade LGPD</p>
                                    <p className="text-2xl font-bold text-emerald-500">{Math.round((complianceStats.compliant / complianceStats.total) * 100)}%</p>
                                </div>
                                <Shield className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Solicitações Pendentes</p>
                                    <p className="text-2xl font-bold text-amber-500">{dataRequests.filter(r => r.status === "pending").length}</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="logs" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
                        <TabsTrigger value="compliance">Conformidade</TabsTrigger>
                        <TabsTrigger value="lgpd">LGPD/GDPR</TabsTrigger>
                        <TabsTrigger value="reports">Relatórios</TabsTrigger>
                    </TabsList>

                    <TabsContent value="logs" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por usuário, recurso ou detalhes..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Módulo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os Módulos</SelectItem>
                                            <SelectItem value="Reservas">Reservas</SelectItem>
                                            <SelectItem value="Hóspedes">Hóspedes</SelectItem>
                                            <SelectItem value="Usuários">Usuários</SelectItem>
                                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                                            <SelectItem value="Autenticação">Autenticação</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Severidade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="critical">Crítico</SelectItem>
                                            <SelectItem value="warning">Atenção</SelectItem>
                                            <SelectItem value="info">Info</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logs Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Ações</CardTitle>
                                <CardDescription>Registro completo de todas as ações no sistema</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Ação</TableHead>
                                            <TableHead>Módulo</TableHead>
                                            <TableHead>Recurso</TableHead>
                                            <TableHead>Detalhes</TableHead>
                                            <TableHead>IP</TableHead>
                                            <TableHead>Severidade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.map((log) => (
                                            <TableRow key={log.id} className={!log.success ? "bg-destructive/10" : ""}>
                                                <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{log.user}</p>
                                                        <p className="text-xs text-muted-foreground">{log.userRole}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getActionIcon(log.action)}
                                                        <span>{log.action}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{log.module}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{log.resource}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{log.details}</TableCell>
                                                <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                                                <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-emerald-500/50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-emerald-500">{complianceStats.compliant}</p>
                                        <p className="text-muted-foreground">Conformes</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-500/50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-amber-500">{complianceStats.warning}</p>
                                        <p className="text-muted-foreground">Atenção</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-destructive/50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-destructive">{complianceStats.nonCompliant}</p>
                                        <p className="text-muted-foreground">Não Conformes</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Verificações de Conformidade</CardTitle>
                                <CardDescription>Status das verificações de segurança e conformidade</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Verificação</TableHead>
                                            <TableHead>Framework</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Última Verificação</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {complianceChecks.map((check) => (
                                            <TableRow key={check.id}>
                                                <TableCell className="font-medium">{check.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{check.framework}</Badge>
                                                </TableCell>
                                                <TableCell>{getComplianceStatus(check.status)}</TableCell>
                                                <TableCell>{check.lastCheck}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Verificar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lgpd" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Direitos do Titular
                                    </CardTitle>
                                    <CardDescription>Solicitações de dados pessoais dos hóspedes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Solicitante</TableHead>
                                                <TableHead>Prazo</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dataRequests.map((request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell className="font-mono">{request.id}</TableCell>
                                                    <TableCell>{request.type}</TableCell>
                                                    <TableCell>{request.requester}</TableCell>
                                                    <TableCell>{request.deadline}</TableCell>
                                                    <TableCell>{getRequestStatus(request.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Bases Legais
                                    </CardTitle>
                                    <CardDescription>Fundamentação para tratamento de dados</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Execução de Contrato</p>
                                            <p className="text-sm text-muted-foreground">Reservas e hospedagem</p>
                                        </div>
                                        <Badge className="bg-emerald-500">Ativo</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Obrigação Legal</p>
                                            <p className="text-sm text-muted-foreground">FNRH e dados fiscais</p>
                                        </div>
                                        <Badge className="bg-emerald-500">Ativo</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Consentimento</p>
                                            <p className="text-sm text-muted-foreground">Marketing e comunicações</p>
                                        </div>
                                        <Badge className="bg-amber-500">Revisar</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Legítimo Interesse</p>
                                            <p className="text-sm text-muted-foreground">Análises e melhorias</p>
                                        </div>
                                        <Badge className="bg-emerald-500">Ativo</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="cursor-pointer hover:border-primary transition-colors">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Relatório de Auditoria</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Relatório completo de todas as ações e acessos
                                        </p>
                                        <Button className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Gerar Relatório
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary transition-colors">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Relatório LGPD</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Conformidade com a Lei Geral de Proteção de Dados
                                        </p>
                                        <Button className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Gerar Relatório
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:border-primary transition-colors">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Relatório de Segurança</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Análise de vulnerabilidades e incidentes
                                        </p>
                                        <Button className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Gerar Relatório
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default AuditTrail;
