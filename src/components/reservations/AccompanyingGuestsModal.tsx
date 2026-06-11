import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    User,
    Trash2,
    Plus,
    Phone,
    IdCard,
    Search,
    X,
    Users,
    Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface AccompanyingGuestsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guests: any[];
    onUpdateGuests: (guests: any[]) => void;
}

export function AccompanyingGuestsModal({
    open,
    onOpenChange,
    guests,
    onUpdateGuests
}: AccompanyingGuestsModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const normalizeGuest = (guest: any) => {
        const fullName = guest.name ?? `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim();
        return {
            ...guest,
            name: fullName,
            email: guest.email ?? "",
            phone: guest.phone ?? guest.mobilePhone ?? "",
            cpf: guest.cpf ?? guest.document ?? guest.documentNumber ?? "",
            document: guest.document ?? guest.documentNumber ?? guest.cpf ?? "",
        };
    };

    // Reset state when closing add mode
    const handleCloseAdd = () => {
        setIsAdding(false);
        setSearchTerm("");
        setSearchResults([]);
    };

    // Search logic
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await api.getGuests(searchTerm);
                if (response.success) {
                    const rawGuests = response.data?.guests || (Array.isArray(response.data) ? response.data : []);
                    const existingIds = guests.map(g => g.id);
                    const filtered = rawGuests
                        .map((g: any) => normalizeGuest(g))
                        .filter((g: any) => !existingIds.includes(g.id));
                    setSearchResults(filtered);
                }
            } catch (error) {
                console.error("Error searching guests:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, guests]);

    const handleAddGuest = (guest: any) => {
        const normalized = normalizeGuest(guest);
        onUpdateGuests([...guests, normalized]);
        toast.success(`${normalized.name || "Hóspede"} adicionado como acompanhante`);
        // We can keep the search open for multiple adds or close it. 
        // Let's clear search but keep add mode to allow adding more easily
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleRemoveGuest = (index: number) => {
        const newGuests = [...guests];
        newGuests.splice(index, 1);
        onUpdateGuests(newGuests);
        toast.info("Acompanhante removido.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-border/50 shadow-2xl">
                {/* Header Gradient */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Users className="h-6 w-6" />
                            Acompanhantes da Reserva
                        </DialogTitle>
                        <DialogDescription className="text-violet-100 mt-1">
                            Gerencie os hóspedes adicionais vinculados a esta reserva.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Add Section - Transforming UI */}
                    <div className={`transition-all duration-300 ease-in-out ${isAdding ? 'bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-border rounded-xl p-4' : ''}`}>
                        {!isAdding ? (
                            <div className="flex justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-border/60">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Lista de Hóspedes</p>
                                        <p className="text-sm text-muted-foreground">
                                            {guests.length === 0 ? "Nenhum acompanhante." : `${guests.length} acompanhante${guests.length !== 1 ? 's' : ''} registrado${guests.length !== 1 ? 's' : ''}.`}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    Adicionar Novo
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <Search className="h-4 w-4 text-violet-500" />
                                        Buscar Hóspede
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={handleCloseAdd} className="h-8 w-8 p-0 rounded-full hover:bg-muted text-muted-foreground">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Digite nome, CPF, email ou telefone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                        className="pl-9 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-violet-500"
                                    />
                                </div>

                                {/* Results Area */}
                                <div className="min-h-[100px] max-h-[260px] overflow-y-auto rounded-lg border border-border/50 bg-background/50">
                                    {isSearching && (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            <span className="text-xs">Buscando na base de dados...</span>
                                        </div>
                                    )}

                                    {!isSearching && searchResults.length === 0 && searchTerm.length >= 2 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                            <User className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-sm">Nenhum hóspede encontrado.</p>
                                        </div>
                                    )}

                                    {!isSearching && searchTerm.length < 2 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
                                            <Search className="h-8 w-8 mb-2 opacity-20" />
                                            <p className="text-sm">Digite para pesquisar...</p>
                                        </div>
                                    )}

                                    {searchResults.map((guest) => (
                                        <div
                                            key={guest.id}
                                            onClick={() => handleAddGuest(guest)}
                                            className="group flex items-center justify-between p-3 hover:bg-violet-50 dark:hover:bg-violet-900/10 cursor-pointer transition-colors border-b last:border-0 border-border/40"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center text-violet-600 dark:text-violet-300 font-semibold text-sm ring-2 ring-white dark:ring-zinc-800 shadow-sm">
                                                    {(guest.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                                                        {guest.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {guest.cpf && <span className="flex items-center gap-1"><IdCard className="h-3 w-3" /> {guest.cpf}</span>}
                                                        {guest.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {guest.email}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/30">
                                                <Plus className="h-4 w-4 mr-1" /> Selecionar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Lista de acompanhantes */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
                                Acompanhantes nesta reserva
                            </h3>
                            {guests.length > 0 && (
                                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">
                                    {guests.length} {guests.length === 1 ? "pessoa" : "pessoas"}
                                </span>
                            )}
                        </div>

                        <ScrollArea className="h-[320px] pr-3 -mr-1">
                            {guests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                    <div className="h-16 w-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-violet-500 dark:text-violet-400" />
                                    </div>
                                    <p className="text-base font-semibold text-foreground mb-1">Nenhum acompanhante</p>
                                    <p className="text-sm text-muted-foreground text-center max-w-[240px]">
                                        Clique em &quot;Adicionar Novo&quot; e busque hóspedes na base para incluir nesta reserva.
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-2 pb-2">
                                    {guests.map((guest, index) => (
                                        <li
                                            key={guest.id ?? index}
                                            className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/80 hover:border-violet-200 dark:hover:border-violet-800/80 hover:shadow-sm transition-all duration-200"
                                        >
                                            {/* Número + Avatar */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    {index + 1}
                                                </span>
                                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center text-violet-600 dark:text-violet-300 font-semibold text-sm shrink-0 overflow-hidden ring-2 ring-white dark:ring-zinc-800 shadow-sm">
                                                    {guest.avatar ? (
                                                        <img src={guest.avatar} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        (guest.name || "?").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                            </div>

                                            {/* Nome + contatos */}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-foreground text-[15px] truncate">
                                                    {guest.name || "Sem nome"}
                                                </p>
                                                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                                    {guest.email && (
                                                        <span className="flex items-center gap-1.5 truncate">
                                                            <Mail className="h-3 w-3 shrink-0 text-violet-500/70" />
                                                            <span className="truncate">{guest.email}</span>
                                                        </span>
                                                    )}
                                                    {guest.phone && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3 shrink-0 text-violet-500/70" />
                                                            {guest.phone}
                                                        </span>
                                                    )}
                                                    {(guest.cpf || guest.document) && (
                                                        <span className="flex items-center gap-1.5">
                                                            <IdCard className="h-3 w-3 shrink-0 text-violet-500/70" />
                                                            {guest.cpf || guest.document}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Remover */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveGuest(index)}
                                                className="h-9 w-9 shrink-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remover acompanhante"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
