import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewSegmentModalProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
    segmentToEdit?: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewSegmentModal({ children, onSuccess, segmentToEdit, open: controlledOpen, onOpenChange: setControlledOpen }: NewSegmentModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [criteria, setCriteria] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

    useEffect(() => {
        if (open) {
            if (segmentToEdit) {
                setName(segmentToEdit.name);
                setDescription(segmentToEdit.description || "");
                setCriteria(segmentToEdit.criteria || {});
            } else {
                setName("");
                setDescription("");
                setCriteria({});
            }
        }
    }, [open, segmentToEdit]);

    const handleSave = async () => {
        if (!name) {
            toast.error("Nome é obrigatório");
            return;
        }

        try {
            setSaving(true);
            // Clean empty criteria
            const cleanedCriteria = { ...criteria };
            if (!cleanedCriteria.location) delete cleanedCriteria.location;
            if (!cleanedCriteria.minStays) delete cleanedCriteria.minStays;
            if (!cleanedCriteria.lastStayDays) delete cleanedCriteria.lastStayDays;

            if (segmentToEdit?.id) {
                await api.updateEmailSegment(segmentToEdit.id, { name, description, criteria: cleanedCriteria });
                toast.success("Segmento atualizado com sucesso!");
            } else {
                await api.createEmailSegment({ name, description, criteria: cleanedCriteria });
                toast.success("Segmento criado com sucesso!");
            }
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error("Erro ao salvar segmento");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{segmentToEdit ? "Editar Segmento" : "Novo Segmento"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Segmento</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Hóspedes VIP" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do critério de segmentação" />
                    </div>
                </div>

                <div className="border-t pt-4 mt-4">
                    <h4 className="mb-4 text-sm font-medium">Critérios de Segmentação</h4>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Localização (Cidade/Estado)</Label>
                                <Input
                                    id="location"
                                    value={criteria.location || ''}
                                    onChange={(e) => setCriteria({ ...criteria, location: e.target.value })}
                                    placeholder="Ex: São Paulo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="minStays">Mínimo de Estadias</Label>
                                <Input
                                    id="minStays"
                                    type="number"
                                    min="0"
                                    value={criteria.minStays || ''}
                                    onChange={(e) => setCriteria({ ...criteria, minStays: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastStayDays">Última estadia (dias atrás)</Label>
                            <Input
                                id="lastStayDays"
                                type="number"
                                min="0"
                                value={criteria.lastStayDays || ''}
                                onChange={(e) => setCriteria({ ...criteria, lastStayDays: parseInt(e.target.value) || 0 })}
                                placeholder="Ex: 30 (para hóspedes recentes)"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Deixe em branco para ignorar este critério.
                            </p>
                        </div>
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
