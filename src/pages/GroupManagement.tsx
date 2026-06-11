import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Plus,
    FileText,
    Calendar,
    Clock,
    DollarSign,
    Building2,
    UserCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Download,
    Upload,
    Edit,
    Eye,
    Trash2,
    Send,
    Copy,
    Lock,
    Unlock,
    BedDouble,
    ClipboardList,
    Briefcase,
    TrendingUp,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import { NewGroupModal } from '@/components/groups/NewGroupModal';
import { RoomingListModal } from '@/components/groups/RoomingListModal';
import { GroupContractModal } from '@/components/groups/GroupContractModal';
import { BlockingModal } from '@/components/groups/BlockingModal';
import { NewContractModal } from '@/components/contracts/NewContractModal';
import { ViewContractModal } from '@/components/contracts/ViewContractModal';
import { cn } from '@/lib/utils';

// Mock data
const groups = [
    {
        id: 'GRP001',
        name: 'Conferência Tech Brasil 2024',
        company: 'TechCorp Ltda',
        contactName: 'Carlos Silva',
        contactEmail: 'carlos@techcorp.com.br',
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        roomsBlocked: 45,
        roomsConfirmed: 38,
        roomsAvailable: 7,
        cutOffDate: '2024-03-01',
        status: 'confirmed',
        totalValue: 125000,
        depositPaid: 50000,
        paymentStatus: 'partial',
        contractSigned: true,
        specialRequests: 'Coffee break incluído, sala de reunião reservada'
    },
    {
        id: 'GRP002',
        name: 'Casamento Oliveira-Santos',
        company: 'Particular',
        contactName: 'Ana Oliveira',
        contactEmail: 'ana.oliveira@email.com',
        checkIn: '2024-04-20',
        checkOut: '2024-04-22',
        roomsBlocked: 25,
        roomsConfirmed: 25,
        roomsAvailable: 0,
        cutOffDate: '2024-04-05',
        status: 'confirmed',
        totalValue: 75000,
        depositPaid: 75000,
        paymentStatus: 'paid',
        contractSigned: true,
        specialRequests: 'Decoração especial, late checkout'
    },
    {
        id: 'GRP003',
        name: 'Evento Farmacêutica Nacional',
        company: 'PharmaCorp',
        contactName: 'Roberto Mendes',
        contactEmail: 'roberto@pharmacorp.com',
        checkIn: '2024-05-10',
        checkOut: '2024-05-13',
        roomsBlocked: 60,
        roomsConfirmed: 42,
        roomsAvailable: 18,
        cutOffDate: '2024-04-25',
        status: 'pending',
        totalValue: 180000,
        depositPaid: 0,
        paymentStatus: 'pending',
        contractSigned: false,
        specialRequests: 'Auditório para 200 pessoas'
    },
    {
        id: 'GRP004',
        name: 'Congresso Médico Regional',
        company: 'Associação Médica',
        contactName: 'Dra. Fernanda Lima',
        contactEmail: 'fernanda@assocmedica.org',
        checkIn: '2024-06-05',
        checkOut: '2024-06-08',
        roomsBlocked: 80,
        roomsConfirmed: 15,
        roomsAvailable: 65,
        cutOffDate: '2024-05-20',
        status: 'blocked',
        totalValue: 240000,
        depositPaid: 50000,
        paymentStatus: 'partial',
        contractSigned: true,
        specialRequests: 'Espaço para exposição de equipamentos'
    }
];

const roomingList = [
    { guestName: 'João Silva', roomType: 'Standard', roomNumber: '101', status: 'confirmed', specialRequests: '' },
    { guestName: 'Maria Santos', roomType: 'Superior', roomNumber: '205', status: 'confirmed', specialRequests: 'Travesseiro extra' },
    { guestName: 'Pedro Costa', roomType: 'Standard', roomNumber: '102', status: 'pending', specialRequests: '' },
    { guestName: 'Ana Oliveira', roomType: 'Luxo', roomNumber: '301', status: 'confirmed', specialRequests: 'Vista para o mar' },
    { guestName: 'Carlos Ferreira', roomType: 'Standard', roomNumber: '', status: 'unassigned', specialRequests: '' },
];

