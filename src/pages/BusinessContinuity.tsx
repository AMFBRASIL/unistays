import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
    Shield,
    Wifi,
    WifiOff,
    Cloud,
    CloudOff,
    Database,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Clock,
    HardDrive,
    Server,
    Activity,
    Download,
    Upload,
    Settings,
    Play,
    Pause,
    History,
    Lock
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const syncStatus = {
    lastSync: "2024-01-15 14:32:00",
    pendingChanges: 12,
    syncProgress: 100,
    isOnline: true,
    offlineCapability: true
};

const backupHistory = [
    { id: 1, type: "Completo", date: "2024-01-15 03:00:00", size: "2.4 GB", duration: "45 min", status: "success", location: "AWS S3" },
    { id: 2, type: "Incremental", date: "2024-01-15 12:00:00", size: "156 MB", duration: "3 min", status: "success", location: "AWS S3" },
    { id: 3, type: "Incremental", date: "2024-01-14 18:00:00", size: "234 MB", duration: "5 min", status: "success", location: "AWS S3" },
    { id: 4, type: "Completo", date: "2024-01-14 03:00:00", size: "2.3 GB", duration: "42 min", status: "success", location: "AWS S3" },
    { id: 5, type: "Incremental", date: "2024-01-13 18:00:00", size: "89 MB", duration: "2 min", status: "warning", location: "AWS S3" }
];

const offlineModules = [
    { id: 1, name: "Check-in/Check-out", enabled: true, dataSize: "45 MB", lastSync: "Agora" },
    { id: 2, name: "Reservas", enabled: true, dataSize: "120 MB", lastSync: "Agora" },
    { id: 3, name: "Hóspedes", enabled: true, dataSize: "85 MB", lastSync: "Agora" },
    { id: 4, name: "Tarifário", enabled: true, dataSize: "12 MB", lastSync: "Agora" },
    { id: 5, name: "Inventário", enabled: false, dataSize: "0 MB", lastSync: "-" },
    { id: 6, name: "Relatórios", enabled: false, dataSize: "0 MB", lastSync: "-" }
];

const recoveryPoints = [
    { id: 1, name: "Backup Diário", date: "2024-01-15 03:00", type: "Automático", retention: "30 dias" },
    { id: 2, name: "Backup Diário", date: "2024-01-14 03:00", type: "Automático", retention: "30 dias" },
    { id: 3, name: "Backup Semanal", date: "2024-01-13 03:00", type: "Automático", retention: "90 dias" },
    { id: 4, name: "Pré-Atualização", date: "2024-01-10 14:30", type: "Manual", retention: "Indefinido" },
    { id: 5, name: "Backup Mensal", date: "2024-01-01 03:00", type: "Automático", retention: "1 ano" }
];

const systemHealth = [
    { component: "Servidor Principal", status: "healthy", uptime: "99.99%", lastCheck: "Agora" },
    { component: "Banco de Dados", status: "healthy", uptime: "99.98%", lastCheck: "Agora" },
    { component: "Storage", status: "healthy", uptime: "100%", lastCheck: "Agora" },
    { component: "API Gateway", status: "healthy", uptime: "99.95%", lastCheck: "Agora" },
    { component: "Cache Redis", status: "warning", uptime: "99.5%", lastCheck: "5 min atrás" },
    { component: "CDN", status: "healthy", uptime: "100%", lastCheck: "Agora" }
];

