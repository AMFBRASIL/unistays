import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, LayoutGrid, FileText, MoveUp, MoveDown, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

// Types corresponding to DB Schema
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

export default function PageManagement() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("groups");
    const [groups, setGroups] = useState<PageGroup[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
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
        fetchData();
    }, []);

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

    const handleOpenGroupModal = (group?: PageGroup) => {
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
        setIsGroupModalOpen(true);
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
            setIsGroupModalOpen(false);
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
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao remover grupo.", variant: "destructive" });
        }
    };

    // --- Page Handlers ---

    const handleOpenPageModal = (page?: Page) => {
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
        setIsPageModalOpen(true);
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
            setIsPageModalOpen(false);
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
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao remover página.", variant: "destructive" });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                <LayoutGrid className="w-6 h-6 text-primary" />
                            </div>
                            Gestão de Páginas
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie a estrutura do menu, grupos e páginas do sistema
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-card/50 border border-white/10 p-1 w-full max-w-md">
                        <TabsTrigger value="groups" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Layers className="w-4 h-4 mr-2" />
                            Grupos de Menu
                        </TabsTrigger>
                        <TabsTrigger value="pages" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <FileText className="w-4 h-4 mr-2" />
                            Páginas do Sistema
                        </TabsTrigger>
                    </TabsList>

                    {/* GROUPS TAB */}
                    <TabsContent value="groups">
                        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Grupos de Menu</CardTitle>
                                    <CardDescription>Seções principais da barra lateral</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenGroupModal()}>
                                    <Plus className="w-4 h-4 mr-2" /> Novo Grupo
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Ordem</TableHead>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Ícone (Lucide)</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groups.map((group) => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="outline">{group.order_index}</Badge>
                                                </TableCell>
                                                <TableCell>{group.title}</TableCell>
                                                <TableCell className="font-mono text-xs">{group.icon || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenGroupModal(group)}>
                                                            <Edit className="w-4 h-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {groups.length === 0 && !loading && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    Nenhum grupo encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PAGES TAB */}
                    <TabsContent value="pages">
                        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Páginas do Sistema</CardTitle>
                                    <CardDescription>Itens de menu e rotas associadas</CardDescription>
                                </div>
                                <Button onClick={() => handleOpenPageModal()}>
                                    <Plus className="w-4 h-4 mr-2" /> Nova Página
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Ordem</TableHead>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Rota</TableHead>
                                            <TableHead>Grupo</TableHead>
                                            <TableHead>Badge</TableHead>
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
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        {/* In a real app we would dynamic render the icon here */}
                                                        {page.title}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">{page.route}</TableCell>
                                                    <TableCell>
                                                        {group ? (
                                                            <Badge variant="secondary" className="font-normal">{group.title}</Badge>
                                                        ) : (
                                                            <span className="text-red-500 text-xs">Sem Grupo</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {page.badge && <Badge className="bg-primary/20 text-primary border-0">{page.badge}</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenPageModal(page)}>
                                                                <Edit className="w-4 h-4 text-blue-500" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeletePage(page.id)}>
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {pages.length === 0 && !loading && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    Nenhuma página encontrada.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* --- MODALS --- */}

                {/* Group Modal */}
                <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGroup ? 'Editar Grupo' : 'Novo Grupo'}</DialogTitle>
                            <DialogDescription>Preencha os dados da seção do menu.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="g-title">Título</Label>
                                <Input id="g-title" value={groupByTitle} onChange={e => setGroupTitle(e.target.value)} placeholder="Ex: Operacional" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="g-icon">Ícone (Nome Lucide)</Label>
                                    <Input id="g-icon" value={groupByIcon} onChange={e => setGroupIcon(e.target.value)} placeholder="Ex: LayoutDashboard" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="g-order">Ordem</Label>
                                    <Input id="g-order" type="number" value={groupByOrder} onChange={e => setGroupOrder(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveGroup}>Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Page Modal */}
                <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingPage ? 'Editar Página' : 'Nova Página'}</DialogTitle>
                            <DialogDescription>Configure os detalhes da página e sua posição no menu.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="p-title">Título</Label>
                                <Input id="p-title" value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="Ex: Reservas" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="p-route">Rota (URL)</Label>
                                    <Input id="p-route" value={pageRoute} onChange={e => setPageRoute(e.target.value)} placeholder="Ex: /reservations" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="p-group">Grupo</Label>
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
                                    <Label htmlFor="p-icon">Ícone</Label>
                                    <Input id="p-icon" value={pageIcon} onChange={e => setPageIcon(e.target.value)} placeholder="Nome do ícone" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="p-badge">Badge (Opcional)</Label>
                                    <Input id="p-badge" value={pageBadge} onChange={e => setPageBadge(e.target.value)} placeholder="Ex: Novo" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="p-order">Ordem</Label>
                                    <Input id="p-order" type="number" value={pageOrder} onChange={e => setPageOrder(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPageModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSavePage}>Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