const blocks = [
    {
        id: 'BLK001',
        name: 'Temporada Alta 2024',
        startDate: '2024-12-20',
        endDate: '2025-01-05',
        roomsBlocked: 100,
        type: 'seasonal',
        status: 'active',
        reason: 'Reserva de quartos para alta temporada'
    },
    {
        id: 'BLK002',
        name: 'Manutenção Ala Norte',
        startDate: '2024-03-01',
        endDate: '2024-03-15',
        roomsBlocked: 20,
        type: 'maintenance',
        status: 'active',
        reason: 'Reforma dos banheiros'
    },
    {
        id: 'BLK003',
        name: 'Evento VIP',
        startDate: '2024-04-10',
        endDate: '2024-04-12',
        roomsBlocked: 10,
        type: 'vip',
        status: 'scheduled',
        reason: 'Reserva para hóspedes especiais'
    }
];

// Corporate Contracts data
interface CorporateContract {
    id: string;
    company: string;
    logo?: string;
    cnpj: string;
    contact: string;
    email: string;
    phone: string;
    address: string;
    discount: number;
    validFrom: string;
    validTo: string;
    status: "active" | "expiring" | "expired" | "pending";
    roomNightsUsed: number;
    roomNightsLimit: number;
    totalRevenue: number;
    lastBooking: string;
}

const corporateContracts: CorporateContract[] = [
    {
        id: "1",
        company: "TechCorp Brasil",
        cnpj: "12.345.678/0001-90",
        contact: "Roberto Silva",
        email: "roberto@techcorp.com.br",
        phone: "(11) 98765-4321",
        address: "Av. Paulista, 1000 - São Paulo, SP",
        discount: 25,
        validFrom: "2024-01-01",
        validTo: "2024-12-31",
        status: "active",
        roomNightsUsed: 450,
        roomNightsLimit: 600,
        totalRevenue: 225000,
        lastBooking: "2024-12-10"
    },
    {
        id: "2",
        company: "Banco Nacional",
        cnpj: "98.765.432/0001-10",
        contact: "Marina Costa",
        email: "marina@banconacional.com.br",
        phone: "(21) 99876-5432",
        address: "Av. Rio Branco, 500 - Rio de Janeiro, RJ",
        discount: 30,
        validFrom: "2024-01-01",
        validTo: "2025-01-31",
        status: "active",
        roomNightsUsed: 280,
        roomNightsLimit: 400,
        totalRevenue: 168000,
        lastBooking: "2024-12-12"
    },
    {
        id: "3",
        company: "Consultoria Global",
        cnpj: "11.222.333/0001-44",
        contact: "Pedro Mendes",
        email: "pedro@consultoriaglobal.com",
        phone: "(31) 97654-3210",
        address: "Av. Afonso Pena, 2000 - Belo Horizonte, MG",
        discount: 20,
        validFrom: "2024-06-01",
        validTo: "2024-12-31",
        status: "expiring",
        roomNightsUsed: 180,
        roomNightsLimit: 200,
        totalRevenue: 90000,
        lastBooking: "2024-12-08"
    },
    {
        id: "4",
        company: "Indústria Metalúrgica ABC",
        cnpj: "55.666.777/0001-88",
        contact: "João Ferreira",
        email: "joao@metalurgicaabc.com.br",
        phone: "(41) 96543-2109",
        address: "Av. Industrial, 100 - Curitiba, PR",
        discount: 15,
        validFrom: "2023-01-01",
        validTo: "2023-12-31",
        status: "expired",
        roomNightsUsed: 120,
        roomNightsLimit: 150,
        totalRevenue: 54000,
        lastBooking: "2023-11-20"
    },
];

