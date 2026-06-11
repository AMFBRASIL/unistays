import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Mail,
    Phone,
    Send,
    X,
    FileText,
    Image,
    Paperclip,
    Smile,
    Clock,
    CheckCircle2,
    User,
    History,
    Sparkles,
    Zap,
    Gift,
    Calendar,
    Star,
    AlertCircle,
    ChevronRight,
    MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Guest {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
}

interface SendMessageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest: Guest | null;
}

type Channel = "whatsapp" | "email" | "sms";

interface MessageTemplate {
    id: string;
    name: string;
    category: string;
    icon: typeof Gift;
    content: string;
    subject?: string;
}

const channels = [
    {
        id: "whatsapp" as Channel,
        name: "WhatsApp",
        icon: MessageCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        description: "Mensagem instantânea",
    },
    {
        id: "email" as Channel,
        name: "E-mail",
        icon: Mail,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        description: "Comunicação formal",
    },
    {
        id: "sms" as Channel,
        name: "SMS",
        icon: Phone,
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
        borderColor: "border-violet-500/30",
        description: "Notificação rápida",
    },
];

const messageTemplates: MessageTemplate[] = [
    {
        id: "welcome",
        name: "Boas-vindas",
        category: "Recepção",
        icon: Sparkles,
        subject: "Bem-vindo(a) ao nosso hotel!",
        content: "Olá {nome}! 🌟\n\nSeja muito bem-vindo(a) ao nosso hotel! Estamos muito felizes em tê-lo(a) conosco.\n\nSe precisar de qualquer coisa durante sua estadia, não hesite em nos contatar. Estamos à disposição 24 horas.\n\nDesejamos uma estadia incrível!\n\nAtenciosamente,\nEquipe do Hotel",
    },
    {
        id: "checkout",
        name: "Lembrete Check-out",
        category: "Operacional",
        icon: Clock,
        subject: "Lembrete: Check-out amanhã",
        content: "Olá {nome}!\n\nGostaríamos de lembrar que seu check-out está agendado para amanhã às 12h.\n\nCaso precise de late check-out, por favor entre em contato conosco para verificar disponibilidade.\n\nObrigado por escolher nosso hotel!",
    },
    {
        id: "promo",
        name: "Oferta Especial",
        category: "Marketing",
        icon: Gift,
        subject: "Oferta exclusiva para você! 🎁",
        content: "Olá {nome}! 🎉\n\nComo cliente especial, preparamos uma oferta exclusiva para você:\n\n✨ 20% de desconto na sua próxima estadia\n✨ Upgrade de quarto gratuito (sujeito à disponibilidade)\n✨ Café da manhã incluso\n\nReserve agora e aproveite!\n\nVálido até o final do mês.",
    },
    {
        id: "feedback",
        name: "Solicitar Feedback",
        category: "Relacionamento",
        icon: Star,
        subject: "Como foi sua experiência?",
        content: "Olá {nome}!\n\nEsperamos que você tenha tido uma excelente estadia conosco! 😊\n\nSua opinião é muito importante para nós. Gostaríamos de saber como foi sua experiência.\n\nPoderia dedicar alguns minutos para nos contar o que achou?\n\nAgradecemos seu feedback!",
    },
    {
        id: "birthday",
        name: "Aniversário",
        category: "Relacionamento",
        icon: Gift,
        subject: "Feliz Aniversário! 🎂",
        content: "Olá {nome}! 🎂🎉\n\nToda a equipe do hotel deseja a você um Feliz Aniversário!\n\nPara celebrar seu dia especial, preparamos um presente exclusivo: 25% de desconto em sua próxima estadia!\n\nUse o código: BIRTHDAY25\n\nQue este novo ciclo seja repleto de realizações!\n\nCom carinho,\nEquipe do Hotel",
    },
    {
        id: "reservation",
        name: "Confirmação de Reserva",
        category: "Operacional",
        icon: Calendar,
        subject: "Reserva Confirmada!",
        content: "Olá {nome}!\n\nSua reserva foi confirmada com sucesso! ✅\n\n📅 Check-in: [DATA]\n📅 Check-out: [DATA]\n🛏️ Acomodação: [TIPO DE QUARTO]\n\nEstamos ansiosos para recebê-lo(a)!\n\nQualquer dúvida, estamos à disposição.",
    },
];

const conversationHistory = [
    {
        id: 1,
        channel: "whatsapp" as Channel,
        direction: "sent",
        message: "Olá! Confirmamos sua reserva para o dia 25/12.",
        timestamp: "2024-12-10 14:30",
        status: "read",
    },
    {
        id: 2,
        channel: "whatsapp" as Channel,
        direction: "received",
        message: "Perfeito, obrigado! Posso fazer check-in antecipado?",
        timestamp: "2024-12-10 14:35",
        status: "read",
    },
    {
        id: 3,
        channel: "email" as Channel,
        direction: "sent",
        message: "Confirmação de Reserva - Código #RES-2024-001",
        timestamp: "2024-12-08 10:00",
        status: "delivered",
    },
];

