import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Users,
    Building2,
    Calendar as CalendarIcon,
    User,
    Mail,
    Phone,
    BedDouble,
    DollarSign,
    FileText,
    Clock,
    CheckCircle2,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NewGroupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    { id: 1, title: 'Informações Básicas', icon: Users },
    { id: 2, title: 'Datas e Quartos', icon: CalendarIcon },
    { id: 3, title: 'Contato', icon: User },
    { id: 4, title: 'Financeiro', icon: DollarSign },
    { id: 5, title: 'Detalhes Adicionais', icon: FileText },
    { id: 6, title: 'Confirmação', icon: CheckCircle2 }
];

const roomTypes = [
    { id: 'standard', name: 'Standard', available: 45, price: 350 },
    { id: 'superior', name: 'Superior', available: 30, price: 450 },
    { id: 'luxo', name: 'Luxo', available: 20, price: 650 },
    { id: 'suite', name: 'Suíte', available: 10, price: 950 }
];

export function NewGroupModal({ open, onOpenChange }: NewGroupModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        eventType: '',
        checkIn: undefined as Date | undefined,
        checkOut: undefined as Date | undefined,
        cutOffDate: undefined as Date | undefined,
        cutOffDays: '15',
        roomAllocation: {} as Record<string, number>,
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        billingName: '',
        billingEmail: '',
        paymentTerms: '',
        depositRequired: true,
        depositPercent: '50',
        specialRequests: '',
        includeBreakfast: true,
        includeMeeting: false,
        includeCoffeeBreak: false,
        notes: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoomAllocation = (roomId: string, quantity: number) => {
        setFormData(prev => ({
            ...prev,
            roomAllocation: { ...prev.roomAllocation, [roomId]: quantity }
        }));
    };

    const totalRooms = Object.values(formData.roomAllocation).reduce((sum, qty) => sum + qty, 0);
    const totalValue = roomTypes.reduce((sum, room) => {
        const qty = formData.roomAllocation[room.id] || 0;
        const nights = formData.checkIn && formData.checkOut
            ? Math.ceil((formData.checkOut.getTime() - formData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        return sum + (qty * room.price * nights);
    }, 0);

    const depositValue = (totalValue * parseInt(formData.depositPercent)) / 100;

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        toast.success('Grupo criado com sucesso!');
        onOpenChange(false);
        setCurrentStep(1);
        setFormData({
            name: '',
            company: '',
            eventType: '',
            checkIn: undefined,
            checkOut: undefined,
            cutOffDate: undefined,
            cutOffDays: '15',
            roomAllocation: {},
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            billingName: '',
            billingEmail: '',
            paymentTerms: '',
            depositRequired: true,
            depositPercent: '50',
            specialRequests: '',
            includeBreakfast: true,
            includeMeeting: false,
            includeCoffeeBreak: false,
            notes: ''
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Novo Grupo</DialogTitle>
                    <DialogDescription>
                        Crie uma nova reserva de grupo com rooming list e contrato
                    </DialogDescription>
                </DialogHeader>

                {/* Progress */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                                    currentStep >= step.id
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-border text-muted-foreground"
                                )}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "w-12 h-0.5 mx-2",
                                        currentStep > step.id ? "bg-primary" : "bg-border"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                    <Progress value={(currentStep / steps.length) * 100} className="h-2" />
                    <p className="text-sm font-medium text-foreground text-center">
                        Etapa {currentStep} de {steps.length}: {steps[currentStep - 1].title}
                    </p>
                </div>

                {/* Step Content */}
                <div className="space-y-6 py-4">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Grupo *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Ex: Conferência Tech Brasil 2024"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Empresa/Organização *</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder="Nome da empresa"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eventType">Tipo de Evento</Label>
                                <Select value={formData.eventType} onValueChange={(v) => handleInputChange('eventType', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="conference">Conferência</SelectItem>
                                        <SelectItem value="wedding">Casamento</SelectItem>
                                        <SelectItem value="corporate">Evento Corporativo</SelectItem>
                                        <SelectItem value="tour">Grupo de Turismo</SelectItem>
                                        <SelectItem value="sports">Evento Esportivo</SelectItem>
                                        <SelectItem value="other">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Check-in *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.checkIn ? format(formData.checkIn, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.checkIn}
                                                onSelect={(date) => handleInputChange('checkIn', date)}
                                                locale={ptBR}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Check-out *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.checkOut ? format(formData.checkOut, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.checkOut}
                                                onSelect={(date) => handleInputChange('checkOut', date)}
                                                locale={ptBR}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cut-off (dias antes)</Label>
                                    <Select value={formData.cutOffDays} onValueChange={(v) => handleInputChange('cutOffDays', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7 dias</SelectItem>
                                            <SelectItem value="14">14 dias</SelectItem>
                                            <SelectItem value="15">15 dias</SelectItem>
                                            <SelectItem value="21">21 dias</SelectItem>
                                            <SelectItem value="30">30 dias</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Alocação de Quartos</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {roomTypes.map((room) => (
                                        <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                            <div>
                                                <p className="font-medium text-foreground">{room.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {room.available} disponíveis • {formatCurrency(room.price)}/noite
                                                </p>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={room.available}
                                                className="w-20"
                                                value={formData.roomAllocation[room.id] || 0}
                                                onChange={(e) => handleRoomAllocation(room.id, parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between p-4 bg-primary/10 rounded-lg">
                                    <span className="font-medium text-foreground">Total de Quartos</span>
                                    <span className="font-bold text-primary">{totalRooms} quartos</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Contato Principal</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName">Nome *</Label>
                                        <Input
                                            id="contactName"
                                            value={formData.contactName}
                                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                                            placeholder="Nome do contato"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Telefone *</Label>
                                        <Input
                                            id="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">E-mail *</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                        placeholder="email@empresa.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-foreground">Faturamento (se diferente)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="billingName">Nome/Empresa</Label>
                                        <Input
                                            id="billingName"
                                            value={formData.billingName}
                                            onChange={(e) => handleInputChange('billingName', e.target.value)}
                                            placeholder="Nome para faturamento"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="billingEmail">E-mail</Label>
                                        <Input
                                            id="billingEmail"
                                            type="email"
                                            value={formData.billingEmail}
                                            onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                                            placeholder="faturamento@empresa.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Condições de Pagamento</Label>
                                        <Select value={formData.paymentTerms} onValueChange={(v) => handleInputChange('paymentTerms', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="advance">100% Antecipado</SelectItem>
                                                <SelectItem value="deposit">Depósito + Saldo no Check-in</SelectItem>
                                                <SelectItem value="invoice">Faturado 30 dias</SelectItem>
                                                <SelectItem value="custom">Personalizado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="depositRequired"
                                            checked={formData.depositRequired}
                                            onCheckedChange={(checked) => handleInputChange('depositRequired', checked)}
                                        />
                                        <Label htmlFor="depositRequired">Exigir depósito</Label>
                                    </div>

                                    {formData.depositRequired && (
                                        <div className="space-y-2">
                                            <Label>Percentual do Depósito</Label>
                                            <Select value={formData.depositPercent} onValueChange={(v) => handleInputChange('depositPercent', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30">30%</SelectItem>
                                                    <SelectItem value="50">50%</SelectItem>
                                                    <SelectItem value="70">70%</SelectItem>
                                                    <SelectItem value="100">100%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                                    <h4 className="font-medium text-foreground">Resumo Financeiro</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Valor Total</span>
                                            <span className="font-medium text-foreground">{formatCurrency(totalValue)}</span>
                                        </div>
                                        {formData.depositRequired && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Depósito ({formData.depositPercent}%)</span>
                                                    <span className="font-medium text-warning">{formatCurrency(depositValue)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Saldo</span>
                                                    <span className="font-medium text-foreground">{formatCurrency(totalValue - depositValue)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label>Serviços Inclusos</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <Checkbox
                                            id="includeBreakfast"
                                            checked={formData.includeBreakfast}
                                            onCheckedChange={(checked) => handleInputChange('includeBreakfast', checked)}
                                        />
                                        <Label htmlFor="includeBreakfast">Café da Manhã</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <Checkbox
                                            id="includeMeeting"
                                            checked={formData.includeMeeting}
                                            onCheckedChange={(checked) => handleInputChange('includeMeeting', checked)}
                                        />
                                        <Label htmlFor="includeMeeting">Sala de Reunião</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                        <Checkbox
                                            id="includeCoffeeBreak"
                                            checked={formData.includeCoffeeBreak}
                                            onCheckedChange={(checked) => handleInputChange('includeCoffeeBreak', checked)}
                                        />
                                        <Label htmlFor="includeCoffeeBreak">Coffee Break</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialRequests">Solicitações Especiais</Label>
                                <Textarea
                                    id="specialRequests"
                                    value={formData.specialRequests}
                                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                                    placeholder="Descreva quaisquer solicitações especiais do grupo..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Observações Internas</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    placeholder="Notas internas sobre o grupo..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Informações do Grupo</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nome</span>
                                            <span className="font-medium text-foreground">{formData.name || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Empresa</span>
                                            <span className="font-medium text-foreground">{formData.company || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Check-in</span>
                                            <span className="font-medium text-foreground">
                                                {formData.checkIn ? format(formData.checkIn, 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Check-out</span>
                                            <span className="font-medium text-foreground">
                                                {formData.checkOut ? format(formData.checkOut, 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total de Quartos</span>
                                            <span className="font-medium text-foreground">{totalRooms}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Financeiro</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Valor Total</span>
                                            <span className="font-bold text-primary">{formatCurrency(totalValue)}</span>
                                        </div>
                                        {formData.depositRequired && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Depósito</span>
                                                <span className="font-medium text-warning">{formatCurrency(depositValue)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                                <span className="text-sm text-success">
                                    Todos os dados foram preenchidos. Clique em "Criar Grupo" para finalizar.
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>

                    {currentStep < steps.length ? (
                        <Button onClick={nextStep}>
                            Próximo
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Criar Grupo
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
