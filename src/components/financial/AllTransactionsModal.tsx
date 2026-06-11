import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    Calendar,
    Building2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    FileText,
    X,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    id: number;
    type: string;
    description: string;
    category?: string;
    categoryName?: string;
    financialCategoryId?: number;
    amount: number;
    status: string;
    paymentDate?: string;
    date?: string;
    propertyName?: string;
    transactionNumber: string;
    notes?: string;
}

interface AllTransactionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: Transaction[];
}

export function AllTransactionsModal({
    open,
    onOpenChange,
    transactions,
}: AllTransactionsModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Calculate summary stats
    const stats = useMemo(() => {
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);
        return {
            total: transactions.length,
            income,
            expense,
            balance: income - expense,
        };
    }, [transactions]);

    // Get unique categories (nome da categoria para exibição e filtro)
    const categories = useMemo(() => {
        return Array.from(new Set(transactions.map((t) => t.categoryName || t.category).filter(Boolean)));
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesSearch =
                transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === "all" || transaction.type === typeFilter;
            const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
            const matchesCategory = categoryFilter === "all" || (transaction.categoryName || transaction.category) === categoryFilter;

            return matchesSearch && matchesType && matchesStatus && matchesCategory;
        });
    }, [transactions, searchTerm, typeFilter, statusFilter, categoryFilter]);

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { icon: any; className: string; label: string }> = {
            completed: {
                icon: CheckCircle2,
                className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                label: "Pago",
            },
            pending: {
                icon: Clock,
                className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                label: "Pendente",
            },
            cancelled: {
                icon: XCircle,
                className: "bg-red-500/20 text-red-400 border-red-500/30",
                label: "Cancelado",
            },
            refunded: {
                icon: AlertCircle,
                className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                label: "Reembolsado",
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={cn("gap-1.5", config.className)}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20">
                {/* Header */}
                <DialogHeader className="px-8 pt-8 pb-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Todas as Transações
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Histórico completo de movimentações financeiras
                            </DialogDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mt-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold text-blue-400">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Receitas</p>
                                    <p className="text-xl font-bold text-emerald-400">
                                        R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-500/20 rounded-lg">
                                    <TrendingDown className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Despesas</p>
                                    <p className="text-xl font-bold text-red-400">
                                        R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            "p-4 rounded-xl border",
                            stats.balance >= 0
                                ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20"
                                : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2.5 rounded-lg",
                                    stats.balance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"
                                )}>
                                    <DollarSign className={cn(
                                        "h-5 w-5",
                                        stats.balance >= 0 ? "text-emerald-400" : "text-red-400"
                                    )} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Saldo</p>
                                    <p className={cn(
                                        "text-xl font-bold",
                                        stats.balance >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        R$ {Math.abs(stats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 mt-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por descrição ou número..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-muted/30 border-border/50"
                            />
                        </div>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[160px] bg-muted/30 border-border/50">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                <SelectItem value="income">Receitas</SelectItem>
                                <SelectItem value="expense">Despesas</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] bg-muted/30 border-border/50">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos status</SelectItem>
                                <SelectItem value="completed">Pago</SelectItem>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                                <SelectItem value="refunded">Reembolsado</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px] bg-muted/30 border-border/50">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas categorias</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="shrink-0">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Transactions List */}
                <ScrollArea className="flex-1 px-8 py-6">
                    <div className="space-y-3">
                        {filteredTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="p-4 bg-muted/30 rounded-full mb-4">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
                                <p className="text-sm text-muted-foreground">
                                    Tente ajustar os filtros ou buscar por outros termos
                                </p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => {
                                const isIncome = transaction.type === "income";
                                return (
                                    <div
                                        key={transaction.id}
                                        className="group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Icon */}
                                                <div
                                                    className={cn(
                                                        "p-3 rounded-xl transition-transform group-hover:scale-110",
                                                        isIncome
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    )}
                                                >
                                                    {isIncome ? (
                                                        <ArrowUpRight className="h-5 w-5" />
                                                    ) : (
                                                        <ArrowDownRight className="h-5 w-5" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-semibold text-base truncate">
                                                            {transaction.description}
                                                        </h4>
                                                        <Badge variant="outline" className="shrink-0 bg-muted/30">
                                                            {transaction.categoryName || transaction.category || "-"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <span className="font-mono text-xs">
                                                            {transaction.transactionNumber}
                                                        </span>
                                                        {transaction.propertyName && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Building2 className="h-3.5 w-3.5" />
                                                                    <span>{transaction.propertyName}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>
                                                                {transaction.date ?? (transaction.paymentDate
                                                                    ? format(new Date(transaction.paymentDate), "dd/MM/yyyy")
                                                                    : "-")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Amount */}
                                            <div className="flex items-center gap-6">
                                                {getStatusBadge(transaction.status)}
                                                <div className="text-right min-w-[140px]">
                                                    <p
                                                        className={cn(
                                                            "text-2xl font-bold",
                                                            isIncome ? "text-emerald-400" : "text-red-400"
                                                        )}
                                                    >
                                                        {isIncome ? "+" : "-"} R${" "}
                                                        {Number(transaction.amount).toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes (if any) */}
                                        {transaction.notes && (
                                            <div className="mt-3 pt-3 border-t border-border/30">
                                                <p className="text-sm text-muted-foreground italic">
                                                    {transaction.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <p>
                            Mostrando <span className="font-semibold text-foreground">{filteredTransactions.length}</span> de{" "}
                            <span className="font-semibold text-foreground">{transactions.length}</span> transações
                        </p>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar Relatório
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