export function SendMessageModal({ open, onOpenChange, guest }: SendMessageModalProps) {
    const [selectedChannel, setSelectedChannel] = useState<Channel>("whatsapp");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [activeTab, setActiveTab] = useState<"compose" | "templates" | "history">("compose");
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [isScheduled, setIsScheduled] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

    const handleSend = () => {
        if (!message.trim()) {
            toast.error("Por favor, digite uma mensagem");
            return;
        }

        if (selectedChannel === "email" && !subject.trim()) {
            toast.error("Por favor, informe o assunto do e-mail");
            return;
        }

        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setMessage("");
                setSubject("");
                setAttachedFiles([]);
                onOpenChange(false);
                toast.success(isScheduled ? "Mensagem agendada com sucesso!" : "Mensagem enviada com sucesso!");
            }, 1500);
        }, 2000);
    };

    const applyTemplate = (template: MessageTemplate) => {
        const personalizedContent = template.content.replace(/{nome}/g, guest?.name.split(" ")[0] || "");
        setMessage(personalizedContent);
        if (template.subject) {
            setSubject(template.subject);
        }
        setActiveTab("compose");
        toast.success("Template aplicado!");
    };

    const handleFileAttach = () => {
        const fileName = `arquivo_${attachedFiles.length + 1}.pdf`;
        setAttachedFiles([...attachedFiles, fileName]);
        toast.success("Arquivo anexado!");
    };

    const removeFile = (index: number) => {
        setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    };

    const resetModal = () => {
        setMessage("");
        setSubject("");
        setSelectedChannel("whatsapp");
        setActiveTab("compose");
        setIsSending(false);
        setIsSuccess(false);
        setScheduleDate("");
        setScheduleTime("");
        setIsScheduled(false);
        setAttachedFiles([]);
    };

    if (!guest) return null;

    const tierConfig = {
        bronze: { label: "Bronze", icon: "🥉" },
        silver: { label: "Prata", icon: "🥈" },
        gold: { label: "Ouro", icon: "🥇" },
        platinum: { label: "Platina", icon: "💎" },
    };

    return (
        <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (!value) resetModal(); }}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0">
                {/* Processing/Success Overlay */}
                {(isSending || isSuccess) && (
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        {isSending && (
                            <>
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                                    <Send className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-lg font-medium text-foreground mt-6">Enviando mensagem...</p>
                                <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
                            </>
                        )}
                        {isSuccess && (
                            <>
                                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                                    <CheckCircle2 className="w-10 h-10 text-success" />
                                </div>
                                <p className="text-lg font-medium text-foreground mt-6">
                                    {isScheduled ? "Mensagem agendada!" : "Mensagem enviada!"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {selectedChannel === "whatsapp" && "Enviado via WhatsApp"}
                                    {selectedChannel === "email" && "E-mail enviado"}
                                    {selectedChannel === "sms" && "SMS enviado"}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <div className="flex h-[85vh]">
                    {/* Left Sidebar */}
                    <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
                        {/* Guest Info */}
                        <div className="p-4 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                                    {guest.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{guest.name}</h3>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <span>{tierConfig[guest.tier].icon}</span>
                                        <span>{tierConfig[guest.tier].label}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate">{guest.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    <span>{guest.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setActiveTab("compose")}
                                className={cn(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    activeTab === "compose"
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Compor
                            </button>
                            <button
                                onClick={() => setActiveTab("templates")}
                                className={cn(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    activeTab === "templates"
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Templates
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={cn(
                                    "flex-1 py-3 text-sm font-medium transition-colors",
                                    activeTab === "history"
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Histórico
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <ScrollArea className="flex-1">
                            {activeTab === "compose" && (
                                <div className="p-4 space-y-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Canal de Envio</Label>
                                        <div className="space-y-2">
                                            {channels.map((channel) => (
                                                <button
                                                    key={channel.id}
                                                    onClick={() => setSelectedChannel(channel.id)}
                                                    className={cn(
                                                        "w-full p-3 rounded-xl border-2 transition-all text-left",
                                                        selectedChannel === channel.id
                                                            ? cn(channel.borderColor, channel.bgColor, "border-2")
                                                            : "border-border bg-card hover:bg-muted/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-2 rounded-lg", channel.bgColor)}>
                                                            <channel.icon className={cn("w-4 h-4", channel.color)} />
                                                        </div>
                                                        <div>
                                                            <p className={cn("font-medium", selectedChannel === channel.id ? channel.color : "text-foreground")}>
                                                                {channel.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{channel.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Ações Rápidas</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-auto py-2 flex-col gap-1"
                                                onClick={handleFileAttach}
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                <span className="text-xs">Anexar</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-auto py-2 flex-col gap-1"
                                                onClick={() => setActiveTab("templates")}
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span className="text-xs">Template</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn("h-auto py-2 flex-col gap-1", isScheduled && "border-primary bg-primary/10")}
                                                onClick={() => setIsScheduled(!isScheduled)}
                                            >
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs">Agendar</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-auto py-2 flex-col gap-1"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs">IA</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Schedule Options */}
                                    {isScheduled && (
                                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                                            <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                Agendar Envio
                                            </p>
                                            <div className="space-y-2">
                                                <Input
                                                    type="date"
                                                    value={scheduleDate}
                                                    onChange={(e) => setScheduleDate(e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                                <Input
                                                    type="time"
                                                    value={scheduleTime}
                                                    onChange={(e) => setScheduleTime(e.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "templates" && (
                                <div className="p-4 space-y-2">
                                    {messageTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplate(template)}
                                            className="w-full p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <template.icon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground text-sm">{template.name}</p>
                                                    <p className="text-xs text-muted-foreground">{template.category}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === "history" && (
                                <div className="p-4 space-y-3">
                                    {conversationHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "p-3 rounded-xl border",
                                                item.direction === "sent"
                                                    ? "bg-primary/5 border-primary/20"
                                                    : "bg-muted/50 border-border"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {channels.find(c => c.id === item.channel)?.name}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.direction === "sent" ? "Enviado" : "Recebido"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">{item.message}</p>
                                            <p className="text-xs text-muted-foreground mt-2">{item.timestamp}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-muted/30 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl",
                                            channels.find(c => c.id === selectedChannel)?.bgColor
                                        )}>
                                            <MessageSquare className={cn(
                                                "w-5 h-5",
                                                channels.find(c => c.id === selectedChannel)?.color
                                            )} />
                                        </div>
                                        Enviar Mensagem
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Envie uma mensagem para {guest.name.split(" ")[0]} via {channels.find(c => c.id === selectedChannel)?.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedChannel === "whatsapp" && (
                                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                            Online
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Message Composer */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="max-w-2xl mx-auto space-y-6">
                                {/* Recipient Info */}
                                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">Destinatário</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{guest.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedChannel === "email" && guest.email}
                                                {selectedChannel === "whatsapp" && guest.phone}
                                                {selectedChannel === "sms" && guest.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject (for email) */}
                                {selectedChannel === "email" && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Assunto</Label>
                                        <Input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="Digite o assunto do e-mail..."
                                            className="h-12"
                                        />
                                    </div>
                                )}

                                {/* Message Input */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Mensagem</Label>
                                    <div className="relative">
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Digite sua mensagem aqui..."
                                            className="min-h-[200px] resize-none pr-12 text-base leading-relaxed"
                                        />
                                        <div className="absolute bottom-3 right-3 flex items-center gap-1">
                                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                                <Smile className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{message.length} caracteres</span>
                                        {selectedChannel === "sms" && (
                                            <span className={message.length > 160 ? "text-warning" : ""}>
                                                {Math.ceil(message.length / 160) || 1} SMS
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Attached Files */}
                                {attachedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Anexos</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {attachedFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border"
                                                >
                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm text-foreground">{file}</span>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="p-1 rounded-full hover:bg-destructive/20 transition-colors"
                                                    >
                                                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Suggestions */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/10 border border-violet-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-violet-500" />
                                        <span className="text-sm font-medium text-foreground">Sugestões da IA</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setMessage(message + "\n\nEstamos à disposição para qualquer dúvida!")}
                                            className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/50 transition-colors"
                                        >
                                            + Adicionar despedida
                                        </button>
                                        <button
                                            onClick={() => setMessage(message + "\n\n📞 (11) 1234-5678 | 📧 contato@hotel.com")}
                                            className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/50 transition-colors"
                                        >
                                            + Adicionar contatos
                                        </button>
                                        <button
                                            onClick={() => setMessage(`Olá ${guest.name.split(" ")[0]}! 😊\n\n${message}`)}
                                            className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/50 transition-colors"
                                        >
                                            + Personalizar saudação
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" onClick={handleFileAttach} className="gap-2">
                                    <Paperclip className="w-4 h-4" />
                                    Anexar
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Image className="w-4 h-4" />
                                    Imagem
                                </Button>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="gradient"
                                    onClick={handleSend}
                                    disabled={!message.trim() || (selectedChannel === "email" && !subject.trim())}
                                    className="gap-2 min-w-[140px]"
                                >
                                    <Send className="w-4 h-4" />
                                    {isScheduled ? "Agendar" : "Enviar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
