import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Layers, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

interface PageGroup {
    id: number;
    title: string;
    icon: string | null;
    order_index: number;
}

interface Page {
    id: number;
    group_id: number;
    title: string;
    route: string;
    icon: string;
    badge: string | null;
    order_index: number;
}

interface PageManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function PageManagementModal({ open, onOpenChange, onSuccess }: PageManagementModalProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("groups");
    const [groups, setGroups] = useState<PageGroup[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    // Sub-Modal States (for Create/Edit)
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<PageGroup | null>(null);
    const [editingPage, setEditingPage] = useState<Page | null>(null);

    // Form States
    const [groupByTitle, setGroupTitle] = useState("");
    const [groupByIcon, setGroupIcon] = useState("");
    const [groupByOrder, setGroupOrder] = useState("");

    const [pageTitle, setPageTitle] = useState("");
    const [pageRoute, setPageRoute] = useState("");
    const [pageIcon, setPageIcon] = useState("");
    const [pageBadge, setPageBadge] = useState("");
    const [pageGroupId, setPageGroupId] = useState("");
    const [pageOrder, setPageOrder] = useState("");
    const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupsRes, pagesRes] = await Promise.all([
                fetch(getApiUrl('/pages/groups')),
                fetch(getApiUrl('/pages'))
            ]);

            if (!groupsRes.ok || !pagesRes.ok) throw new Error("Failed to fetch data");

            const groupsData = await groupsRes.json();
            const pagesData = await pagesRes.json();

            setGroups(groupsData.data);
            setPages(pagesData.data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar as páginas e grupos.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Group Handlers ---

    const handleOpenGroupDialog = (group?: PageGroup) => {
        if (group) {
            setEditingGroup(group);
            setGroupTitle(group.title);
            setGroupIcon(group.icon || "");
            setGroupOrder(group.order_index.toString());
        } else {
            setEditingGroup(null);
            setGroupTitle("");
            setGroupIcon("");
            setGroupOrder((groups.length + 1).toString());
        }
        setIsGroupDialogOpen(true);
    };

    const handleSaveGroup = async () => {
        try {
            const url = editingGroup
                ? getApiUrl(`/pages/groups/${editingGroup.id}`)
                : getApiUrl('/pages/groups');

            const method = editingGroup ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: groupByTitle,
                    icon: groupByIcon,
                    order_index: parseInt(groupByOrder) || 0
                })
            });

            if (!res.ok) throw new Error("Failed to save group");

            toast({ title: "Sucesso", description: "Grupo salvo com sucesso!" });
            fetchData();
            setIsGroupDialogOpen(false);
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar grupo.", variant: "destructive" });
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm("Tem certeza? Isso pode afetar a exibição do menu.")) return;
        try {
            await fetch(getApiUrl(`/pages/groups/${id}`), { method: 'DELETE' });
            toast({ title: "Sucesso", description: "Grupo removido." });
            fetchData();
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao remover grupo.", variant: "destructive" });
        }
    };

    // --- Page Handlers ---

    const handleOpenPageDialog = (page?: Page) => {
        if (page) {
            setEditingPage(page);
            setPageTitle(page.title);
            setPageRoute(page.route);
            setPageIcon(page.icon);
            setPageBadge(page.badge || "");
            setPageGroupId(page.group_id.toString());
            setPageOrder(page.order_index.toString());
        } else {
            setEditingPage(null);
            setPageTitle("");
            setPageRoute("");
            setPageIcon("");
            setPageBadge("");
            setPageGroupId(groups.length > 0 ? groups[0].id.toString() : "");
            setPageOrder((pages.length + 1).toString());
        }
        setIsPageDialogOpen(true);
    };

    const handleSavePage = async () => {
        try {
            const url = editingPage
                ? getApiUrl(`/pages/${editingPage.id}`)
                : getApiUrl('/pages');

            const method = editingPage ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: parseInt(pageGroupId),
                    title: pageTitle,
                    route: pageRoute,
                    icon: pageIcon,
                    badge: pageBadge || null,
                    order_index: parseInt(pageOrder) || 0
                })
            });

            if (!res.ok) throw new Error("Failed to save page");

            toast({ title: "Sucesso", description: "Página salva com sucesso!" });
            fetchData();
            setIsPageDialogOpen(false);
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar página.", variant: "destructive" });
        }
    };

    const handleDeletePage = async (id: number) => {
        if (!confirm("Tem certeza que deseja apagar esta página?")) return;
        try {
            await fetch(getApiUrl(`/pages/${id}`), { method: 'DELETE' });
            toast({ title: "Sucesso", description: "Página removida." });
            fetchData();
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao remover página.", variant: "destructive" });
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gerenciador de Menus e Páginas</DialogTitle>
                        <DialogDescription>
                            Configure a estrutura de navegação do sistema (Grupos e Páginas).
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="groups">
                                <Layers className="w-4 h-4 mr-2" />
                                Grupos de Menu
                            </TabsTrigger>
                            <TabsTrigger value="pages">
                                <FileText className="w-4 h-4 mr-2" />
                                Páginas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="groups" className="space-y-4">
                            <div className="flex justify-end">
                                <Button size="sm" onClick={() => handleOpenGroupDialog()}>
                                    <Plus className="w-4 h-4 mr-2" /> Novo Grupo
                                </Button>
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Ordem</TableHead>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Ícone</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell>
                                                    <Badge variant="outline">{group.order_index}</Badge>
                                                </TableCell>
                                                <TableCell>{group.title}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{group.icon || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenGroupDialog(group)}>
                                                            <Edit className="w-4 h-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteGroup(group.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="pages" className="space-y-4">
                            <div className="flex justify-end">
                                <Button size="sm" onClick={() => handleOpenPageDialog()}>
                                    <Plus className="w-4 h-4 mr-2" /> Nova Página
                                </Button>
                            </div>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Ordem</TableHead>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Rota</TableHead>
                                            <TableHead>Grupo</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pages.map((page) => {
                                            const group = groups.find(g => g.id === page.group_id);
                                            return (
                                                <TableRow key={page.id}>
                                                    <TableCell>
                                                        <Badge variant="outline">{page.order_index}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{page.title}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{page.route}</TableCell>
                                                    <TableCell>
                                                        {group ? (
                                                            <Badge variant="secondary" className="font-normal">{group.title}</Badge>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenPageDialog(page)}>
                                                                <Edit className="w-4 h-4 text-blue-500" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeletePage(page.id)}>
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Nested Dialogs for Create/Edit */}
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título</Label>
                            <Input value={groupByTitle} onChange={e => setGroupTitle(e.target.value)} placeholder="Ex: Operacional" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Ícone</Label>
                                <Input value={groupByIcon} onChange={e => setGroupIcon(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Ordem</Label>
                                <Input type="number" value={groupByOrder} onChange={e => setGroupOrder(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveGroup}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPage ? 'Editar Página' : 'Nova Página'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título</Label>
                            <Input value={pageTitle} onChange={e => setPageTitle(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Rota</Label>
                                <Input value={pageRoute} onChange={e => setPageRoute(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Grupo</Label>
                                <Select value={pageGroupId} onValueChange={setPageGroupId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map(g => (
                                            <SelectItem key={g.id} value={g.id.toString()}>{g.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>Ícone</Label>
                                <Input value={pageIcon} onChange={e => setPageIcon(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Badge</Label>
                                <Input value={pageBadge} onChange={e => setPageBadge(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Ordem</Label>
                                <Input type="number" value={pageOrder} onChange={e => setPageOrder(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSavePage}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
