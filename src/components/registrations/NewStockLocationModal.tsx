import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import {
    Loader2,
    Warehouse,
    Building2,
    Truck,
    Trash2,
    MapPin,
    Tag,
    Info,
    Check
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewStockLocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    editItem?: any;
}

export function NewStockLocationModal({
    open,
    onOpenChange,
    onSuccess,
    editItem,
}: NewStockLocationModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        type: "principal",
        description: "",
        propertyId: "",
        isActive: true,
    });

    useEffect(() => {
        loadProperties();
    }, []);

    useEffect(() => {
        if (editItem) {
            setFormData({
                name: editItem.name,
                type: editItem.type,
                description: editItem.description || "",
                propertyId: editItem.propertyId ? editItem.propertyId.toString() : "",
                isActive: editItem.isActive !== false,
            });
        } else {
            setFormData({
                name: "",
                type: "principal",
                description: "",
                propertyId: "",
                isActive: true,
            });
        }
    }, [editItem, open]);

    const loadProperties = async () => {
        try {
            const response = await api.getProperties();
            if (response.success) {
                // Handle both possible response formats
                const data = response.data;
                if (Array.isArray(data)) {
                    setProperties(data);
                } else if (data && Array.isArray(data.properties)) {
                    setProperties(data.properties);
                } else {
                    setProperties([]);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar propriedades", error);
            setProperties([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                propertyId: formData.propertyId ? Number(formData.propertyId) : null,
            };

            if (editItem) {
                await api.updateStockLocation(editItem.id, payload);
                toast({
                    title: "Local atualizado",
                    description: "O local de estoque foi atualizado com sucesso.",
                });
            } else {
                await api.createStockLocation(payload);
                toast({
                    title: "Local criado",
                    description: "O local de estoque foi criado com sucesso.",
                });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Ocorreu um erro ao salvar o local de estoque.",
            });
        } finally {
            setLoading(false);
        }
    };

    const locationTypes = [
        {
            id: "principal",
            label: "Estoque Principal",
            description: "Local central de armazenamento de mercadorias.",
            icon: Warehouse,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            id: "satelite",
            label: "Satélite / Setorial",
            description: "Pequenos estoques em andares, copas ou setores específicos.",
            icon: Building2,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
        {
            id: "transito",
            label: "Em Trânsito",
            description: "Mercadorias em movimentação entre locais ou recebimento.",
            icon: Truck,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
        {
            id: "descarte",
            label: "Descarte / Avarias",
            description: "Área destinada a itens danificados, vencidos ou para descarte.",
            icon: Trash2,
            color: "text-red-500",
            bg: "bg-red-500/10",
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
                <div className="p-6 bg-muted/40 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            {editItem ? "Editar Local de Estoque" : "Novo Local de Estoque"}
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            Configure as informações do local físico onde seus produtos serão armazenados.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="max-h-[600px]">
                        <div className="p-6 grid md:grid-cols-2 gap-8">
                            {/* Coluna Esquerda: Dados Básicos */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-muted-foreground" />
                                        Nome do Local
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Almoxarifado Central"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="property" className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        Propriedade Vinculada
                                    </Label>
                                    <Select
                                        value={formData.propertyId}
                                        onValueChange={(value) => setFormData({ ...formData, propertyId: value === "global" ? "" : value })}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Selecione a propriedade (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global">Todas / Geral (Global)</SelectItem>
                                            {properties.map((prop) => (
                                                <SelectItem key={prop.id} value={prop.id.toString()}>
                                                    {prop.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Vincule a uma propriedade específica ou deixe como 'Global' para acesso compartilhado.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                                        <Info className="w-4 h-4 text-muted-foreground" />
                                        Descrição / Observações
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Detalhes sobre a localização, acesso, restrições..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Status Ativo</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Local disponível para uso.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                </div>
                            </div>

                            {/* Coluna Direita: Tipo de Local */}
                            <div className="space-y-4">
                                <Label className="text-sm font-medium flex items-center gap-2 mb-4">
                                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                                    Tipo de Armazenamento
                                </Label>
                                <div className="grid gap-3">
                                    {locationTypes.map((type) => {
                                        const isSelected = formData.type === type.id;
                                        return (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                                className={cn(
                                                    "relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                    isSelected
                                                        ? `border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20`
                                                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                                                )}
                                            >
                                                <div className={cn("p-2 rounded-lg shrink-0 mt-1", type.bg)}>
                                                    <type.icon className={cn("w-5 h-5", type.color)} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-medium text-sm">{type.label}</h4>
                                                    <p className="text-xs text-muted-foreground leading-snug">
                                                        {type.description}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-4 right-4 text-primary">
                                                        <Check className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 border-t bg-muted/40">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="h-11 px-8"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="h-11 px-8">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editItem ? "Salvar Alterações" : "Criar Local"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
