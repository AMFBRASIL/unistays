import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SendReservationChannelsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservationNumber: string;
    guestEmail: string | null | undefined;
    guestPhone: string | null | undefined;
    onSend?: (channels: { email: boolean; whatsapp: boolean }) => Promise<void> | void;
}

export function SendReservationChannelsModal({
    open,
    onOpenChange,
    reservationNumber,
    guestEmail,
    guestPhone,
    onSend,
}: SendReservationChannelsModalProps) {
    const [email, setEmail] = useState(true);
    const [whatsapp, setWhatsapp] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (open) {
            setEmail(true);
            setWhatsapp(true);
        }
    }, [open]);

    const hasEmail = !!guestEmail?.trim();
    const hasPhone = !!guestPhone?.trim();

    const handleSend = async () => {
        if (!email && !whatsapp) {
            toast.error("Selecione pelo menos um meio de comunicação.");
            return;
        }
        if (email && !hasEmail) {
            toast.error("O hóspede não possui e-mail cadastrado.");
            return;
        }
        if (whatsapp && !hasPhone) {
            toast.error("O hóspede não possui telefone/WhatsApp cadastrado.");
            return;
        }

        setSending(true);
        try {
            if (onSend) {
                await onSend({ email: email && hasEmail, whatsapp: whatsapp && hasPhone });
            } else {
                // Placeholder: quando o backend tiver endpoint, usar aqui
                await new Promise((r) => setTimeout(r, 800));
            }
            const channels: string[] = [];
            if (email && hasEmail) channels.push("e-mail");
            if (whatsapp && hasPhone) channels.push("WhatsApp");
            toast.success(`Detalhes da reserva enviados por ${channels.join(" e ")}.`);
            onOpenChange(false);
            setEmail(true);
            setWhatsapp(true);
        } catch (e) {
            console.error(e);
            toast.error("Erro ao enviar. Tente novamente.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enviar detalhes da reserva</DialogTitle>
                    <DialogDescription>
                        Selecione os meios pelos quais o hóspede receberá os detalhes da reserva{" "}
                        <strong>{reservationNumber}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div
                        className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                            email && hasEmail ? "border-primary/30 bg-primary/5" : "border-border"
                        } ${!hasEmail ? "opacity-60" : "cursor-pointer"}`}
                        onClick={() => hasEmail && setEmail(!email)}
                    >
                        <Checkbox
                            id="channel-email"
                            checked={email}
                            onCheckedChange={(checked) => setEmail(!!checked)}
                            disabled={!hasEmail}
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor="channel-email"
                                className="flex items-center gap-2 font-medium cursor-pointer"
                            >
                                <Mail className="h-4 w-4 text-blue-500" />
                                E-mail
                            </Label>
                            {hasEmail ? (
                                <p className="text-sm text-muted-foreground mt-1">{guestEmail}</p>
                            ) : (
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    E-mail não cadastrado
                                </p>
                            )}
                        </div>
                    </div>

                    <div
                        className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                            whatsapp && hasPhone ? "border-primary/30 bg-primary/5" : "border-border"
                        } ${!hasPhone ? "opacity-60" : "cursor-pointer"}`}
                        onClick={() => hasPhone && setWhatsapp(!whatsapp)}
                    >
                        <Checkbox
                            id="channel-whatsapp"
                            checked={whatsapp}
                            onCheckedChange={(checked) => setWhatsapp(!!checked)}
                            disabled={!hasPhone}
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor="channel-whatsapp"
                                className="flex items-center gap-2 font-medium cursor-pointer"
                            >
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                WhatsApp
                            </Label>
                            {hasPhone ? (
                                <p className="text-sm text-muted-foreground mt-1">{guestPhone}</p>
                            ) : (
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                    Telefone não cadastrado
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || (!email && !whatsapp) || (email && !hasEmail) || (whatsapp && !hasPhone)}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {sending ? "Enviando…" : "Enviar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
