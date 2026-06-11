import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Settings,
    Thermometer,
    Lightbulb,
    Clock,
    Sun,
    Moon,
    Zap,
    Bell,
    Shield,
    Gauge,
    Activity,
    TrendingDown,
    Calendar,
    Users,
    DoorOpen,
    Power,
    Wifi,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Target,
    Leaf,
    BarChart3,
    Mail,
    MessageSquare,
    Smartphone,
    Building,
    Timer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnergySettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EnergySettingsModal({ open, onOpenChange }: EnergySettingsModalProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("general");
    const [hasChanges, setHasChanges] = useState(false);

    const [settings, setSettings] = useState({
        // General
        systemEnabled: true,
        economyMode: false,
        autoOptimization: true,
        dataRetentionDays: 90,
        timezone: "America/Sao_Paulo",
        currency: "BRL",

        // Temperature
        defaultTempOccupied: 22,
        defaultTempVacant: 26,
        minTemp: 18,
        maxTemp: 28,
        tempTolerance: 1,
        preHeatTime: 30,
        preCoolTime: 30,

        // Lighting
        defaultBrightnessDay: 80,
        defaultBrightnessNight: 40,
        motionSensorDelay: 5,
        daylightHarvesting: true,
        fadeTransition: true,
        fadeSpeed: 2,

        // Schedules
        peakHoursStart: "18:00",
        peakHoursEnd: "21:00",
        nightModeStart: "23:00",
        nightModeEnd: "06:00",
        weekendDifferent: true,

        // Energy
        energyGoal: 15,
        alertThreshold: 120,
        peakReduction: true,
        peakReductionPercent: 20,
        carbonTracking: true,

        // Notifications
        emailAlerts: true,
        pushAlerts: true,
        smsAlerts: false,
        dailyReport: true,
        weeklyReport: true,
        alertEmails: "gerencia@hotel.com",

        // Security
        requireAuth: true,
        sessionTimeout: 30,
        logActions: true,
        twoFactor: false,

        // Integration
        pmsIntegration: true,
        weatherIntegration: true,
        occupancySync: true,
    });

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        toast({
            title: "Configurações Salvas",
            description: "Todas as alterações foram aplicadas com sucesso.",
        });
        setHasChanges(false);
    };

    const handleReset = () => {
        toast({
            title: "Configurações Restauradas",
            description: "As configurações foram restauradas para os valores padrão.",
        });
        setHasChanges(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 bg-card border-border overflow-hidden flex flex-col">
                <div className="flex h-full w-full">
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <DialogHeader className="p-6 pb-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                                        <Settings className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl">Configurações de Energia</DialogTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Configure parâmetros de automação e eficiência energética
                                        </p>
                                    </div>
                                </div>
                                {hasChanges && (
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                        Alterações não salvas
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 pt-4">
                                <TabsList className="w-full grid grid-cols-4 lg:grid-cols-8 gap-1 bg-muted/50 p-1">
                                    <TabsTrigger value="general" className="text-xs">
                                        <Settings className="w-3 h-3 mr-1" />
                                        Geral
                                    </TabsTrigger>
                                    <TabsTrigger value="temperature" className="text-xs">
                                        <Thermometer className="w-3 h-3 mr-1" />
                                        Temp.
                                    </TabsTrigger>
                                    <TabsTrigger value="lighting" className="text-xs">
                                        <Lightbulb className="w-3 h-3 mr-1" />
                                        Luz
                                    </TabsTrigger>
                                    <TabsTrigger value="schedules" className="text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Horários
                                    </TabsTrigger>
                                    <TabsTrigger value="energy" className="text-xs">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Energia
                                    </TabsTrigger>
                                    <TabsTrigger value="notifications" className="text-xs">
                                        <Bell className="w-3 h-3 mr-1" />
                                        Alertas
                                    </TabsTrigger>
                                    <TabsTrigger value="security" className="text-xs">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Segurança
                                    </TabsTrigger>
                                    <TabsTrigger value="integrations" className="text-xs">
                                        <Wifi className="w-3 h-3 mr-1" />
                                        Integr.
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                {/* General Tab */}
                                <TabsContent value="general" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Power className="w-4 h-4 text-primary" />
                                                Sistema
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Sistema Ativo</p>
                                                        <p className="text-sm text-muted-foreground">Ativar gestão de energia</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.systemEnabled}
                                                        onCheckedChange={(checked) => updateSetting("systemEnabled", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Modo Economia</p>
                                                        <p className="text-sm text-muted-foreground">Reduzir consumo em horários de pico</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.economyMode}
                                                        onCheckedChange={(checked) => updateSetting("economyMode", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Otimização Automática</p>
                                                        <p className="text-sm text-muted-foreground">IA ajusta parâmetros automaticamente</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.autoOptimization}
                                                        onCheckedChange={(checked) => updateSetting("autoOptimization", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Building className="w-4 h-4 text-primary" />
                                                Preferências
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Fuso Horário</Label>
                                                    <Select
                                                        value={settings.timezone}
                                                        onValueChange={(value) => updateSetting("timezone", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                                                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                                                            <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
                                                            <SelectItem value="America/Cuiaba">Cuiabá (GMT-4)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Moeda</Label>
                                                    <Select
                                                        value={settings.currency}
                                                        onValueChange={(value) => updateSetting("currency", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="BRL">Real (R$)</SelectItem>
                                                            <SelectItem value="USD">Dólar (US$)</SelectItem>
                                                            <SelectItem value="EUR">Euro (€)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Retenção de Dados (dias)</Label>
                                                    <Input
                                                        type="number"
                                                        value={settings.dataRetentionDays}
                                                        onChange={(e) => updateSetting("dataRetentionDays", parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Temperature Tab */}
                                <TabsContent value="temperature" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Thermometer className="w-4 h-4 text-cyan-500" />
                                                Temperaturas Padrão
                                            </h3>

                                            <div className="space-y-6 p-4 bg-muted/30 rounded-xl">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            Quarto Ocupado
                                                        </Label>
                                                        <span className="font-bold text-lg">{settings.defaultTempOccupied}°C</span>
                                                    </div>
                                                    <Slider
                                                        value={[settings.defaultTempOccupied]}
                                                        onValueChange={([value]) => updateSetting("defaultTempOccupied", value)}
                                                        min={16}
                                                        max={30}
                                                        step={1}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="flex items-center gap-2">
                                                            <DoorOpen className="w-4 h-4" />
                                                            Quarto Vago
                                                        </Label>
                                                        <span className="font-bold text-lg">{settings.defaultTempVacant}°C</span>
                                                    </div>
                                                    <Slider
                                                        value={[settings.defaultTempVacant]}
                                                        onValueChange={([value]) => updateSetting("defaultTempVacant", value)}
                                                        min={16}
                                                        max={30}
                                                        step={1}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Target className="w-4 h-4 text-orange-500" />
                                                Limites e Tolerâncias
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Temp. Mínima (°C)</Label>
                                                        <Input
                                                            type="number"
                                                            value={settings.minTemp}
                                                            onChange={(e) => updateSetting("minTemp", parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Temp. Máxima (°C)</Label>
                                                        <Input
                                                            type="number"
                                                            value={settings.maxTemp}
                                                            onChange={(e) => updateSetting("maxTemp", parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Tolerância (±°C)</Label>
                                                    <Input
                                                        type="number"
                                                        value={settings.tempTolerance}
                                                        onChange={(e) => updateSetting("tempTolerance", parseFloat(e.target.value))}
                                                        step={0.5}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Timer className="w-4 h-4 text-purple-500" />
                                                Pré-condicionamento
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Sun className="w-4 h-4 text-orange-500" />
                                                        <span className="font-medium">Pré-aquecimento</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={settings.preHeatTime}
                                                            onChange={(e) => updateSetting("preHeatTime", parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                        <span className="text-sm text-muted-foreground">min antes do check-in</span>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Moon className="w-4 h-4 text-blue-500" />
                                                        <span className="font-medium">Pré-resfriamento</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={settings.preCoolTime}
                                                            onChange={(e) => updateSetting("preCoolTime", parseInt(e.target.value))}
                                                            className="w-20"
                                                        />
                                                        <span className="text-sm text-muted-foreground">min antes do check-in</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Lighting Tab */}
                                <TabsContent value="lighting" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                                Níveis de Iluminação
                                            </h3>

                                            <div className="space-y-6 p-4 bg-muted/30 rounded-xl">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="flex items-center gap-2">
                                                            <Sun className="w-4 h-4" />
                                                            Brilho Diurno
                                                        </Label>
                                                        <span className="font-bold text-lg">{settings.defaultBrightnessDay}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[settings.defaultBrightnessDay]}
                                                        onValueChange={([value]) => updateSetting("defaultBrightnessDay", value)}
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="flex items-center gap-2">
                                                            <Moon className="w-4 h-4" />
                                                            Brilho Noturno
                                                        </Label>
                                                        <span className="font-bold text-lg">{settings.defaultBrightnessNight}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[settings.defaultBrightnessNight]}
                                                        onValueChange={([value]) => updateSetting("defaultBrightnessNight", value)}
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-green-500" />
                                                Sensores e Transições
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Delay Sensor de Presença (min)</Label>
                                                    <Input
                                                        type="number"
                                                        value={settings.motionSensorDelay}
                                                        onChange={(e) => updateSetting("motionSensorDelay", parseInt(e.target.value))}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Tempo antes de desligar luzes após ausência
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Aproveitamento Luz Natural</p>
                                                        <p className="text-sm text-muted-foreground">Ajustar com base na luz solar</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.daylightHarvesting}
                                                        onCheckedChange={(checked) => updateSetting("daylightHarvesting", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Transição Suave</p>
                                                        <p className="text-sm text-muted-foreground">Fade in/out ao ligar/desligar</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.fadeTransition}
                                                        onCheckedChange={(checked) => updateSetting("fadeTransition", checked)}
                                                    />
                                                </div>

                                                {settings.fadeTransition && (
                                                    <div className="space-y-2">
                                                        <Label>Velocidade da Transição (seg)</Label>
                                                        <Input
                                                            type="number"
                                                            value={settings.fadeSpeed}
                                                            onChange={(e) => updateSetting("fadeSpeed", parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Schedules Tab */}
                                <TabsContent value="schedules" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                Horário de Pico
                                            </h3>

                                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Período com tarifa de energia mais alta
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Início</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.peakHoursStart}
                                                            onChange={(e) => updateSetting("peakHoursStart", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Fim</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.peakHoursEnd}
                                                            onChange={(e) => updateSetting("peakHoursEnd", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Moon className="w-4 h-4 text-indigo-500" />
                                                Modo Noturno
                                            </h3>

                                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Reduz iluminação de áreas comuns
                                                </p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Início</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.nightModeStart}
                                                            onChange={(e) => updateSetting("nightModeStart", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Fim</Label>
                                                        <Input
                                                            type="time"
                                                            value={settings.nightModeEnd}
                                                            onChange={(e) => updateSetting("nightModeEnd", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-medium">Configuração Diferente para Fins de Semana</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Aplicar horários diferentes em sábados e domingos
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={settings.weekendDifferent}
                                                    onCheckedChange={(checked) => updateSetting("weekendDifferent", checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Energy Tab */}
                                <TabsContent value="energy" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <TrendingDown className="w-4 h-4 text-green-500" />
                                                Metas de Economia
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Meta de Redução Mensal</Label>
                                                        <span className="font-bold text-lg text-green-500">{settings.energyGoal}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[settings.energyGoal]}
                                                        onValueChange={([value]) => updateSetting("energyGoal", value)}
                                                        min={0}
                                                        max={50}
                                                        step={1}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Alerta de Consumo Excessivo (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={settings.alertThreshold}
                                                        onChange={(e) => updateSetting("alertThreshold", parseInt(e.target.value))}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Alerta quando consumo ultrapassar X% da média
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Gauge className="w-4 h-4 text-blue-500" />
                                                Controles Avançados
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Redução em Horário de Pico</p>
                                                        <p className="text-sm text-muted-foreground">Limitar consumo automaticamente</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.peakReduction}
                                                        onCheckedChange={(checked) => updateSetting("peakReduction", checked)}
                                                    />
                                                </div>

                                                {settings.peakReduction && (
                                                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                                                        <div className="flex items-center justify-between">
                                                            <Label>Percentual de Redução</Label>
                                                            <span className="font-bold">{settings.peakReductionPercent}%</span>
                                                        </div>
                                                        <Slider
                                                            value={[settings.peakReductionPercent]}
                                                            onValueChange={([value]) => updateSetting("peakReductionPercent", value)}
                                                            min={5}
                                                            max={50}
                                                            step={5}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Leaf className="w-5 h-5 text-green-500" />
                                                        <div>
                                                            <p className="font-medium">Rastreamento de Carbono</p>
                                                            <p className="text-sm text-muted-foreground">Calcular pegada de CO₂</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.carbonTracking}
                                                        onCheckedChange={(checked) => updateSetting("carbonTracking", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Notifications Tab */}
                                <TabsContent value="notifications" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-primary" />
                                                Canais de Notificação
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <span>E-mail</span>
                                                    </div>
                                                    <Switch
                                                        checked={settings.emailAlerts}
                                                        onCheckedChange={(checked) => updateSetting("emailAlerts", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                                                        <span>Push (App)</span>
                                                    </div>
                                                    <Switch
                                                        checked={settings.pushAlerts}
                                                        onCheckedChange={(checked) => updateSetting("pushAlerts", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                        <span>SMS</span>
                                                    </div>
                                                    <Switch
                                                        checked={settings.smsAlerts}
                                                        onCheckedChange={(checked) => updateSetting("smsAlerts", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-primary" />
                                                Relatórios Automáticos
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Relatório Diário</p>
                                                        <p className="text-sm text-muted-foreground">Resumo de consumo do dia</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.dailyReport}
                                                        onCheckedChange={(checked) => updateSetting("dailyReport", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Relatório Semanal</p>
                                                        <p className="text-sm text-muted-foreground">Análise semanal completa</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.weeklyReport}
                                                        onCheckedChange={(checked) => updateSetting("weeklyReport", checked)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>E-mails para Alertas</Label>
                                                    <Input
                                                        type="email"
                                                        value={settings.alertEmails}
                                                        onChange={(e) => updateSetting("alertEmails", e.target.value)}
                                                        placeholder="email@hotel.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Security Tab */}
                                <TabsContent value="security" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-primary" />
                                                Controle de Acesso
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Exigir Autenticação</p>
                                                        <p className="text-sm text-muted-foreground">Login para acessar controles</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.requireAuth}
                                                        onCheckedChange={(checked) => updateSetting("requireAuth", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div>
                                                        <p className="font-medium">Autenticação em Duas Etapas</p>
                                                        <p className="text-sm text-muted-foreground">Maior segurança no login</p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.twoFactor}
                                                        onCheckedChange={(checked) => updateSetting("twoFactor", checked)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Timeout de Sessão (minutos)</Label>
                                                    <Input
                                                        type="number"
                                                        value={settings.sessionTimeout}
                                                        onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-primary" />
                                                Auditoria
                                            </h3>

                                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                <div>
                                                    <p className="font-medium">Log de Ações</p>
                                                    <p className="text-sm text-muted-foreground">Registrar todas as alterações</p>
                                                </div>
                                                <Switch
                                                    checked={settings.logActions}
                                                    onCheckedChange={(checked) => updateSetting("logActions", checked)}
                                                />
                                            </div>

                                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="font-medium text-sm">Compliance</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Logs são mantidos por 2 anos para auditoria
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Integrations Tab */}
                                <TabsContent value="integrations" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-primary" />
                                                Integrações Ativas
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                                            <Building className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">PMS (Sistema de Gestão)</p>
                                                            <p className="text-sm text-muted-foreground">Sincronizar check-in/out</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.pmsIntegration}
                                                        onCheckedChange={(checked) => updateSetting("pmsIntegration", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-cyan-500/20">
                                                            <Sun className="w-4 h-4 text-cyan-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Previsão do Tempo</p>
                                                            <p className="text-sm text-muted-foreground">Ajustar HVAC com clima</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.weatherIntegration}
                                                        onCheckedChange={(checked) => updateSetting("weatherIntegration", checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-green-500/20">
                                                            <Users className="w-4 h-4 text-green-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">Ocupação em Tempo Real</p>
                                                            <p className="text-sm text-muted-foreground">Sync com recepção</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={settings.occupancySync}
                                                        onCheckedChange={(checked) => updateSetting("occupancySync", checked)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                Status das Integrações
                                            </h3>

                                            <div className="space-y-3">
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">PMS Opera</span>
                                                        <Badge className="bg-green-500">Conectado</Badge>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">OpenWeather API</span>
                                                        <Badge className="bg-green-500">Ativo</Badge>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm">BMS Gateway</span>
                                                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                                                            Sincronizando
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
                                <Button variant="outline" onClick={handleReset}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Restaurar Padrões
                                </Button>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={!hasChanges}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar Configurações
                                    </Button>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
