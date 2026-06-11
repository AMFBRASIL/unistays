import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    Shield,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { toast } from 'sonner';

interface OverbookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const historicalData = [
    { month: 'Jan', noShows: 4.2, cancellations: 8.5, walkOuts: 0.3 },
    { month: 'Fev', noShows: 3.8, cancellations: 7.2, walkOuts: 0.1 },
    { month: 'Mar', noShows: 5.1, cancellations: 9.0, walkOuts: 0.5 },
];

export function OverbookingModal({ open, onOpenChange }: OverbookingModalProps) {
    const [settings, setSettings] = useState({
        enabled: true,
        level: [5],
        maxRooms: 8,
        autoAdjust: true,
        protectedDays: ['friday', 'saturday'],
        alertThreshold: 3,
        compensationBudget: 500,
        partnerHotels: ['Hotel Vizinho A', 'Hotel Vizinho B']
    });

    const avgNoShow = historicalData.reduce((sum, d) => sum + d.noShows, 0) / historicalData.length;
    const avgCancellation = historicalData.reduce((sum, d) => sum + d.cancellations, 0) / historicalData.length;
    const suggestedLevel = Math.round((avgNoShow + avgCancellation / 2) * 0.6);

    const handleSave = () => {
        toast.success('Configurações de overbooking salvas');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Controle de Overbooking
                    </DialogTitle>
                    <DialogDescription>
                        Configure políticas de sobrevenda inteligente
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status Card */}
                    <Card className={settings.enabled ? 'border-warning/30 bg-warning/5' : 'border-muted'}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-warning/20' : 'bg-muted'}`}>
                                        <TrendingUp className={`h-5 w-5 ${settings.enabled ? 'text-warning' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Overbooking {settings.enabled ? 'Ativo' : 'Desativado'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {settings.enabled
                                                ? `Até ${settings.level[0]}% acima da capacidade`
                                                : 'Nenhuma sobrevenda permitida'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={settings.enabled}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {settings.enabled && (
                        <>
                            {/* Level Control */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-foreground">Nível de Overbooking</Label>
                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                                        {settings.level[0]}%
                                    </Badge>
                                </div>
                                <Slider
                                    value={settings.level}
                                    onValueChange={(v) => setSettings(prev => ({ ...prev, level: v }))}
                                    max={15}
                                    step={1}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Conservador (0%)</span>
                                    <span>Sugerido ({suggestedLevel}%)</span>
                                    <span>Agressivo (15%)</span>
                                </div>
                            </div>

                            {/* Historical Data */}
                            <Card className="bg-muted/30">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">Dados Históricos (últimos 3 meses)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Média No-shows</p>
                                            <p className="text-lg font-bold text-foreground">{avgNoShow.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Média Cancelamentos</p>
                                            <p className="text-lg font-bold text-foreground">{avgCancellation.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Nível Sugerido</p>
                                            <p className="text-lg font-bold text-primary">{suggestedLevel}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxRooms">Máximo de Quartos Extra</Label>
                                    <Input
                                        id="maxRooms"
                                        type="number"
                                        value={settings.maxRooms}
                                        onChange={(e) => setSettings(prev => ({ ...prev, maxRooms: parseInt(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alertThreshold">Alerta de Risco (quartos)</Label>
                                    <Input
                                        id="alertThreshold"
                                        type="number"
                                        value={settings.alertThreshold}
                                        onChange={(e) => setSettings(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium text-foreground">Ajuste Automático</p>
                                    <p className="text-sm text-muted-foreground">
                                        Adaptar nível baseado em histórico diário
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.autoAdjust}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAdjust: checked }))}
                                />
                            </div>

                            {/* Compensation */}
                            <div className="space-y-2">
                                <Label htmlFor="compensation">Orçamento de Compensação por Walk-out (R$)</Label>
                                <Input
                                    id="compensation"
                                    type="number"
                                    value={settings.compensationBudget}
                                    onChange={(e) => setSettings(prev => ({ ...prev, compensationBudget: parseInt(e.target.value) }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Valor máximo para realocar hóspede em outro hotel
                                </p>
                            </div>

                            {/* Risk Calculation */}
                            <Card className="border-primary/20">
                                <CardContent className="p-4 space-y-3">
                                    <h4 className="font-medium text-foreground">Cálculo de Risco</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Probabilidade de Walk-out</span>
                                            <span className="text-foreground">{(settings.level[0] * 0.15).toFixed(1)}%</span>
                                        </div>
                                        <Progress value={settings.level[0] * 0.15 * 10} className="h-2" />

                                        <div className="flex justify-between text-sm mt-3">
                                            <span className="text-muted-foreground">Receita Adicional Estimada</span>
                                            <span className="text-success font-medium">
                                                R$ {(settings.level[0] * 350).toLocaleString('pt-BR')}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Custo Potencial de Compensação</span>
                                            <span className="text-destructive font-medium">
                                                R$ {(settings.level[0] * 0.15 * settings.compensationBudget).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Shield className="h-4 w-4 mr-2" />
                        Salvar Configurações
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
