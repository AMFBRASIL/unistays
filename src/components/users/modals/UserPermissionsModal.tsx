
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Shield, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserPermissionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onSuccess?: () => void;
}

export function UserPermissionsModal({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserPermissionsModalProps) {
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            loadGroups();
            if (user?.group?.id) {
                setSelectedGroupId(user.group.id.toString());
            } else {
                setSelectedGroupId("");
            }
        }
    }, [open, user]);

    const loadGroups = async () => {
        try {
            setIsLoading(true);
            const response = await api.getUserGroups();
            if (response.success && response.data) {
                setGroups(response.data.groups);
            }
        } catch (error) {
            console.error("Failed to load groups", error);
            toast.error("Erro ao carregar grupos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedGroupId) {
            toast.error("Selecione um grupo");
            return;
        }

        try {
            setIsSubmitting(true);
            const data = {
                groupId: parseInt(selectedGroupId)
            };

            const response = await api.updateUser(user.id, data);

            if (response.success) {
                toast.success("Permissões atualizadas com sucesso!");
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.error?.message || "Erro ao atualizar permissões");
            }
        } catch (error) {
            toast.error("Erro ao atualizar permissões");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Gerenciar Permissões</DialogTitle>
                            <DialogDescription>
                                Gerencie o grupo de acesso e nível de permissão de <strong>{user?.name}</strong>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Grupo de Acesso</Label>
                        <Select
                            value={selectedGroupId}
                            onValueChange={setSelectedGroupId}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um grupo" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            O grupo define as permissões base do usuário no sistema.
                        </p>
                    </div>

                    {selectedGroup && (
                        <div className="space-y-3">
                            <Label>Resumo de Permissões ({selectedGroup.name})</Label>
                            <Card className="bg-muted/50 border-muted">
                                <CardContent className="p-4 space-y-2">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {selectedGroup.description || "Sem descrição"}
                                    </div>
                                    {selectedGroup.permissions ? (
                                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                            {Object.entries(selectedGroup.permissions).map(([module, perms]: any) => (
                                                <div key={module} className="flex items-center justify-between bg-background p-2 rounded border text-xs">
                                                    <span className="font-medium capitalize">{module.replace(/_/g, ' ')}</span>
                                                    <div className="flex gap-1">
                                                        {perms.read && <Badge variant="secondary" className="px-1 h-5 text-[10px] bg-green-500/10 text-green-600 hover:bg-green-500/20">Ler</Badge>}
                                                        {perms.write && <Badge variant="secondary" className="px-1 h-5 text-[10px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Criar</Badge>}
                                                        {perms.update && <Badge variant="secondary" className="px-1 h-5 text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Editar</Badge>}
                                                        {perms.delete && <Badge variant="secondary" className="px-1 h-5 text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/20">Excluir</Badge>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">
                                            Este grupo tem permissões totais ou não definidas especificamente.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600">
                        {isSubmitting ? "Salvando..." : "Salvar Permissões"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
