import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Loader2, Plus, Search, Edit, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewStockLocationModal } from "./NewStockLocationModal";

interface StockLocationsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StockLocationsModal({ open, onOpenChange }: StockLocationsModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const response = await api.getStockLocations();
            if (response.success && Array.isArray(response.data)) {
                setLocations(response.data);
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar",
                description: "Não foi possível carregar os locais de estoque.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchLocations();
        }
    }, [open]);

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este local?")) return;

        try {
            await api.deleteStockLocation(id);
            toast({
                title: "Local excluído",
                description: "O local foi removido com sucesso.",
            });
            fetchLocations();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao excluir",
                description: "Não foi possível excluir o local.",
            });
        }
    };

    const filteredLocations = locations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'principal': return 'Estoque Principal';
            case 'satelite': return 'Satélite';
            case 'transito': return 'Em Trânsito';
            case 'descarte': return 'Descarte';
            default: return type;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Locais de Armazenamento
                    </DialogTitle>
                    <DialogDescription>
                        Gerencie os locais físicos onde seus produtos são armazenados.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between gap-4 py-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar locais..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={() => { setEditingItem(null); setNewModalOpen(true); }} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Local
                    </Button>
                </div>

                <div className="flex-1 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Propriedade</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredLocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Nenhum local encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLocations.map((loc) => (
                                    <TableRow key={loc.id}>
                                        <TableCell className="font-medium">{loc.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getTypeLabel(loc.type)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {loc.property?.name ? (
                                                <Badge variant="secondary" className="font-normal">{loc.property.name}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Global</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                                            {loc.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingItem(loc);
                                                        setNewModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(loc.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <NewStockLocationModal
                    open={newModalOpen}
                    onOpenChange={setNewModalOpen}
                    onSuccess={fetchLocations}
                    editItem={editingItem}
                />
            </DialogContent>
        </Dialog>
    );
}