const contractStatusConfig = {
    active: { label: "Ativo", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
    expiring: { label: "Expirando", color: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
    expired: { label: "Expirado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
    pending: { label: "Pendente", color: "bg-primary/10 text-primary border-primary/20", icon: Clock },
};

export default function GroupManagement() {
    const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
    const [isRoomingListModalOpen, setIsRoomingListModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isBlockingModalOpen, setIsBlockingModalOpen] = useState(false);
    const [isCorporateContractModalOpen, setIsCorporateContractModalOpen] = useState(false);
    const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);
    const [selectedCorporateContract, setSelectedCorporateContract] = useState<CorporateContract | null>(null);
    const [editCorporateContract, setEditCorporateContract] = useState<CorporateContract | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [corporateSearchTerm, setCorporateSearchTerm] = useState('');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-success/10 text-success border-success/20',
            pending: 'bg-warning/10 text-warning border-warning/20',
            blocked: 'bg-primary/10 text-primary border-primary/20',
            cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
        };
        const labels: Record<string, string> = {
            confirmed: 'Confirmado',
            pending: 'Pendente',
            blocked: 'Bloqueado',
            cancelled: 'Cancelado'
        };
        return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
    };

    const getPaymentBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-success/10 text-success border-success/20',
            partial: 'bg-warning/10 text-warning border-warning/20',
            pending: 'bg-muted text-muted-foreground border-border'
        };
        const labels: Record<string, string> = {
            paid: 'Pago',
            partial: 'Parcial',
            pending: 'Pendente'
        };
        return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
    };

    const getBlockTypeBadge = (type: string) => {
        const styles: Record<string, string> = {
            seasonal: 'bg-primary/10 text-primary border-primary/20',
            maintenance: 'bg-warning/10 text-warning border-warning/20',
            vip: 'bg-accent/10 text-accent border-accent/20',
            group: 'bg-success/10 text-success border-success/20'
        };
        const labels: Record<string, string> = {
            seasonal: 'Temporada',
            maintenance: 'Manutenção',
            vip: 'VIP',
            group: 'Grupo'
        };
        return <Badge variant="outline" className={styles[type]}>{labels[type]}</Badge>;
    };

    const openRoomingList = (group: typeof groups[0]) => {
        setSelectedGroup(group);
        setIsRoomingListModalOpen(true);
    };

    const openContract = (group: typeof groups[0]) => {
        setSelectedGroup(group);
        setIsContractModalOpen(true);
    };

    const handleViewCorporateContract = (contract: CorporateContract) => {
        setSelectedCorporateContract(contract);
        setIsViewContractModalOpen(true);
    };

    const handleEditCorporateContract = (contract: CorporateContract) => {
        setEditCorporateContract(contract);
        setIsCorporateContractModalOpen(true);
    };

    const handleNewCorporateContract = () => {
        setEditCorporateContract(null);
        setIsCorporateContractModalOpen(true);
    };

    // Stats - Groups
    const totalGroups = groups.length;
    const confirmedGroups = groups.filter(g => g.status === 'confirmed').length;
    const totalRoomsBlocked = groups.reduce((sum, g) => sum + g.roomsBlocked, 0);
    const totalRevenue = groups.reduce((sum, g) => sum + g.totalValue, 0);
    const pendingDeposits = groups.reduce((sum, g) => sum + (g.totalValue - g.depositPaid), 0);
    const upcomingCutoffs = groups.filter(g => {
        const cutoff = new Date(g.cutOffDate);
        const today = new Date();
        const diff = (cutoff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff > 0;
    }).length;

    // Stats - Corporate Contracts
    const activeContracts = corporateContracts.filter(c => c.status === 'active').length;
    const contractsRevenue = corporateContracts.reduce((acc, c) => acc + c.totalRevenue, 0);
    const totalRoomNights = corporateContracts.reduce((acc, c) => acc + c.roomNightsUsed, 0);
    const expiringContracts = corporateContracts.filter(c => c.status === 'expiring').length;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Gestão Comercial B2B</h1>
                        <p className="text-muted-foreground">Grupos, bloqueios, contratos corporativos e faturamento</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsBlockingModalOpen(true)}>
                            <Lock className="h-4 w-4 mr-2" />
                            Novo Bloqueio
                        </Button>
                        <Button variant="outline" onClick={handleNewCorporateContract}>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Novo Contrato
                        </Button>
                        <Button onClick={() => setIsNewGroupModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Grupo
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Grupos Ativos</p>
                                    <p className="text-xl font-bold text-foreground">{totalGroups}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-success/10">
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Confirmados</p>
                                    <p className="text-xl font-bold text-foreground">{confirmedGroups}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-accent/10">
                                    <BedDouble className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Quartos Bloqueados</p>
                                    <p className="text-xl font-bold text-foreground">{totalRoomsBlocked}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Receita Total</p>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-warning/10">
                                    <Clock className="h-5 w-5 text-warning" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">A Receber</p>
                                    <p className="text-lg font-bold text-foreground">{formatCurrency(pendingDeposits)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Cut-offs Próximos</p>
                                    <p className="text-xl font-bold text-foreground">{upcomingCutoffs}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="groups" className="space-y-4">
                    <TabsList className="bg-muted/50">
                        <TabsTrigger value="groups">Grupos</TabsTrigger>
                        <TabsTrigger value="corporate">Contratos Corporativos</TabsTrigger>
                        <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
                        <TabsTrigger value="contracts">Contratos de Grupo</TabsTrigger>
                        <TabsTrigger value="billing">Faturamento</TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups" className="space-y-4">
                        {/* Search and filters */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar grupos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Groups List */}
                        <div className="grid gap-4">
                            {groups.filter(g =>
                                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                g.company.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((group) => (
                                <Card key={group.id} className="glass hover:shadow-lg transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                                                    {getStatusBadge(group.status)}
                                                    {getPaymentBadge(group.paymentStatus)}
                                                    {group.contractSigned && (
                                                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                            <FileText className="h-3 w-3 mr-1" />
                                                            Contrato
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        {group.company}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(group.checkIn).toLocaleDateString('pt-BR')} - {new Date(group.checkOut).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        Cut-off: {new Date(group.cutOffDate).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                {/* Room Progress */}
                                                <div className="min-w-[200px]">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground">Quartos</span>
                                                        <span className="font-medium text-foreground">
                                                            {group.roomsConfirmed}/{group.roomsBlocked}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(group.roomsConfirmed / group.roomsBlocked) * 100}
                                                        className="h-2"
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {group.roomsAvailable} disponíveis
                                                    </p>
                                                </div>

                                                {/* Value */}
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-foreground">{formatCurrency(group.totalValue)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Pago: {formatCurrency(group.depositPaid)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openRoomingList(group)}>
                                                        <ClipboardList className="h-4 w-4 mr-1" />
                                                        Rooming
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openContract(group)}>
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Contrato
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Corporate Contracts Tab */}
                    <TabsContent value="corporate" className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar contratos corporativos..."
                                    value={corporateSearchTerm}
                                    onChange={(e) => setCorporateSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button onClick={handleNewCorporateContract}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Contrato Corporativo
                            </Button>
                        </div>

                        {/* Corporate Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                                            <p className="text-2xl font-bold text-primary">{activeContracts}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Receita Total</p>
                                            <p className="text-2xl font-bold text-success">R$ {(contractsRevenue / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-success" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Room Nights</p>
                                            <p className="text-2xl font-bold text-accent">{totalRoomNights}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-accent" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">A Vencer</p>
                                            <p className="text-2xl font-bold text-warning">{expiringContracts}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-warning" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Corporate Contracts List */}
                        <div className="space-y-4">
                            {corporateContracts.filter(c => c.company.toLowerCase().includes(corporateSearchTerm.toLowerCase())).map((contract) => {
                                const status = contractStatusConfig[contract.status];
                                const usagePercent = (contract.roomNightsUsed / contract.roomNightsLimit) * 100;

                                return (
                                    <Card key={contract.id} className="glass hover:shadow-lg transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                                {/* Company Info */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <Avatar className="w-14 h-14 rounded-xl">
                                                        <AvatarImage src={contract.logo} />
                                                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                                                            {contract.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg text-foreground">{contract.company}</h3>
                                                            <Badge variant="outline" className={status.color}>
                                                                {status.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{contract.cnpj}</p>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {contract.contact}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {contract.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contract Details */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-primary">{contract.discount}%</p>
                                                        <p className="text-xs text-muted-foreground">Desconto</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-success">R$ {(contract.totalRevenue / 1000).toFixed(0)}k</p>
                                                        <p className="text-xs text-muted-foreground">Receita</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-foreground">{contract.roomNightsUsed}</p>
                                                        <p className="text-xs text-muted-foreground">Room Nights</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-foreground">{new Date(contract.validTo).toLocaleDateString('pt-BR')}</p>
                                                        <p className="text-xs text-muted-foreground">Vencimento</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewCorporateContract(contract)}>
                                                        <Eye className="w-4 h-4" />
                                                        Ver
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEditCorporateContract(contract)}>
                                                        <Edit className="w-4 h-4" />
                                                        Editar
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Usage Progress */}
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Utilização de Room Nights</span>
                                                    <span className="text-sm font-medium text-foreground">{contract.roomNightsUsed} / {contract.roomNightsLimit}</span>
                                                </div>
                                                <Progress
                                                    value={usagePercent}
                                                    className={cn(
                                                        "h-2",
                                                        usagePercent > 90 && "[&>div]:bg-destructive",
                                                        usagePercent > 75 && usagePercent <= 90 && "[&>div]:bg-warning"
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="blocks" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-foreground">Bloqueios de Inventário</h3>
                            <Button onClick={() => setIsBlockingModalOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Bloqueio
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {blocks.map((block) => (
                                <Card key={block.id} className="glass">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Lock className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-foreground">{block.name}</h4>
                                                        {getBlockTypeBadge(block.type)}
                                                        <Badge variant={block.status === 'active' ? 'default' : 'secondary'}>
                                                            {block.status === 'active' ? 'Ativo' : 'Agendado'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(block.startDate).toLocaleDateString('pt-BR')} - {new Date(block.endDate).toLocaleDateString('pt-BR')} • {block.roomsBlocked} quartos
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">{block.reason}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                    <Unlock className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="contracts" className="space-y-4">
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-foreground">Contratos de Grupo</CardTitle>
                                <CardDescription>Gestão de contratos e documentação</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Grupo</TableHead>
                                            <TableHead>Empresa</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Contrato</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-medium text-foreground">{group.name}</TableCell>
                                                <TableCell>{group.company}</TableCell>
                                                <TableCell>{formatCurrency(group.totalValue)}</TableCell>
                                                <TableCell>{getStatusBadge(group.status)}</TableCell>
                                                <TableCell>
                                                    {group.contractSigned ? (
                                                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Assinado
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pendente
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openContract(group)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Send className="h-4 w-4" />
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

                    <TabsContent value="billing" className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card className="glass">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Total Faturado</p>
                                        <p className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Total Recebido</p>
                                        <p className="text-3xl font-bold text-success">{formatCurrency(groups.reduce((sum, g) => sum + g.depositPaid, 0))}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="glass">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">A Receber</p>
                                        <p className="text-3xl font-bold text-warning">{formatCurrency(pendingDeposits)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-foreground">Faturamento por Grupo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Grupo</TableHead>
                                            <TableHead>Valor Total</TableHead>
                                            <TableHead>Depósito</TableHead>
                                            <TableHead>Saldo</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-medium text-foreground">{group.name}</TableCell>
                                                <TableCell>{formatCurrency(group.totalValue)}</TableCell>
                                                <TableCell className="text-success">{formatCurrency(group.depositPaid)}</TableCell>
                                                <TableCell className="text-warning">{formatCurrency(group.totalValue - group.depositPaid)}</TableCell>
                                                <TableCell>{new Date(group.checkIn).toLocaleDateString('pt-BR')}</TableCell>
                                                <TableCell>{getPaymentBadge(group.paymentStatus)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            Registrar
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <FileText className="h-4 w-4" />
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
                </Tabs>
            </div>

            {/* Modals */}
            <NewGroupModal open={isNewGroupModalOpen} onOpenChange={setIsNewGroupModalOpen} />
            <RoomingListModal
                open={isRoomingListModalOpen}
                onOpenChange={setIsRoomingListModalOpen}
                group={selectedGroup}
            />
            <GroupContractModal
                open={isContractModalOpen}
                onOpenChange={setIsContractModalOpen}
                group={selectedGroup}
            />
            <BlockingModal open={isBlockingModalOpen} onOpenChange={setIsBlockingModalOpen} />
            <NewContractModal
                open={isCorporateContractModalOpen}
                onOpenChange={setIsCorporateContractModalOpen}
                editContract={editCorporateContract ? {
                    id: editCorporateContract.id,
                    company: editCorporateContract.company,
                    cnpj: editCorporateContract.cnpj,
                    contact: editCorporateContract.contact,
                    email: editCorporateContract.email,
                    phone: editCorporateContract.phone,
                    address: editCorporateContract.address,
                    discount: editCorporateContract.discount,
                    validFrom: editCorporateContract.validFrom,
                    validTo: editCorporateContract.validTo,
                    roomNightsLimit: editCorporateContract.roomNightsLimit,
                } : null}
            />
            <ViewContractModal
                open={isViewContractModalOpen}
                onOpenChange={setIsViewContractModalOpen}
                contract={selectedCorporateContract}
                onEdit={() => selectedCorporateContract && handleEditCorporateContract(selectedCorporateContract)}
            />
        </DashboardLayout>
    );
}
