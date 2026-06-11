import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    Brain,
    Settings,
    TrendingUp,
    DollarSign,
    Target,
    Clock,
    Shield,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface DynamicPricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DynamicPricingModal({ open, onOpenChange }: DynamicPricingModalProps) {
    const [settings, setSettings] = useState({
        enabled: true,
        autoApply: false,
        minPrice: 250,
        maxPrice: 800,
        aggressiveness: [50],
        competitorTracking: true,
        demandSensitivity: [70],
        updateFrequency: '1h',
        protectedDates: [],
        segmentPricing: {
            corporate: true,
            leisure: true,
            ota: true,
            direct: true
        }
    });

    const handleSave = () => {
        toast.success('Configurações de precificação salvas');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Configuração de Precificação Dinâmica
                    </DialogTitle>
                    <DialogDescription>
                        Configure o motor de IA para otimização automática de preços
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="limits">Limites</TabsTrigger>
                        <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                        <TabsTrigger value="segments">Segmentos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card className="border-primary/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Brain className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Motor de IA Ativo</p>
                                            <p className="text-sm text-muted-foreground">
                                                Análise contínua de demanda e competição
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frequência de Atualização</Label>
                                <Select
                                    value={settings.updateFrequency}
                                    onValueChange={(v) => setSettings(prev => ({ ...prev, updateFrequency: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15m">A cada 15 minutos</SelectItem>
                                        <SelectItem value="30m">A cada 30 minutos</SelectItem>
                                        <SelectItem value="1h">A cada hora</SelectItem>
                                        <SelectItem value="4h">A cada 4 horas</SelectItem>
                                        <SelectItem value="24h">Diariamente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-warning" />
                                    <span className="text-sm font-medium text-foreground">Aplicar automaticamente</span>
                                </div>
                                <Switch
                                    checked={settings.autoApply}
                                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApply: checked }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-foreground">Monitorar concorrência</span>
                            </div>
                            <Switch
                                checked={settings.competitorTracking}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, competitorTracking: checked }))}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="limits" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minPrice">Preço Mínimo (R$)</Label>
                                <Input
                                    id="minPrice"
                                    type="number"
                                    value={settings.minPrice}
                                    onChange={(e) => setSettings(prev => ({ ...prev, minPrice: parseInt(e.target.value) }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    A IA nunca sugerirá preços abaixo deste valor
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxPrice">Preço Máximo (R$)</Label>
                                <Input
                                    id="maxPrice"
                                    type="number"
                                    value={settings.maxPrice}
                                    onChange={(e) => setSettings(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Limite superior para proteção de marca
                                </p>
                            </div>
                        </div>

                        <Card className="bg-muted/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <span className="font-medium text-foreground">Faixa de Operação</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">R$ {settings.minPrice}</span>
                                    <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-destructive via-warning via-success to-primary rounded-full" />
                                    <span className="text-muted-foreground">R$ {settings.maxPrice}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="behavior" className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Label className="text-foreground">Agressividade de Precificação</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Quanto a IA deve variar os preços
                                    </p>
                                </div>
                                <Badge variant="outline">{settings.aggressiveness[0]}%</Badge>
                            </div>
                            <Slider
                                value={settings.aggressiveness}
                                onValueChange={(v) => setSettings(prev => ({ ...prev, aggressiveness: v }))}
                                max={100}
                                step={5}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Conservador</span>
                                <span>Moderado</span>
                                <span>Agressivo</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Label className="text-foreground">Sensibilidade à Demanda</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Velocidade de reação a mudanças
                                    </p>
                                </div>
                                <Badge variant="outline">{settings.demandSensitivity[0]}%</Badge>
                            </div>
                            <Slider
                                value={settings.demandSensitivity}
                                onValueChange={(v) => setSettings(prev => ({ ...prev, demandSensitivity: v }))}
                                max={100}
                                step={5}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Lento</span>
                                <span>Balanceado</span>
                                <span>Rápido</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="segments" className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Selecione quais segmentos terão precificação dinâmica ativa
                        </p>

                        <div className="space-y-3">
                            {Object.entries(settings.segmentPricing).map(([segment, enabled]) => (
                                <div key={segment} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium text-foreground capitalize">
                                            {segment === 'corporate' ? 'Corporativo' :
                                                segment === 'leisure' ? 'Lazer' :
                                                    segment === 'ota' ? 'OTAs' : 'Direto'}
                                        </span>
                                    </div>
                                    <Switch
                                        checked={enabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                segmentPricing: { ...prev.segmentPricing, [segment]: checked }
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        <Settings className="h-4 w-4 mr-2" />
                        Salvar Configurações
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
