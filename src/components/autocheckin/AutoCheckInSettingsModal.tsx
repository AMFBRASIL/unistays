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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Settings,
    QrCode,
    Mail,
    MessageSquare,
    Clock,
    Key,
    Shield,
    FileText,
    Camera,
    Smartphone,
    Bell,
    Palette,
    Globe,
    Lock,
    Zap,
    Users,
    CreditCard,
    Link2,
    Webhook,
    CheckCircle2,
    AlertTriangle,
    Save,
    RotateCcw,
    HelpCircle,
    Wifi,
    DoorOpen,
    Timer,
    Languages,
    Image,
    Upload,
    Printer,
    Monitor,
    Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoCheckInSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AutoCheckInSettingsModal({ open, onOpenChange }: AutoCheckInSettingsModalProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("general");

    // General settings
    const [autoCheckInEnabled, setAutoCheckInEnabled] = useState(true);
    const [checkInStartTime, setCheckInStartTime] = useState("14:00");
    const [checkInEndTime, setCheckInEndTime] = useState("23:00");
    const [earlyCheckInAllowed, setEarlyCheckInAllowed] = useState(true);
    const [earlyCheckInFee, setEarlyCheckInFee] = useState("50");
    const [lateCheckInAllowed, setLateCheckInAllowed] = useState(true);
    const [autoRoomAssignment, setAutoRoomAssignment] = useState(true);

    // QR Code settings
    const [qrExpiration, setQrExpiration] = useState("24");
    const [qrStyle, setQrStyle] = useState("modern");
    const [includeHotelLogo, setIncludeHotelLogo] = useState(true);
    const [customQrColor, setCustomQrColor] = useState("#10b981");

    // Notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(true);
    const [whatsappNotifications, setWhatsappNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [notifyBefore, setNotifyBefore] = useState([24]);
    const [reminderEnabled, setReminderEnabled] = useState(true);

    // Document settings
    const [requireIdDocument, setRequireIdDocument] = useState(true);
    const [requireSelfie, setRequireSelfie] = useState(true);
    const [requireSignature, setRequireSignature] = useState(true);
    const [autoVerifyDocuments, setAutoVerifyDocuments] = useState(true);
    const [acceptedDocuments, setAcceptedDocuments] = useState(["rg", "cnh", "passport"]);

    // Digital key settings
    const [digitalKeyEnabled, setDigitalKeyEnabled] = useState(true);
    const [keyValidityBefore, setKeyValidityBefore] = useState("30");
    const [autoKeyDeactivation, setAutoKeyDeactivation] = useState(true);
    const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
    const [nfcEnabled, setNfcEnabled] = useState(true);

    // Security settings
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [faceRecognition, setFaceRecognition] = useState(true);
    const [fraudDetection, setFraudDetection] = useState(true);
    const [maxAttempts, setMaxAttempts] = useState("3");
    const [lockoutDuration, setLockoutDuration] = useState("30");

    // Integration settings
    const [pmsIntegration, setPmsIntegration] = useState(true);
    const [paymentIntegration, setPaymentIntegration] = useState(true);
    const [lockSystemIntegration, setLockSystemIntegration] = useState(true);

    // Customization settings
    const [welcomeMessage, setWelcomeMessage] = useState("Bem-vindo ao nosso hotel! Complete seu check-in digital em poucos passos.");
    const [primaryColor, setPrimaryColor] = useState("#10b981");
    const [language, setLanguage] = useState("pt-BR");

    const handleSave = () => {
        toast({
            title: "Configurações Salvas",
            description: "Todas as configurações do Auto Check-in foram atualizadas com sucesso.",
        });
        onOpenChange(false);
    };

    const handleReset = () => {
        toast({
            title: "Configurações Restauradas",
            description: "As configurações foram restauradas para os valores padrão.",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                            <Settings className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">Configurações do Auto Check-in</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Personalize todas as opções do check-in digital
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(90vh-180px)]">
                    {/* Sidebar Tabs */}
                    <div className="w-56 border-r border-border/50 bg-muted/20">
                        <ScrollArea className="h-full py-4">
                            <div className="px-3 space-y-1">
                                {[
                                    { id: "general", label: "Geral", icon: Settings },
                                    { id: "qrcode", label: "QR Code", icon: QrCode },
                                    { id: "notifications", label: "Notificações", icon: Bell },
                                    { id: "documents", label: "Documentos", icon: FileText },
                                    { id: "digitalkey", label: "Chave Digital", icon: Key },
                                    { id: "security", label: "Segurança", icon: Shield },
                                    { id: "integrations", label: "Integrações", icon: Link2 },
                                    { id: "customization", label: "Personalização", icon: Palette },
                                    { id: "advanced", label: "Avançado", icon: Zap },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Content Area */}
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            {/* General Tab */}
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                Horário de Check-in
                                            </CardTitle>
                                            <CardDescription>Configure os horários permitidos para check-in</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Auto Check-in Ativo</Label>
                                                    <p className="text-sm text-muted-foreground">Permitir check-in digital automático</p>
                                                </div>
                                                <Switch checked={autoCheckInEnabled} onCheckedChange={setAutoCheckInEnabled} />
                                            </div>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Horário de Início</Label>
                                                    <Input type="time" value={checkInStartTime} onChange={(e) => setCheckInStartTime(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Horário de Término</Label>
                                                    <Input type="time" value={checkInEndTime} onChange={(e) => setCheckInEndTime(e.target.value)} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Timer className="w-4 h-4 text-blue-500" />
                                                Check-in Antecipado/Tardio
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Permitir Check-in Antecipado</Label>
                                                    <p className="text-sm text-muted-foreground">Hóspedes podem fazer check-in antes do horário</p>
                                                </div>
                                                <Switch checked={earlyCheckInAllowed} onCheckedChange={setEarlyCheckInAllowed} />
                                            </div>
                                            {earlyCheckInAllowed && (
                                                <div className="space-y-2">
                                                    <Label>Taxa de Early Check-in (R$)</Label>
                                                    <Input type="number" value={earlyCheckInFee} onChange={(e) => setEarlyCheckInFee(e.target.value)} />
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Permitir Check-in Tardio</Label>
                                                    <p className="text-sm text-muted-foreground">Check-in após o horário padrão</p>
                                                </div>
                                                <Switch checked={lateCheckInAllowed} onCheckedChange={setLateCheckInAllowed} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <DoorOpen className="w-4 h-4 text-purple-500" />
                                                Atribuição de Quartos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Atribuição Automática de Quartos</Label>
                                                    <p className="text-sm text-muted-foreground">Sistema seleciona o melhor quarto disponível</p>
                                                </div>
                                                <Switch checked={autoRoomAssignment} onCheckedChange={setAutoRoomAssignment} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* QR Code Tab */}
                            {activeTab === "qrcode" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <QrCode className="w-4 h-4 text-emerald-500" />
                                                Configurações do QR Code
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Validade do QR Code (horas)</Label>
                                                    <Select value={qrExpiration} onValueChange={setQrExpiration}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="12">12 horas</SelectItem>
                                                            <SelectItem value="24">24 horas</SelectItem>
                                                            <SelectItem value="48">48 horas</SelectItem>
                                                            <SelectItem value="72">72 horas</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Estilo do QR Code</Label>
                                                    <Select value={qrStyle} onValueChange={setQrStyle}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="modern">Moderno</SelectItem>
                                                            <SelectItem value="classic">Clássico</SelectItem>
                                                            <SelectItem value="rounded">Arredondado</SelectItem>
                                                            <SelectItem value="dots">Pontos</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Incluir Logo do Hotel</Label>
                                                    <p className="text-sm text-muted-foreground">Exibir logo no centro do QR Code</p>
                                                </div>
                                                <Switch checked={includeHotelLogo} onCheckedChange={setIncludeHotelLogo} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Cor do QR Code</Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="color"
                                                        value={customQrColor}
                                                        onChange={(e) => setCustomQrColor(e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
                                                    />
                                                    <Input
                                                        value={customQrColor}
                                                        onChange={(e) => setCustomQrColor(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Monitor className="w-4 h-4 text-blue-500" />
                                                Preview do QR Code
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl border border-border/50">
                                                <div className="text-center">
                                                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl flex items-center justify-center border-2 border-dashed border-emerald-500/30">
                                                        <QrCode className="w-16 h-16 text-emerald-500" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-3">Preview do QR Code</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-amber-500" />
                                                Canais de Notificação
                                            </CardTitle>
                                            <CardDescription>Configure como os hóspedes serão notificados</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                                        <Mail className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>E-mail</Label>
                                                        <p className="text-sm text-muted-foreground">Enviar link por e-mail</p>
                                                    </div>
                                                </div>
                                                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <MessageSquare className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>SMS</Label>
                                                        <p className="text-sm text-muted-foreground">Enviar link por SMS</p>
                                                    </div>
                                                </div>
                                                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-green-500/10">
                                                        <MessageSquare className="w-4 h-4 text-green-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>WhatsApp</Label>
                                                        <p className="text-sm text-muted-foreground">Enviar link via WhatsApp</p>
                                                    </div>
                                                </div>
                                                <Switch checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-rose-500/10">
                                                        <Smartphone className="w-4 h-4 text-rose-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Push Notifications</Label>
                                                        <p className="text-sm text-muted-foreground">Notificações no app</p>
                                                    </div>
                                                </div>
                                                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Timer className="w-4 h-4 text-cyan-500" />
                                                Lembretes Automáticos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Ativar Lembretes</Label>
                                                    <p className="text-sm text-muted-foreground">Enviar lembretes antes do check-in</p>
                                                </div>
                                                <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                                            </div>
                                            {reminderEnabled && (
                                                <div className="space-y-3">
                                                    <Label>Enviar lembrete (horas antes): {notifyBefore[0]}h</Label>
                                                    <Slider
                                                        value={notifyBefore}
                                                        onValueChange={setNotifyBefore}
                                                        max={72}
                                                        min={1}
                                                        step={1}
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === "documents" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                Documentos Exigidos
                                            </CardTitle>
                                            <CardDescription>Configure quais documentos são obrigatórios</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Documento de Identidade</Label>
                                                        <p className="text-sm text-muted-foreground">RG, CNH ou Passaporte</p>
                                                    </div>
                                                </div>
                                                <Switch checked={requireIdDocument} onCheckedChange={setRequireIdDocument} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <Camera className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Selfie de Verificação</Label>
                                                        <p className="text-sm text-muted-foreground">Foto do hóspede para comparação</p>
                                                    </div>
                                                </div>
                                                <Switch checked={requireSelfie} onCheckedChange={setRequireSelfie} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                                        <FileText className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Assinatura Digital</Label>
                                                        <p className="text-sm text-muted-foreground">Termos e condições</p>
                                                    </div>
                                                </div>
                                                <Switch checked={requireSignature} onCheckedChange={setRequireSignature} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                Verificação Automática
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>OCR e Validação Automática</Label>
                                                    <p className="text-sm text-muted-foreground">IA verifica documentos automaticamente</p>
                                                </div>
                                                <Switch checked={autoVerifyDocuments} onCheckedChange={setAutoVerifyDocuments} />
                                            </div>
                                            {autoVerifyDocuments && (
                                                <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                    <div className="flex items-center gap-2 text-emerald-500">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="text-sm font-medium">IA de verificação ativa</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Documentos serão validados em tempo real
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-cyan-500" />
                                                Tipos de Documentos Aceitos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: "rg", label: "RG" },
                                                    { id: "cnh", label: "CNH" },
                                                    { id: "passport", label: "Passaporte" },
                                                    { id: "rne", label: "RNE" },
                                                    { id: "ctps", label: "CTPS" },
                                                    { id: "oab", label: "OAB" },
                                                ].map((doc) => (
                                                    <div
                                                        key={doc.id}
                                                        onClick={() => {
                                                            if (acceptedDocuments.includes(doc.id)) {
                                                                setAcceptedDocuments(acceptedDocuments.filter(d => d !== doc.id));
                                                            } else {
                                                                setAcceptedDocuments([...acceptedDocuments, doc.id]);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${acceptedDocuments.includes(doc.id)
                                                                ? "bg-primary/10 border-primary/30"
                                                                : "bg-background/50 border-border/50 hover:border-primary/20"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${acceptedDocuments.includes(doc.id) ? "border-primary bg-primary" : "border-muted-foreground"
                                                                }`}>
                                                                {acceptedDocuments.includes(doc.id) && (
                                                                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium">{doc.label}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Digital Key Tab */}
                            {activeTab === "digitalkey" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Key className="w-4 h-4 text-emerald-500" />
                                                Chave Digital
                                            </CardTitle>
                                            <CardDescription>Configure o acesso digital aos quartos</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Chave Digital Ativa</Label>
                                                    <p className="text-sm text-muted-foreground">Permite acesso via smartphone</p>
                                                </div>
                                                <Switch checked={digitalKeyEnabled} onCheckedChange={setDigitalKeyEnabled} />
                                            </div>
                                            {digitalKeyEnabled && (
                                                <>
                                                    <Separator />
                                                    <div className="space-y-2">
                                                        <Label>Ativar chave (minutos antes do check-in)</Label>
                                                        <Select value={keyValidityBefore} onValueChange={setKeyValidityBefore}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="0">No momento do check-in</SelectItem>
                                                                <SelectItem value="15">15 minutos antes</SelectItem>
                                                                <SelectItem value="30">30 minutos antes</SelectItem>
                                                                <SelectItem value="60">1 hora antes</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <Label>Desativação Automática</Label>
                                                            <p className="text-sm text-muted-foreground">Desativar após check-out</p>
                                                        </div>
                                                        <Switch checked={autoKeyDeactivation} onCheckedChange={setAutoKeyDeactivation} />
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-blue-500" />
                                                Tecnologias de Acesso
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                                        <Wifi className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Bluetooth Low Energy (BLE)</Label>
                                                        <p className="text-sm text-muted-foreground">Desbloqueio por aproximação</p>
                                                    </div>
                                                </div>
                                                <Switch checked={bluetoothEnabled} onCheckedChange={setBluetoothEnabled} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <Smartphone className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>NFC</Label>
                                                        <p className="text-sm text-muted-foreground">Acesso via NFC</p>
                                                    </div>
                                                </div>
                                                <Switch checked={nfcEnabled} onCheckedChange={setNfcEnabled} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-red-500" />
                                                Segurança do Check-in
                                            </CardTitle>
                                            <CardDescription>Configure medidas de segurança adicionais</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Autenticação em Dois Fatores</Label>
                                                    <p className="text-sm text-muted-foreground">Código de verificação por SMS</p>
                                                </div>
                                                <Switch checked={twoFactorRequired} onCheckedChange={setTwoFactorRequired} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Reconhecimento Facial</Label>
                                                    <p className="text-sm text-muted-foreground">Comparar selfie com documento</p>
                                                </div>
                                                <Switch checked={faceRecognition} onCheckedChange={setFaceRecognition} />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Detecção de Fraude</Label>
                                                    <p className="text-sm text-muted-foreground">IA detecta documentos falsificados</p>
                                                </div>
                                                <Switch checked={fraudDetection} onCheckedChange={setFraudDetection} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-amber-500" />
                                                Proteção contra Ataques
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Máximo de Tentativas</Label>
                                                    <Select value={maxAttempts} onValueChange={setMaxAttempts}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">3 tentativas</SelectItem>
                                                            <SelectItem value="5">5 tentativas</SelectItem>
                                                            <SelectItem value="10">10 tentativas</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Tempo de Bloqueio (min)</Label>
                                                    <Select value={lockoutDuration} onValueChange={setLockoutDuration}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="15">15 minutos</SelectItem>
                                                            <SelectItem value="30">30 minutos</SelectItem>
                                                            <SelectItem value="60">1 hora</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                                <div className="flex items-center gap-2 text-amber-500">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Proteção ativa</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Após {maxAttempts} tentativas falhas, o acesso será bloqueado por {lockoutDuration} minutos
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Integrations Tab */}
                            {activeTab === "integrations" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Link2 className="w-4 h-4 text-blue-500" />
                                                Integrações do Sistema
                                            </CardTitle>
                                            <CardDescription>Conecte com outros sistemas do hotel</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                                        <Monitor className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>PMS (Property Management)</Label>
                                                        <p className="text-sm text-muted-foreground">Sincronização de reservas</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Conectado</Badge>
                                                    <Switch checked={pmsIntegration} onCheckedChange={setPmsIntegration} />
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                                        <CreditCard className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Gateway de Pagamento</Label>
                                                        <p className="text-sm text-muted-foreground">Cobranças automáticas</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Conectado</Badge>
                                                    <Switch checked={paymentIntegration} onCheckedChange={setPaymentIntegration} />
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <Key className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <Label>Sistema de Fechaduras</Label>
                                                        <p className="text-sm text-muted-foreground">Chaves digitais</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Conectado</Badge>
                                                    <Switch checked={lockSystemIntegration} onCheckedChange={setLockSystemIntegration} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Webhook className="w-4 h-4 text-amber-500" />
                                                Webhooks
                                            </CardTitle>
                                            <CardDescription>Notificações para sistemas externos</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">POST</Badge>
                                                        <span className="text-sm font-mono text-muted-foreground">check-in.completed</span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Ativo</Badge>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">POST</Badge>
                                                        <span className="text-sm font-mono text-muted-foreground">document.verified</span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500">Ativo</Badge>
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Adicionar Webhook
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Customization Tab */}
                            {activeTab === "customization" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-purple-500" />
                                                Aparência
                                            </CardTitle>
                                            <CardDescription>Personalize a experiência do hóspede</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Cor Principal</Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="color"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
                                                    />
                                                    <Input
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <Label>Logo do Hotel</Label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-20 rounded-lg bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                                                        <Image className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <Button variant="outline">
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Logo
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                                Mensagens Personalizadas
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Mensagem de Boas-vindas</Label>
                                                <Textarea
                                                    value={welcomeMessage}
                                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Languages className="w-4 h-4 text-emerald-500" />
                                                Idioma
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                                    <SelectItem value="en-US">English (US)</SelectItem>
                                                    <SelectItem value="es-ES">Español</SelectItem>
                                                    <SelectItem value="fr-FR">Français</SelectItem>
                                                    <SelectItem value="de-DE">Deutsch</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Advanced Tab */}
                            {activeTab === "advanced" && (
                                <div className="space-y-6">
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                Configurações Avançadas
                                            </CardTitle>
                                            <CardDescription>Opções para usuários avançados</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Modo Debug</Label>
                                                    <p className="text-sm text-muted-foreground">Logs detalhados para diagnóstico</p>
                                                </div>
                                                <Switch />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>API Rate Limiting</Label>
                                                    <p className="text-sm text-muted-foreground">Limitar requisições por minuto</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Cache de Dados</Label>
                                                    <p className="text-sm text-muted-foreground">Armazenar dados localmente</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border/50">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Printer className="w-4 h-4 text-blue-500" />
                                                Impressão
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Imprimir Comprovante</Label>
                                                    <p className="text-sm text-muted-foreground">Gerar comprovante após check-in</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Imprimir FNRH</Label>
                                                    <p className="text-sm text-muted-foreground">Ficha Nacional de Registro</p>
                                                </div>
                                                <Switch defaultChecked />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-red-500/20 bg-red-500/5">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base flex items-center gap-2 text-red-500">
                                                <AlertTriangle className="w-4 h-4" />
                                                Zona de Perigo
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Resetar Configurações</Label>
                                                    <p className="text-sm text-muted-foreground">Restaurar valores padrão</p>
                                                </div>
                                                <Button variant="destructive" size="sm" onClick={handleReset}>
                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                    Resetar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                    <Button variant="ghost" size="sm">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Ajuda
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Configurações
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
