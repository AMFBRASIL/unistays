
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Mail, Send, FileText, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SendEmailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onSuccess?: () => void;
}

export function SendEmailModal({
    open,
    onOpenChange,
    user,
    onSuccess,
}: SendEmailModalProps) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (open) {
            loadTemplates();
            setSubject("");
            setBody("");
            setSelectedTemplateId("custom");
        }
    }, [open]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const response = await api.getEmailTemplates();
            if (response.success && response.data) {
                // Filter templates that are relevant for users if needed, or show all
                setTemplates(response.data.templates);
            }
        } catch (error) {
            console.error("Failed to load templates", error);
            toast.error("Erro ao carregar templates");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (templateId === "custom") {
            setSubject("");
            setBody("");
        } else {
            const template = templates.find(t => t.id.toString() === templateId);
            if (template) {
                setSubject(template.subject || "");
                // If template has bodyHtml prefer that, otherwise bodyText
                setBody(template.bodyHtml || template.bodyText || "");
            }
        }
    };

    const handleSubmit = async () => {
        if (!subject.trim()) {
            toast.error("O assunto é obrigatório");
            return;
        }
        if (!body.trim()) {
            toast.error("O conteúdo do email é obrigatório");
            return;
        }

        try {
            setIsSending(true);

            // Simple variable replacement
            let processedBody = body;
            if (user) {
                processedBody = processedBody
                    .replace(/{name}/g, user.name)
                    .replace(/{email}/g, user.email)
                    .replace(/{phone}/g, user.phone || "");
            }

            await api.sendUserEmail(user.id, {
                subject,
                body: processedBody
            });

            toast.success(`Email enviado para ${user.name}`);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar email");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] sm:h-auto flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Enviar Email</DialogTitle>
                            <DialogDescription>
                                Envie uma mensagem direta para <strong>{user?.name}</strong> ({user?.email}).
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

                        {/* Left Column: Settings */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="space-y-2">
                                <Label>Template</Label>
                                <Select value={selectedTemplateId} onValueChange={handleTemplateChange} disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um template..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                                        {templates.map(t => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Card className="bg-muted/30">
                                <CardContent className="p-3 space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase">Variáveis Disponíveis</Label>
                                    <div className="text-sm space-y-1">
                                        <div className="flex items-center justify-between">
                                            <code className="bg-muted px-1 py-0.5 rounded text-xs">{`{name}`}</code>
                                            <span className="text-xs text-muted-foreground">Nome</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <code className="bg-muted px-1 py-0.5 rounded text-xs">{`{email}`}</code>
                                            <span className="text-xs text-muted-foreground">Email</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <code className="bg-muted px-1 py-0.5 rounded text-xs">{`{phone}`}</code>
                                            <span className="text-xs text-muted-foreground">Telefone</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Editor */}
                        <div className="md:col-span-2 space-y-4 flex flex-col">
                            <div className="space-y-2">
                                <Label>Assunto</Label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Assunto da mensagem"
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <Label>Conteúdo</Label>
                                <Tabs defaultValue="write" className="flex-1 flex flex-col">
                                    <TabsList className="w-full justify-start">
                                        <TabsTrigger value="write">Escrever</TabsTrigger>
                                        <TabsTrigger value="preview">Visualizar</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="write" className="flex-1 mt-2">
                                        <Textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            className="min-h-[300px] resize-none font-mono text-sm leading-relaxed"
                                            placeholder="Digite sua mensagem HTML ou texto aqui..."
                                        />
                                    </TabsContent>
                                    <TabsContent value="preview" className="flex-1 mt-2 border rounded-md p-4 bg-white text-black min-h-[300px] overflow-auto">
                                        <div dangerouslySetInnerHTML={{ __html: body || "<p class='text-gray-400 italic'>Sem conteúdo...</p>" }} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSending}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSending} className="bg-blue-500 hover:bg-blue-600">
                        {isSending ? (
                            <>Enviando...</>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar Email
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
