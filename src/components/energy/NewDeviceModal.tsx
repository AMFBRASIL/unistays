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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wifi,
    Thermometer,
    Lightbulb,
    Wind,
    Droplets,
    Power,
    Camera,
    Lock,
    Speaker,
    Tv,
    AirVent,
    Plug,
    Sun,
    Moon,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Zap,
    MapPin,
    Settings,
    Activity,
    Shield,
    Bell,
    Clock,
    Gauge,
    CircuitBoard,
    Signal,
    QrCode,
    Search,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewDeviceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const deviceTypes = [
    { id: "thermostat", name: "Termostato", icon: Thermometer, category: "clima", description: "Controle de temperatura inteligente" },
    { id: "hvac", name: "HVAC", icon: AirVent, category: "clima", description: "Sistema de ar condicionado" },
    { id: "light", name: "Iluminação", icon: Lightbulb, category: "iluminacao", description: "Lâmpadas e luminárias smart" },
    { id: "dimmer", name: "Dimmer", icon: Sun, category: "iluminacao", description: "Controle de intensidade" },
    { id: "sensor_temp", name: "Sensor Temperatura", icon: Thermometer, category: "sensor", description: "Monitoramento térmico" },
    { id: "sensor_humidity", name: "Sensor Umidade", icon: Droplets, category: "sensor", description: "Monitoramento de umidade" },
    { id: "sensor_motion", name: "Sensor Presença", icon: Activity, category: "sensor", description: "Detecção de movimento" },
    { id: "sensor_door", name: "Sensor Porta", icon: Lock, category: "sensor", description: "Estado de abertura" },
    { id: "smart_lock", name: "Fechadura Smart", icon: Lock, category: "seguranca", description: "Controle de acesso" },
    { id: "camera", name: "Câmera IP", icon: Camera, category: "seguranca", description: "Vigilância e monitoramento" },
    { id: "tv", name: "Smart TV", icon: Tv, category: "entretenimento", description: "Televisão conectada" },
    { id: "speaker", name: "Alto-falante", icon: Speaker, category: "entretenimento", description: "Som ambiente" },
    { id: "smart_plug", name: "Tomada Smart", icon: Plug, category: "energia", description: "Controle de energia" },
    { id: "meter", name: "Medidor", icon: Gauge, category: "energia", description: "Monitoramento de consumo" },
];

const categories = [
    { id: "all", name: "Todos" },
    { id: "clima", name: "Climatização" },
    { id: "iluminacao", name: "Iluminação" },
    { id: "sensor", name: "Sensores" },
    { id: "seguranca", name: "Segurança" },
    { id: "entretenimento", name: "Entretenimento" },
    { id: "energia", name: "Energia" },
];

const locations = [
    { id: "lobby", name: "Lobby" },
    { id: "restaurant", name: "Restaurante" },
    { id: "pool", name: "Área da Piscina" },
    { id: "gym", name: "Academia" },
    { id: "spa", name: "Spa" },
    { id: "parking", name: "Estacionamento" },
    { id: "external", name: "Área Externa" },
    { id: "corridor", name: "Corredores" },
    { id: "room", name: "Quarto" },
    { id: "suite", name: "Suíte" },
    { id: "conference", name: "Sala de Conferência" },
    { id: "kitchen", name: "Cozinha" },
    { id: "laundry", name: "Lavanderia" },
];

const protocols = [
    { id: "wifi", name: "Wi-Fi", icon: Wifi },
    { id: "zigbee", name: "Zigbee", icon: Signal },
    { id: "zwave", name: "Z-Wave", icon: Signal },
    { id: "bluetooth", name: "Bluetooth", icon: Signal },
    { id: "modbus", name: "Modbus", icon: CircuitBoard },
    { id: "bacnet", name: "BACnet", icon: CircuitBoard },
];

