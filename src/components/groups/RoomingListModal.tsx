import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Download,
    Upload,
    Search,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    BedDouble,
    ClipboardList,
    Send,
    CheckCircle2,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface RoomingListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: any;
}

const roomTypes = ['Standard', 'Superior', 'Luxo', 'Suíte'];
const availableRooms = [
    { number: '101', type: 'Standard', status: 'available' },
    { number: '102', type: 'Standard', status: 'available' },
    { number: '103', type: 'Standard', status: 'occupied' },
    { number: '201', type: 'Superior', status: 'available' },
    { number: '202', type: 'Superior', status: 'available' },
    { number: '301', type: 'Luxo', status: 'available' },
    { number: '401', type: 'Suíte', status: 'available' },
];

export function RoomingListModal({ open, onOpenChange, group }: RoomingListModalProps) {
    const [guests, setGuests] = useState([
        { id: 1, name: 'João Silva', email: 'joao@email.com', roomType: 'Standard', roomNumber: '101', status: 'confirmed', specialRequests: '' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', roomType: 'Superior', roomNumber: '205', status: 'confirmed', specialRequests: 'Travesseiro extra' },
        { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', roomType: 'Standard', roomNumber: '102', status: 'pending', specialRequests: '' },
        { id: 4, name: 'Ana Oliveira', email: 'ana@email.com', roomType: 'Luxo', roomNumber: '301', status: 'confirmed', specialRequests: 'Vista para o mar' },
        { id: 5, name: 'Carlos Ferreira', email: 'carlos@email.com', roomType: 'Standard', roomNumber: '', status: 'unassigned', specialRequests: '' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [newGuest, setNewGuest] = useState({ name: '', email: '', roomType: 'Standard', specialRequests: '' });
    const [editingId, setEditingId] = useState<number | null>(null);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-success/10 text-success border-success/20',
            pending: 'bg-warning/10 text-warning border-warning/20',
            unassigned: 'bg-muted text-muted-foreground border-border'
        };
        const labels: Record<string, string> = {
            confirmed: 'Confirmado',
            pending: 'Pendente',
            unassigned: 'Sem quarto'
        };
        return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
    };

    const handleAddGuest = () => {
        if (!newGuest.name) return;

        setGuests(prev => [...prev, {
            id: Date.now(),
            ...newGuest,
            roomNumber: '',
            status: 'unassigned'
        }]);
        setNewGuest({ name: '', email: '', roomType: 'Standard', specialRequests: '' });
        toast.success('Hóspede adicionado à lista');
    };

    const handleAssignRoom = (guestId: number, roomNumber: string) => {
        setGuests(prev => prev.map(g =>
            g.id === guestId
                ? { ...g, roomNumber, status: roomNumber ? 'confirmed' : 'unassigned' }
                : g
        ));
        toast.success('Quarto atribuído');
    };

    const handleDeleteGuest = (guestId: number) => {
        setGuests(prev => prev.filter(g => g.id !== guestId));
        toast.success('Hóspede removido');
    };

    const handleExport = () => {
        toast.success('Rooming list exportada');
    };

    const handleImport = () => {
        toast.info('Funcionalidade de importação será implementada');
    };

    const handleSendToGuests = () => {
        toast.success('Confirmação enviada para todos os hóspedes');
    };

    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
    const pendingCount = guests.filter(g => g.status === 'pending').length;
    const unassignedCount = guests.filter(g => g.status === 'unassigned').length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Rooming List
                    </DialogTitle>
                    <DialogDescription>
                        {group?.name} • {group?.roomsBlocked} quartos bloqueados
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="list" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="list">Lista de Hóspedes</TabsTrigger>
                            <TabsTrigger value="add">Adicionar</TabsTrigger>
                            <TabsTrigger value="summary">Resumo</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleImport}>
                                <Upload className="h-4 w-4 mr-1" />
                                Importar
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-1" />
                                Exportar
                            </Button>
                            <Button size="sm" onClick={handleSendToGuests}>
                                <Send className="h-4 w-4 mr-1" />
                                Enviar Confirmações
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="list" className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Confirmados</p>
                                    <p className="text-xl font-bold text-success">{confirmedCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
                                <Clock className="h-5 w-5 text-warning" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Pendentes</p>
                                    <p className="text-xl font-bold text-warning">{pendingCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Sem Quarto</p>
                                    <p className="text-xl font-bold text-foreground">{unassignedCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar hóspede..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Table */}
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>E-mail</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Quarto</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Solicitações</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGuests.map((guest) => (
                                        <TableRow key={guest.id}>
                                            <TableCell className="font-medium text-foreground">{guest.name}</TableCell>
                                            <TableCell>{guest.email}</TableCell>
                                            <TableCell>{guest.roomType}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={guest.roomNumber}
                                                    onValueChange={(v) => handleAssignRoom(guest.id, v)}
                                                >
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue placeholder="--" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableRooms
                                                            .filter(r => r.type === guest.roomType && r.status === 'available')
                                                            .map(room => (
                                                                <SelectItem key={room.number} value={room.number}>
                                                                    {room.number}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(guest.status)}</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {guest.specialRequests || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteGuest(guest.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="add" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Nome *</label>
                                <Input
                                    value={newGuest.name}
                                    onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">E-mail</label>
                                <Input
                                    type="email"
                                    value={newGuest.email}
                                    onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Tipo de Quarto</label>
                                <Select
                                    value={newGuest.roomType}
                                    onValueChange={(v) => setNewGuest(prev => ({ ...prev, roomType: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Solicitações Especiais</label>
                                <Input
                                    value={newGuest.specialRequests}
                                    onChange={(e) => setNewGuest(prev => ({ ...prev, specialRequests: e.target.value }))}
                                    placeholder="Ex: Andar alto, berço..."
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddGuest}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Hóspede
                        </Button>
                    </TabsContent>

                    <TabsContent value="summary" className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Por Tipo de Quarto</h4>
                                {roomTypes.map(type => {
                                    const count = guests.filter(g => g.roomType === type).length;
                                    return (
                                        <div key={type} className="flex justify-between items-center p-3 border rounded-lg">
                                            <span className="text-foreground">{type}</span>
                                            <Badge variant="secondary">{count} hóspedes</Badge>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Por Status</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                                        <span className="text-success">Confirmados</span>
                                        <span className="font-bold text-success">{confirmedCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                                        <span className="text-warning">Pendentes</span>
                                        <span className="font-bold text-warning">{pendingCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="text-muted-foreground">Sem Quarto</span>
                                        <span className="font-bold text-foreground">{unassignedCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
