import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    FileText,
    Download,
    Send,
    Edit,
    CheckCircle2,
    Clock,
    Printer,
    Copy,
    Eye,
    History,
    Signature
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GroupContractModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: any;
}

const contractHistory = [
    { date: '2024-02-20 14:30', action: 'Contrato criado', user: 'Admin' },
    { date: '2024-02-21 09:15', action: 'Enviado para cliente', user: 'Admin' },
    { date: '2024-02-22 16:45', action: 'Cliente visualizou', user: 'Sistema' },
    { date: '2024-02-23 10:00', action: 'Contrato assinado', user: 'Cliente' },
];

export function GroupContractModal({ open, onOpenChange, group }: GroupContractModalProps) {
    const [notes, setNotes] = useState('');

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleDownload = () => {
        toast.success('Contrato baixado com sucesso');
    };

    const handleSendToClient = () => {
        toast.success('Contrato enviado para o cliente');
    };

    const handlePrint = () => {
        toast.info('Preparando impressão...');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText('https://hotel.com/contracts/GRP001');
        toast.success('Link copiado para a área de transferência');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Contrato de Grupo
                    </DialogTitle>
                    <DialogDescription>
                        {group?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                        {group?.contractSigned ? (
                            <Badge className="bg-success/10 text-success border-success/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Assinado
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                <Clock className="h-3 w-3 mr-1" />
                                Aguardando Assinatura
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Contrato #{group?.id}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-1" />
                            Imprimir
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopyLink}>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar Link
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-1" />
                            Baixar PDF
                        </Button>
                        {!group?.contractSigned && (
                            <Button size="sm" onClick={handleSendToClient}>
                                <Send className="h-4 w-4 mr-1" />
                                Enviar
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="preview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="preview">
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                        </TabsTrigger>
                        <TabsTrigger value="edit">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <History className="h-4 w-4 mr-1" />
                            Histórico
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-4">
                        <Card className="border-2">
                            <CardContent className="p-8 space-y-6">
                                {/* Header */}
                                <div className="text-center space-y-2 border-b pb-6">
                                    <h2 className="text-2xl font-bold text-foreground">CONTRATO DE RESERVA DE GRUPO</h2>
                                    <p className="text-muted-foreground">Hotel Premium Resort & Spa</p>
                                </div>

                                {/* Parties */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-foreground">1. DAS PARTES</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-2">
                                            <p className="font-medium text-foreground">CONTRATANTE:</p>
                                            <p className="text-muted-foreground">{group?.company}</p>
                                            <p className="text-muted-foreground">Contato: {group?.contactName}</p>
                                            <p className="text-muted-foreground">E-mail: {group?.contactEmail}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-medium text-foreground">CONTRATADO:</p>
                                            <p className="text-muted-foreground">Hotel Premium Resort & Spa</p>
                                            <p className="text-muted-foreground">CNPJ: 00.000.000/0001-00</p>
                                            <p className="text-muted-foreground">São Paulo, SP</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Object */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-foreground">2. DO OBJETO</h3>
                                    <p className="text-sm text-muted-foreground">
                                        O presente contrato tem por objeto a reserva de {group?.roomsBlocked} unidades habitacionais
                                        para o evento "{group?.name}", conforme especificações abaixo:
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Check-in:</p>
                                            <p className="font-medium text-foreground">
                                                {group?.checkIn ? new Date(group.checkIn).toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Check-out:</p>
                                            <p className="font-medium text-foreground">
                                                {group?.checkOut ? new Date(group.checkOut).toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Quartos:</p>
                                            <p className="font-medium text-foreground">{group?.roomsBlocked} unidades</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Data Limite (Cut-off):</p>
                                            <p className="font-medium text-foreground">
                                                {group?.cutOffDate ? new Date(group.cutOffDate).toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Values */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-foreground">3. DO VALOR</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Valor Total da Hospedagem:</span>
                                            <span className="font-medium text-foreground">{formatCurrency(group?.totalValue || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Depósito de Garantia (50%):</span>
                                            <span className="font-medium text-foreground">{formatCurrency((group?.totalValue || 0) / 2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="text-muted-foreground">Saldo a pagar no check-in:</span>
                                            <span className="font-medium text-foreground">{formatCurrency((group?.totalValue || 0) / 2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Cut-off */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-foreground">4. DA DATA LIMITE (CUT-OFF)</h3>
                                    <p className="text-sm text-muted-foreground">
                                        A Rooming List definitiva deverá ser enviada até a data limite de{' '}
                                        <strong className="text-foreground">
                                            {group?.cutOffDate ? new Date(group.cutOffDate).toLocaleDateString('pt-BR') : '-'}
                                        </strong>.
                                        Após esta data, os quartos não confirmados serão automaticamente liberados para venda.
                                    </p>
                                </div>

                                {/* Cancellation */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-foreground">5. DO CANCELAMENTO</h3>
                                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                        <li>Cancelamento até 30 dias antes: reembolso de 100% do depósito</li>
                                        <li>Cancelamento de 15 a 29 dias: reembolso de 50% do depósito</li>
                                        <li>Cancelamento com menos de 15 dias: sem reembolso</li>
                                    </ul>
                                </div>

                                {/* Special Requests */}
                                {group?.specialRequests && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-foreground">6. SOLICITAÇÕES ESPECIAIS</h3>
                                        <p className="text-sm text-muted-foreground">{group.specialRequests}</p>
                                    </div>
                                )}

                                {/* Signatures */}
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t">
                                    <div className="text-center space-y-4">
                                        <div className="h-20 border-b border-dashed" />
                                        <p className="text-sm text-muted-foreground">CONTRATANTE</p>
                                        <p className="text-sm text-foreground">{group?.contactName}</p>
                                        {group?.contractSigned && (
                                            <Badge className="bg-success/10 text-success">
                                                <Signature className="h-3 w-3 mr-1" />
                                                Assinado digitalmente
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-center space-y-4">
                                        <div className="h-20 border-b border-dashed" />
                                        <p className="text-sm text-muted-foreground">CONTRATADO</p>
                                        <p className="text-sm text-foreground">Hotel Premium Resort & Spa</p>
                                        <Badge className="bg-success/10 text-success">
                                            <Signature className="h-3 w-3 mr-1" />
                                            Assinado digitalmente
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="edit" className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Cláusulas Adicionais</label>
                                <Textarea
                                    placeholder="Adicione cláusulas personalizadas ao contrato..."
                                    rows={6}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancelar</Button>
                                <Button onClick={() => toast.success('Contrato atualizado')}>
                                    Salvar Alterações
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <div className="space-y-4">
                            {contractHistory.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <History className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{item.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.date} • {item.user}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