const automationTriggers = [
    { id: "checkin", name: "Check-in do hóspede", description: "Ativa quando o hóspede faz check-in" },
    { id: "checkout", name: "Check-out do hóspede", description: "Ativa quando o hóspede faz check-out" },
    { id: "motion", name: "Detecção de movimento", description: "Ativa com sensor de presença" },
    { id: "schedule", name: "Horário programado", description: "Ativa em horários específicos" },
    { id: "temperature", name: "Limite de temperatura", description: "Ativa por threshold de temp." },
    { id: "door", name: "Abertura de porta", description: "Ativa quando porta abre/fecha" },
];

export function NewDeviceModal({ open, onOpenChange }: NewDeviceModalProps) {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState({
        // Step 1: Device Type
        deviceType: "",
        // Step 2: Identification
        name: "",
        serialNumber: "",
        manufacturer: "",
        model: "",
        firmwareVersion: "",
        // Step 3: Location
        location: "",
        specificLocation: "",
        floor: "",
        room: "",
        zone: "",
        // Step 4: Connection
        protocol: "",
        ipAddress: "",
        macAddress: "",
        gateway: "",
        // Step 5: Configuration
        enableAutomation: true,
        selectedTriggers: [] as string[],
        alertsEnabled: true,
        lowBatteryAlert: true,
        offlineAlert: true,
        scheduleEnabled: false,
        scheduleStart: "06:00",
        scheduleEnd: "23:00",
        // Step 6: Advanced
        powerConsumption: "",
        priority: "normal",
        notes: "",
    });

    const totalSteps = 6;
    const progress = (currentStep / totalSteps) * 100;

    const steps = [
        { number: 1, title: "Tipo", description: "Selecione o dispositivo" },
        { number: 2, title: "Identificação", description: "Dados do dispositivo" },
        { number: 3, title: "Localização", description: "Onde será instalado" },
        { number: 4, title: "Conexão", description: "Configuração de rede" },
        { number: 5, title: "Automação", description: "Regras e alertas" },
        { number: 6, title: "Revisão", description: "Confirmar cadastro" },
    ];

    const filteredDevices = deviceTypes.filter(device => {
        const matchesCategory = selectedCategory === "all" || device.category === selectedCategory;
        const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const selectedDeviceInfo = deviceTypes.find(d => d.id === formData.deviceType);

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.deviceType !== "";
            case 2: return formData.name !== "" && formData.serialNumber !== "";
            case 3: return formData.location !== "";
            case 4: return formData.protocol !== "";
            case 5: return true;
            case 6: return true;
            default: return false;
        }
    };

    const handleSubmit = () => {
        setIsSuccess(true);
        toast({
            title: "Dispositivo Cadastrado!",
            description: `${formData.name} foi adicionado ao sistema com sucesso.`,
        });
    };

    const handleClose = () => {
        setCurrentStep(1);
        setIsSuccess(false);
        setFormData({
            deviceType: "",
            name: "",
            serialNumber: "",
            manufacturer: "",
            model: "",
            firmwareVersion: "",
            location: "",
            specificLocation: "",
            floor: "",
            room: "",
            zone: "",
            protocol: "",
            ipAddress: "",
            macAddress: "",
            gateway: "",
            enableAutomation: true,
            selectedTriggers: [],
            alertsEnabled: true,
            lowBatteryAlert: true,
            offlineAlert: true,
            scheduleEnabled: false,
            scheduleStart: "06:00",
            scheduleEnd: "23:00",
            powerConsumption: "",
            priority: "normal",
            notes: "",
        });
        onOpenChange(false);
    };

    const toggleTrigger = (triggerId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedTriggers: prev.selectedTriggers.includes(triggerId)
                ? prev.selectedTriggers.filter(t => t !== triggerId)
                : [...prev.selectedTriggers, triggerId]
        }));
    };

    const generateSerialNumber = () => {
        const prefix = formData.deviceType.toUpperCase().substring(0, 3);
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData(prev => ({ ...prev, serialNumber: `${prefix}-${random}` }));
    };

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl bg-card border-border">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Dispositivo Cadastrado!</h2>
                        <p className="text-muted-foreground mb-2">{formData.name}</p>
                        <Badge variant="outline" className="mb-6">
                            SN: {formData.serialNumber}
                        </Badge>

                        <div className="bg-muted/50 rounded-xl p-6 w-full max-w-md mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                {selectedDeviceInfo && (
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <selectedDeviceInfo.icon className="w-6 h-6 text-primary" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="font-medium">{selectedDeviceInfo?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {locations.find(l => l.id === formData.location)?.name}
                                        {formData.room && ` • ${formData.room}`}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-background rounded-lg p-3">
                                    <p className="text-muted-foreground">Protocolo</p>
                                    <p className="font-medium">{protocols.find(p => p.id === formData.protocol)?.name}</p>
                                </div>
                                <div className="bg-background rounded-lg p-3">
                                    <p className="text-muted-foreground">Automações</p>
                                    <p className="font-medium">{formData.selectedTriggers.length} ativas</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleClose}>
                                Fechar
                            </Button>
                            <Button onClick={() => {
                                setIsSuccess(false);
                                setCurrentStep(1);
                                setFormData({
                                    deviceType: "",
                                    name: "",
                                    serialNumber: "",
                                    manufacturer: "",
                                    model: "",
                                    firmwareVersion: "",
                                    location: "",
                                    specificLocation: "",
                                    floor: "",
                                    room: "",
                                    zone: "",
                                    protocol: "",
                                    ipAddress: "",
                                    macAddress: "",
                                    gateway: "",
                                    enableAutomation: true,
                                    selectedTriggers: [],
                                    alertsEnabled: true,
                                    lowBatteryAlert: true,
                                    offlineAlert: true,
                                    scheduleEnabled: false,
                                    scheduleStart: "06:00",
                                    scheduleEnd: "23:00",
                                    powerConsumption: "",
                                    priority: "normal",
                                    notes: "",
                                });
                            }}>
                                <Zap className="w-4 h-4 mr-2" />
                                Adicionar Outro
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl h-[85vh] p-0 bg-card border-border overflow-hidden flex flex-col">
                <div className="flex h-full w-full">
                    {/* Left Sidebar - Steps */}
                    <div className="w-64 bg-muted/30 border-r border-border p-6 hidden lg:block">
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg">Novo Dispositivo</h3>
                            <p className="text-sm text-muted-foreground">IoT & Automação</p>
                        </div>

                        <div className="space-y-1">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentStep === step.number
                                        ? "bg-primary/10 text-primary"
                                        : currentStep > step.number
                                            ? "text-green-500"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step.number
                                        ? "bg-primary text-primary-foreground"
                                        : currentStep > step.number
                                            ? "bg-green-500 text-white"
                                            : "bg-muted"
                                        }`}>
                                        {currentStep > step.number ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{step.title}</p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-h-0 bg-background">
                        <DialogHeader className="p-6 pb-0 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-xl">
                                        {steps[currentStep - 1].title}
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {steps[currentStep - 1].description}
                                    </p>
                                </div>
                                <Badge variant="outline">
                                    Passo {currentStep} de {totalSteps}
                                </Badge>
                            </div>
                            <Progress value={progress} className="mt-4" />
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Step 1: Device Type */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar dispositivo..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Button variant="outline" size="icon">
                                            <QrCode className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {categories.map((cat) => (
                                            <Button
                                                key={cat.id}
                                                variant={selectedCategory === cat.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedCategory(cat.id)}
                                            >
                                                {cat.name}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {filteredDevices.map((device) => (
                                            <div
                                                key={device.id}
                                                onClick={() => setFormData(prev => ({ ...prev, deviceType: device.id }))}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-primary/50 ${formData.deviceType === device.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border bg-muted/30"
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-lg w-fit mb-3 ${formData.deviceType === device.id ? "bg-primary/20" : "bg-muted"
                                                    }`}>
                                                    <device.icon className={`w-5 h-5 ${formData.deviceType === device.id ? "text-primary" : "text-muted-foreground"
                                                        }`} />
                                                </div>
                                                <p className="font-medium text-sm">{device.name}</p>
                                                <p className="text-xs text-muted-foreground">{device.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Identification */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    {selectedDeviceInfo && (
                                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                            <div className="p-3 rounded-xl bg-primary/10">
                                                <selectedDeviceInfo.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{selectedDeviceInfo.name}</p>
                                                <p className="text-sm text-muted-foreground">{selectedDeviceInfo.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Nome do Dispositivo *</Label>
                                            <Input
                                                placeholder="Ex: Termostato Lobby Principal"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Número de Série *</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="SN-XXXXXXXX"
                                                    value={formData.serialNumber}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                                                />
                                                <Button variant="outline" size="icon" onClick={generateSerialNumber}>
                                                    <Sparkles className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Fabricante</Label>
                                            <Input
                                                placeholder="Ex: Honeywell, Schneider..."
                                                value={formData.manufacturer}
                                                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Input
                                                placeholder="Modelo do dispositivo"
                                                value={formData.model}
                                                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Versão Firmware</Label>
                                            <Input
                                                placeholder="Ex: v2.1.0"
                                                value={formData.firmwareVersion}
                                                onChange={(e) => setFormData(prev => ({ ...prev, firmwareVersion: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Location */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Área *</Label>
                                            <Select
                                                value={formData.location}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a área" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((loc) => (
                                                        <SelectItem key={loc.id} value={loc.id}>
                                                            {loc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Andar</Label>
                                            <Select
                                                value={formData.floor}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, floor: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o andar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="terreo">Térreo</SelectItem>
                                                    <SelectItem value="1">1º Andar</SelectItem>
                                                    <SelectItem value="2">2º Andar</SelectItem>
                                                    <SelectItem value="3">3º Andar</SelectItem>
                                                    <SelectItem value="4">4º Andar</SelectItem>
                                                    <SelectItem value="5">5º Andar</SelectItem>
                                                    <SelectItem value="subsolo">Subsolo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Quarto/Sala</Label>
                                            <Input
                                                placeholder="Ex: 101, Sala A..."
                                                value={formData.room}
                                                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Zona</Label>
                                            <Select
                                                value={formData.zone}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, zone: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a zona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="norte">Zona Norte</SelectItem>
                                                    <SelectItem value="sul">Zona Sul</SelectItem>
                                                    <SelectItem value="leste">Zona Leste</SelectItem>
                                                    <SelectItem value="oeste">Zona Oeste</SelectItem>
                                                    <SelectItem value="central">Central</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Localização Específica</Label>
                                            <Input
                                                placeholder="Ex: Parede esquerda, Teto..."
                                                value={formData.specificLocation}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specificLocation: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-sm">Dica de Instalação</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Sensores de temperatura devem ser instalados a 1.5m do chão, longe de janelas e saídas de ar.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Connection */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Protocolo de Comunicação *</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {protocols.map((protocol) => (
                                                <div
                                                    key={protocol.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, protocol: protocol.id }))}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.protocol === protocol.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <protocol.icon className={`w-5 h-5 ${formData.protocol === protocol.id ? "text-primary" : "text-muted-foreground"
                                                            }`} />
                                                        <span className="font-medium">{protocol.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {(formData.protocol === "wifi" || formData.protocol === "modbus" || formData.protocol === "bacnet") && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Endereço IP</Label>
                                                <Input
                                                    placeholder="192.168.1.100"
                                                    value={formData.ipAddress}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Endereço MAC</Label>
                                                <Input
                                                    placeholder="AA:BB:CC:DD:EE:FF"
                                                    value={formData.macAddress}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, macAddress: e.target.value }))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Gateway</Label>
                                                <Input
                                                    placeholder="192.168.1.1"
                                                    value={formData.gateway}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, gateway: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Wifi className="w-5 h-5 text-green-500" />
                                            <div>
                                                <p className="font-medium text-sm">Conexão Automática</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Dispositivos Wi-Fi serão detectados automaticamente na rede após configuração.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Automation */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="font-medium">Automações Inteligentes</p>
                                                <p className="text-sm text-muted-foreground">Ativar automações para este dispositivo</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={formData.enableAutomation}
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAutomation: checked }))}
                                        />
                                    </div>

                                    {formData.enableAutomation && (
                                        <>
                                            <div className="space-y-3">
                                                <Label>Gatilhos de Automação</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {automationTriggers.map((trigger) => (
                                                        <div
                                                            key={trigger.id}
                                                            onClick={() => toggleTrigger(trigger.id)}
                                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${formData.selectedTriggers.includes(trigger.id)
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:border-primary/50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium text-sm">{trigger.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{trigger.description}</p>
                                                                </div>
                                                                <Switch checked={formData.selectedTriggers.includes(trigger.id)} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Label>Alertas e Notificações</Label>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Bell className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm">Alertas gerais</span>
                                                        </div>
                                                        <Switch
                                                            checked={formData.alertsEnabled}
                                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alertsEnabled: checked }))}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Power className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm">Alerta de bateria baixa</span>
                                                        </div>
                                                        <Switch
                                                            checked={formData.lowBatteryAlert}
                                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, lowBatteryAlert: checked }))}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Wifi className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm">Alerta de dispositivo offline</span>
                                                        </div>
                                                        <Switch
                                                            checked={formData.offlineAlert}
                                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, offlineAlert: checked }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Agendamento de Operação</Label>
                                                    <Switch
                                                        checked={formData.scheduleEnabled}
                                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduleEnabled: checked }))}
                                                    />
                                                </div>
                                                {formData.scheduleEnabled && (
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <Label className="text-xs">Início</Label>
                                                            <Input
                                                                type="time"
                                                                value={formData.scheduleStart}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, scheduleStart: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <Label className="text-xs">Fim</Label>
                                                            <Input
                                                                type="time"
                                                                value={formData.scheduleEnd}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, scheduleEnd: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Step 6: Review */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <CircuitBoard className="w-4 h-4 text-primary" />
                                                Dispositivo
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tipo</span>
                                                    <span className="font-medium">{selectedDeviceInfo?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Nome</span>
                                                    <span className="font-medium">{formData.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Serial</span>
                                                    <span className="font-medium">{formData.serialNumber}</span>
                                                </div>
                                                {formData.manufacturer && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Fabricante</span>
                                                        <span className="font-medium">{formData.manufacturer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                Localização
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Área</span>
                                                    <span className="font-medium">{locations.find(l => l.id === formData.location)?.name}</span>
                                                </div>
                                                {formData.floor && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Andar</span>
                                                        <span className="font-medium">{formData.floor}</span>
                                                    </div>
                                                )}
                                                {formData.room && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Quarto/Sala</span>
                                                        <span className="font-medium">{formData.room}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-primary" />
                                                Conexão
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Protocolo</span>
                                                    <span className="font-medium">{protocols.find(p => p.id === formData.protocol)?.name}</span>
                                                </div>
                                                {formData.ipAddress && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">IP</span>
                                                        <span className="font-medium">{formData.ipAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                            <h4 className="font-medium flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                Automação
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <Badge variant={formData.enableAutomation ? "default" : "secondary"}>
                                                        {formData.enableAutomation ? "Ativa" : "Desativada"}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Gatilhos</span>
                                                    <span className="font-medium">{formData.selectedTriggers.length} configurados</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Alertas</span>
                                                    <span className="font-medium">{formData.alertsEnabled ? "Ativos" : "Desativados"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Observações</Label>
                                        <Textarea
                                            placeholder="Adicione observações sobre o dispositivo..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border flex items-center justify-between bg-card shrink-0">
                            <Button
                                variant="outline"
                                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleClose()}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {currentStep === 1 ? "Cancelar" : "Voltar"}
                            </Button>

                            <Button
                                onClick={() => currentStep < totalSteps ? setCurrentStep(currentStep + 1) : handleSubmit()}
                                disabled={!canProceed()}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                            >
                                {currentStep === totalSteps ? "Cadastrar Dispositivo" : "Próximo"}
                                {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
