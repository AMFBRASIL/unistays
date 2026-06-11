import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Lock,
    Calendar as CalendarIcon,
    BedDouble,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface BlockingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const roomTypes = [
    { id: 'all', name: 'Todos os tipos', available: 105 },
    { id: 'standard', name: 'Standard', available: 45 },
    { id: 'superior', name: 'Superior', available: 30 },
    { id: 'luxo', name: 'Luxo', available: 20 },
    { id: 'suite', name: 'Suíte', available: 10 }
];

export function BlockingModal({ open, onOpenChange }: BlockingModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        roomType: 'all',
        quantity: '',
        specificRooms: '',
        reason: '',
        notifyTeam: true
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.type || !formData.startDate || !formData.endDate) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        toast.success('Bloqueio criado com sucesso');
        onOpenChange(false);
        setFormData({
            name: '',
            type: '',
            startDate: undefined,
            endDate: undefined,
            roomType: 'all',
            quantity: '',
            specificRooms: '',
            reason: '',
            notifyTeam: true
        });
    };

    const selectedRoomType = roomTypes.find(r => r.id === formData.roomType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Novo Bloqueio de Inventário
                    </DialogTitle>
                    <DialogDescription>
                        Bloqueie quartos para manutenção, temporada ou reservas especiais
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Bloqueio *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Manutenção Ala Norte"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Bloqueio *</Label>
                        <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="maintenance">Manutenção</SelectItem>
                                <SelectItem value="seasonal">Temporada</SelectItem>
                                <SelectItem value="vip">Reserva VIP</SelectItem>
                                <SelectItem value="overbooking">Proteção de Overbooking</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data Inicial *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.startDate
                                            ? format(formData.startDate, 'dd/MM/yyyy', { locale: ptBR })
                                            : 'Selecionar'
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate}
                                        onSelect={(date) => handleInputChange('startDate', date)}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Data Final *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.endDate
                                            ? format(formData.endDate, 'dd/MM/yyyy', { locale: ptBR })
                                            : 'Selecionar'
                                        }
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.endDate}
                                        onSelect={(date) => handleInputChange('endDate', date)}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Quarto</Label>
                            <Select value={formData.roomType} onValueChange={(v) => handleInputChange('roomType', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map(room => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.name} ({room.available})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={selectedRoomType?.available}
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                placeholder={`Máx: ${selectedRoomType?.available}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specificRooms">Quartos Específicos (opcional)</Label>
                        <Input
                            id="specificRooms"
                            value={formData.specificRooms}
                            onChange={(e) => handleInputChange('specificRooms', e.target.value)}
                            placeholder="Ex: 101, 102, 103"
                        />
                        <p className="text-xs text-muted-foreground">
                            Deixe em branco para bloquear por quantidade
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            placeholder="Descreva o motivo do bloqueio..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="notifyTeam"
                            checked={formData.notifyTeam}
                            onCheckedChange={(checked) => handleInputChange('notifyTeam', checked)}
                        />
                        <Label htmlFor="notifyTeam" className="text-sm">
                            Notificar equipe sobre o bloqueio
                        </Label>
                    </div>

                    {formData.type === 'maintenance' && (
                        <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                            <p className="text-sm text-warning">
                                Quartos em manutenção ficarão indisponíveis para venda até o desbloqueio.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        <Lock className="h-4 w-4 mr-2" />
                        Criar Bloqueio
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
