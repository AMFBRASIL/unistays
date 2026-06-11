import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewAutomationModalProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
    automationToEdit?: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewAutomationModal({ children, onSuccess, automationToEdit, open: controlledOpen, onOpenChange: setControlledOpen }: NewAutomationModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const [triggerType, setTriggerType] = useState("signup");
    const [saving, setSaving] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    useEffect(() => {
        if (open) {
            if (automationToEdit) {
                setName(automationToEdit.name);
                setTriggerType(automationToEdit.triggerType || "signup");
            } else {
                setName("");
                setTriggerType("signup");
            }
        }
    }, [open, automationToEdit]);

    const handleSave = async () => {
        if (!name) {
            toast.error("Nome é obrigatório");
            return;
        }

        try {
            setSaving(true);
            if (automationToEdit?.id) {
                await api.updateEmailAutomation(automationToEdit.id, { name, triggerType });
                toast.success("Automação atualizada com sucesso!");
            } else {
                await api.createEmailAutomation({ name, triggerType, status: "draft" });
                toast.success("Automação criada com sucesso!");
            }
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Erro ao salvar automação");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{automationToEdit ? "Editar Automação" : "Nova Automação"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Automação</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boas-vindas" />
                    </div>
                    <div className="space-y-2">
                        <Label>Gatilho</Label>
                        <Select value={triggerType} onValueChange={setTriggerType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="signup">Novo Cadastro</SelectItem>
                                <SelectItem value="booking">Reserva Criada</SelectItem>
                                <SelectItem value="checkout">Check-out Realizado</SelectItem>
                                <SelectItem value="birthday">Aniversário</SelectItem>
                                <SelectItem value="abandoned_cart">Carrinho Abandonado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