const BusinessContinuity = () => {
    const [offlineMode, setOfflineMode] = useState(false);
    const [autoSync, setAutoSync] = useState(true);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "success":
            case "healthy":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />OK</Badge>;
            case "warning":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><AlertTriangle className="h-3 w-3 mr-1" />Atenção</Badge>;
            case "error":
                return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Business Continuity</h1>
                        <p className="text-muted-foreground">
                            Modo offline, sincronização e disaster recovery
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar Backup
                        </Button>
                        <Button>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Backup Agora
                        </Button>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className={syncStatus.isOnline ? "border-emerald-500/50" : "border-amber-500/50"}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status Conexão</p>
                                    <p className="text-xl font-bold">{syncStatus.isOnline ? "Online" : "Offline"}</p>
                                </div>
                                {syncStatus.isOnline ? (
                                    <Wifi className="h-8 w-8 text-emerald-500" />
                                ) : (
                                    <WifiOff className="h-8 w-8 text-amber-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Última Sincronização</p>
                                    <p className="text-xl font-bold">14:32</p>
                                </div>
                                <Cloud className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Último Backup</p>
                                    <p className="text-xl font-bold">03:00</p>
                                </div>
                                <Database className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Uptime Sistema</p>
                                    <p className="text-xl font-bold text-emerald-500">99.97%</p>
                                </div>
                                <Activity className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="offline" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="offline">Modo Offline</TabsTrigger>
                        <TabsTrigger value="sync">Sincronização</TabsTrigger>
                        <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
                        <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
                    </TabsList>

                    <TabsContent value="offline" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {offlineMode ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
                                            Modo Offline
                                        </CardTitle>
                                        <CardDescription>Configure quais módulos funcionam sem conexão</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Simular Offline</span>
                                        <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {offlineMode && (
                                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <WifiOff className="h-5 w-5" />
                                            <span className="font-medium">Modo Offline Ativo</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            O sistema está operando localmente. As alterações serão sincronizadas quando a conexão for restabelecida.
                                        </p>
                                    </div>
                                )}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Módulo</TableHead>
                                            <TableHead>Habilitado</TableHead>
                                            <TableHead>Dados Locais</TableHead>
                                            <TableHead>Última Sync</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {offlineModules.map((module) => (
                                            <TableRow key={module.id}>
                                                <TableCell className="font-medium">{module.name}</TableCell>
                                                <TableCell>
                                                    <Switch checked={module.enabled} />
                                                </TableCell>
                                                <TableCell>{module.dataSize}</TableCell>
                                                <TableCell>{module.lastSync}</TableCell>
                                                <TableCell>
                                                    {module.enabled ? (
                                                        <Badge className="bg-emerald-500">Pronto</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Desativado</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Capacidade Offline</CardTitle>
                                <CardDescription>Funcionalidades disponíveis sem conexão</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                                            Funcionalidades Disponíveis
                                        </h4>
                                        <ul className="space-y-2 text-sm">
                                            <li>✓ Check-in e Check-out de hóspedes</li>
                                            <li>✓ Consulta de reservas</li>
                                            <li>✓ Visualização de dados de hóspedes</li>
                                            <li>✓ Consulta de tarifas</li>
                                            <li>✓ Registro de consumos</li>
                                            <li>✓ Governança básica</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2 mb-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            Funcionalidades Limitadas
                                        </h4>
                                        <ul className="space-y-2 text-sm">
                                            <li>⚠ Novas reservas (fila local)</li>
                                            <li>⚠ Pagamentos online</li>
                                            <li>⚠ Integrações com OTAs</li>
                                            <li>⚠ Envio de e-mails</li>
                                            <li>⚠ Relatórios em tempo real</li>
                                            <li>⚠ Sincronização com channel manager</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sync" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Status de Sincronização</CardTitle>
                                        <CardDescription>Monitoramento da sincronização de dados</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Auto-sync</span>
                                        <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="text-2xl font-bold">0</p>
                                        <p className="text-sm text-muted-foreground">Pendente Upload</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="text-2xl font-bold">0</p>
                                        <p className="text-sm text-muted-foreground">Pendente Download</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg text-center">
                                        <RefreshCw className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                                        <p className="text-2xl font-bold text-emerald-500">Sincronizado</p>
                                        <p className="text-sm text-muted-foreground">Status Atual</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Progresso da Sincronização</span>
                                        <span className="text-sm text-muted-foreground">100%</span>
                                    </div>
                                    <Progress value={100} className="h-2" />
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-3">Configurações de Sync</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span>Intervalo de sincronização</span>
                                            <Badge variant="outline">5 minutos</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Compressão de dados</span>
                                            <Badge className="bg-emerald-500">Ativada</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Criptografia em trânsito</span>
                                            <Badge className="bg-emerald-500">TLS 1.3</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="backup" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Histórico de Backups</CardTitle>
                                    <CardDescription>Backups realizados recentemente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Tamanho</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {backupHistory.map((backup) => (
                                                <TableRow key={backup.id}>
                                                    <TableCell>
                                                        <Badge variant="outline">{backup.type}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">{backup.date}</TableCell>
                                                    <TableCell>{backup.size}</TableCell>
                                                    <TableCell>{getStatusBadge(backup.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Pontos de Recuperação</CardTitle>
                                    <CardDescription>Restaure o sistema para um ponto anterior</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recoveryPoints.map((point) => (
                                                <TableRow key={point.id}>
                                                    <TableCell className="font-medium">{point.name}</TableCell>
                                                    <TableCell className="text-sm">{point.date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{point.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            <History className="h-4 w-4 mr-1" />
                                                            Restaurar
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Configurações de Backup</CardTitle>
                                <CardDescription>Defina a política de backup e retenção</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-3">Backup Diário</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Horário:</strong> 03:00</p>
                                            <p><strong>Tipo:</strong> Completo</p>
                                            <p><strong>Retenção:</strong> 30 dias</p>
                                            <p><strong>Destino:</strong> AWS S3</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-3">Backup Incremental</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Intervalo:</strong> 6 horas</p>
                                            <p><strong>Tipo:</strong> Incremental</p>
                                            <p><strong>Retenção:</strong> 7 dias</p>
                                            <p><strong>Destino:</strong> AWS S3</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-3">Backup Semanal</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Dia:</strong> Domingo</p>
                                            <p><strong>Tipo:</strong> Completo</p>
                                            <p><strong>Retenção:</strong> 90 dias</p>
                                            <p><strong>Destino:</strong> AWS S3 + Glacier</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="health" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Saúde do Sistema</CardTitle>
                                <CardDescription>Monitoramento em tempo real de todos os componentes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Componente</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Uptime</TableHead>
                                            <TableHead>Última Verificação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {systemHealth.map((component, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Server className="h-4 w-4" />
                                                        {component.component}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(component.status)}</TableCell>
                                                <TableCell>
                                                    <span className={component.uptime === "100%" ? "text-emerald-500" : ""}>
                                                        {component.uptime}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{component.lastCheck}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HardDrive className="h-5 w-5" />
                                        Uso de Storage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Banco de Dados</span>
                                            <span>24.5 GB / 100 GB</span>
                                        </div>
                                        <Progress value={24.5} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Arquivos</span>
                                            <span>156 GB / 500 GB</span>
                                        </div>
                                        <Progress value={31.2} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Backups</span>
                                            <span>89 GB / 200 GB</span>
                                        </div>
                                        <Progress value={44.5} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Disaster Recovery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">RTO (Recovery Time Objective)</p>
                                            <p className="text-sm text-muted-foreground">Tempo máximo de recuperação</p>
                                        </div>
                                        <Badge className="bg-emerald-500">4 horas</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">RPO (Recovery Point Objective)</p>
                                            <p className="text-sm text-muted-foreground">Perda máxima de dados</p>
                                        </div>
                                        <Badge className="bg-emerald-500">1 hora</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div>
                                            <p className="font-medium">Último Teste de DR</p>
                                            <p className="text-sm text-muted-foreground">Validação do plano</p>
                                        </div>
                                        <Badge variant="outline">Jan 10, 2024</Badge>
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

export default BusinessContinuity;
