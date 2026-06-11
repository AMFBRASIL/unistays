import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FolderTree,
  Search,
  ChevronDown,
  Check,
  Building2,
  TrendingUp,
  TrendingDown,
  Landmark,
  CreditCard,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChartAccountFromApi {
  id: number;
  code: string;
  name: string;
  accountType: string;
  category: string | null;
  parentAccountId: number | null;
  parentAccount?: { id: number; name: string; code: string } | null;
  allowTransactions: boolean;
  isActive: boolean;
}

const getIcon = (accountType: string, category?: string | null) => {
  const type = (accountType || "").toLowerCase();
  if (type === "revenue") return TrendingUp;
  if (type === "expense") return TrendingDown;
  if (type === "asset") return Landmark;
  if (type === "liability") return CreditCard;
  if (type === "equity") return Building2;
  return DollarSign;
};

const typeConfig: Record<string, { label: string; color: string; textColor: string; bgLight: string }> = {
  asset: { label: "Ativo", color: "bg-blue-500", textColor: "text-blue-500", bgLight: "bg-blue-500/10" },
  liability: { label: "Passivo", color: "bg-violet-500", textColor: "text-violet-500", bgLight: "bg-violet-500/10" },
  revenue: { label: "Receita", color: "bg-emerald-500", textColor: "text-emerald-500", bgLight: "bg-emerald-500/10" },
  expense: { label: "Despesa", color: "bg-red-500", textColor: "text-red-500", bgLight: "bg-red-500/10" },
  equity: { label: "Patrimônio", color: "bg-amber-500", textColor: "text-amber-500", bgLight: "bg-amber-500/10" },
};

interface AccountSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  transactionType: "income" | "expense";
  className?: string;
}

export function AccountSelectField({ value, onChange, transactionType, className }: AccountSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const valueStr = value != null && value !== "" ? String(value) : "";

  const { data, isLoading } = useQuery({
    queryKey: ["chart-of-accounts", "all"],
    queryFn: () => api.getChartOfAccounts(undefined, undefined, true),
    enabled: open || !!valueStr,
    staleTime: 60000,
  });

  const leafAccounts = useMemo(
    () => (data?.data?.accounts || []) as ChartAccountFromApi[],
    [data?.data?.accounts]
  );

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return leafAccounts;
    const term = searchTerm.toLowerCase();
    return leafAccounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(term) ||
        acc.code.toLowerCase().includes(term) ||
        (acc.parentAccount?.name || "").toLowerCase().includes(term)
    );
  }, [leafAccounts, searchTerm]);

  const selectedAccount = leafAccounts.find(
    (acc) => String(acc.id) === valueStr || acc.code === valueStr
  );
  const config = selectedAccount ? typeConfig[selectedAccount.accountType] || typeConfig.revenue : null;

  const selectedPath = selectedAccount
    ? [config?.label, selectedAccount.parentAccount?.name, selectedAccount.name]
        .filter(Boolean)
        .join(" > ")
    : "";

  const groupedAccounts = useMemo(() => {
    const groups: Record<string, ChartAccountFromApi[]> = {};
    filteredAccounts.forEach((acc) => {
      const category = acc.parentAccount?.name || acc.category || "Outras";
      if (!groups[category]) groups[category] = [];
      groups[category].push(acc);
    });
    return groups;
  }, [filteredAccounts]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-[56px] py-3 px-4 rounded-xl",
            "border border-input",
            selectedAccount
              ? "bg-background hover:bg-accent/50"
              : "bg-muted/30 hover:bg-muted/50 text-muted-foreground",
            className
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando plano de contas...</span>
            </div>
          ) : selectedAccount ? (
            <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <div className="p-2 rounded-lg bg-emerald-500/20 shrink-0">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs font-semibold bg-muted/80 text-foreground shrink-0 rounded-md"
                  >
                    {selectedAccount.code}
                  </Badge>
                  <span className="font-semibold text-foreground">{selectedAccount.name}</span>
                </div>
                {selectedPath && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {selectedPath}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 shrink-0" />
              <span>Selecionar conta contábil...</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 overflow-hidden flex flex-col" align="start">
        <div className="p-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conta por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div
          className="h-[350px] overflow-y-auto overflow-x-hidden overscroll-contain min-h-0"
          onWheel={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : Object.entries(groupedAccounts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderTree className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conta encontrada</p>
                <p className="text-xs mt-1">
                  Configure o Plano de Contas em Cadastros → Plano de Conta
                </p>
              </div>
            ) : (
              Object.entries(groupedAccounts).map(([category, accts]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {accts.map((account) => {
                      const Icon = getIcon(account.accountType);
                      const accConfig = typeConfig[account.accountType] || typeConfig.revenue;
                      const isSelected = valueStr === String(account.id) || valueStr === account.code;

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => {
                            onChange(String(account.id));
                            setOpen(false);
                            setSearchTerm("");
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg", accConfig.bgLight)}>
                            <Icon className={cn("h-4 w-4", accConfig.textColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs shrink-0">
                                {account.code}
                              </Badge>
                              <span className="font-medium truncate">{account.name}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
