import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FolderTree,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Coins,
  CreditCard,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  Landmark,
  Package,
  Users,
  Sparkles,
  Car,
  Zap,
  Wrench,
  ShoppingCart,
  FileText,
  DollarSign,
  Edit2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Estrutura do Plano de Contas Brasileiro Padrão
interface Account {
  code: string;
  name: string;
  type: "ativo" | "passivo" | "receita" | "despesa" | "custo";
  nature: "debit" | "credit";
  icon: string;
  children?: Account[];
  description?: string;
  active?: boolean;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, typeof DollarSign> = {
    landmark: Landmark,
    wallet: Wallet,
    creditCard: CreditCard,
    piggyBank: PiggyBank,
    building: Building2,
    coins: Coins,
    receipt: Receipt,
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    arrowUp: ArrowUpCircle,
    arrowDown: ArrowDownCircle,
    transfer: ArrowRightLeft,
    package: Package,
    users: Users,
    sparkles: Sparkles,
    car: Car,
    zap: Zap,
    wrench: Wrench,
    shopping: ShoppingCart,
    file: FileText,
    dollar: DollarSign,
  };
  return icons[iconName] || DollarSign;
};

const chartOfAccounts: Account[] = [
  {
    code: "1",
    name: "ATIVO",
    type: "ativo",
    nature: "debit",
    icon: "landmark",
    children: [
      {
        code: "1.1",
        name: "Ativo Circulante",
        type: "ativo",
        nature: "debit",
        icon: "wallet",
        children: [
          {
            code: "1.1.1",
            name: "Caixa e Equivalentes",
            type: "ativo",
            nature: "debit",
            icon: "coins",
            children: [
              { code: "1.1.1.01", name: "Caixa Geral", type: "ativo", nature: "debit", icon: "coins" },
              { code: "1.1.1.02", name: "Fundo Fixo", type: "ativo", nature: "debit", icon: "coins" },
              { code: "1.1.1.03", name: "Banco Conta Movimento", type: "ativo", nature: "debit", icon: "landmark" },
              { code: "1.1.1.04", name: "Aplicações Financeiras", type: "ativo", nature: "debit", icon: "trendingUp" },
            ],
          },
          {
            code: "1.1.2",
            name: "Contas a Receber",
            type: "ativo",
            nature: "debit",
            icon: "arrowUp",
            children: [
              { code: "1.1.2.01", name: "Clientes - Hospedagem", type: "ativo", nature: "debit", icon: "building" },
              { code: "1.1.2.02", name: "Clientes - Eventos", type: "ativo", nature: "debit", icon: "sparkles" },
              { code: "1.1.2.03", name: "Clientes - A&B", type: "ativo", nature: "debit", icon: "receipt" },
              { code: "1.1.2.04", name: "Cartões a Receber", type: "ativo", nature: "debit", icon: "creditCard" },
              { code: "1.1.2.05", name: "OTAs a Receber", type: "ativo", nature: "debit", icon: "transfer" },
              { code: "1.1.2.06", name: "(-) Provisão Devedores Duvidosos", type: "ativo", nature: "credit", icon: "arrowDown" },
            ],
          },
          {
            code: "1.1.3",
            name: "Estoques",
            type: "ativo",
            nature: "debit",
            icon: "package",
            children: [
              { code: "1.1.3.01", name: "Estoque A&B", type: "ativo", nature: "debit", icon: "package" },
              { code: "1.1.3.02", name: "Estoque Frigobar", type: "ativo", nature: "debit", icon: "package" },
              { code: "1.1.3.03", name: "Material de Limpeza", type: "ativo", nature: "debit", icon: "sparkles" },
              { code: "1.1.3.04", name: "Amenities", type: "ativo", nature: "debit", icon: "sparkles" },
            ],
          },
        ],
      },
      {
        code: "1.2",
        name: "Ativo Não Circulante",
        type: "ativo",
        nature: "debit",
        icon: "building",
        children: [
          {
            code: "1.2.1",
            name: "Imobilizado",
            type: "ativo",
            nature: "debit",
            icon: "building",
            children: [
              { code: "1.2.1.01", name: "Terrenos", type: "ativo", nature: "debit", icon: "building" },
              { code: "1.2.1.02", name: "Edifícios e Construções", type: "ativo", nature: "debit", icon: "building" },
              { code: "1.2.1.03", name: "Móveis e Utensílios", type: "ativo", nature: "debit", icon: "package" },
              { code: "1.2.1.04", name: "Veículos", type: "ativo", nature: "debit", icon: "car" },
              { code: "1.2.1.05", name: "Equipamentos", type: "ativo", nature: "debit", icon: "wrench" },
              { code: "1.2.1.06", name: "(-) Depreciação Acumulada", type: "ativo", nature: "credit", icon: "arrowDown" },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "2",
    name: "PASSIVO",
    type: "passivo",
    nature: "credit",
    icon: "creditCard",
    children: [
      {
        code: "2.1",
        name: "Passivo Circulante",
        type: "passivo",
        nature: "credit",
        icon: "arrowDown",
        children: [
          {
            code: "2.1.1",
            name: "Fornecedores",
            type: "passivo",
            nature: "credit",
            icon: "shopping",
            children: [
              { code: "2.1.1.01", name: "Fornecedores Nacionais", type: "passivo", nature: "credit", icon: "shopping" },
              { code: "2.1.1.02", name: "Fornecedores de Serviços", type: "passivo", nature: "credit", icon: "users" },
            ],
          },
          {
            code: "2.1.2",
            name: "Obrigações Trabalhistas",
            type: "passivo",
            nature: "credit",
            icon: "users",
            children: [
              { code: "2.1.2.01", name: "Salários a Pagar", type: "passivo", nature: "credit", icon: "users" },
              { code: "2.1.2.02", name: "FGTS a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.2.03", name: "INSS a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.2.04", name: "Provisão de Férias", type: "passivo", nature: "credit", icon: "users" },
              { code: "2.1.2.05", name: "Provisão 13º Salário", type: "passivo", nature: "credit", icon: "users" },
            ],
          },
          {
            code: "2.1.3",
            name: "Obrigações Fiscais",
            type: "passivo",
            nature: "credit",
            icon: "file",
            children: [
              { code: "2.1.3.01", name: "ISS a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.3.02", name: "PIS a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.3.03", name: "COFINS a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.3.04", name: "IRPJ a Recolher", type: "passivo", nature: "credit", icon: "file" },
              { code: "2.1.3.05", name: "CSLL a Recolher", type: "passivo", nature: "credit", icon: "file" },
            ],
          },
          {
            code: "2.1.4",
            name: "Adiantamentos de Clientes",
            type: "passivo",
            nature: "credit",
            icon: "wallet",
            children: [
              { code: "2.1.4.01", name: "Adiantamento Reservas", type: "passivo", nature: "credit", icon: "building" },
              { code: "2.1.4.02", name: "Adiantamento Eventos", type: "passivo", nature: "credit", icon: "sparkles" },
            ],
          },
        ],
      },
      {
        code: "2.2",
        name: "Passivo Não Circulante",
        type: "passivo",
        nature: "credit",
        icon: "landmark",
        children: [
          { code: "2.2.1", name: "Empréstimos e Financiamentos LP", type: "passivo", nature: "credit", icon: "landmark" },
        ],
      },
      {
        code: "2.3",
        name: "Patrimônio Líquido",
        type: "passivo",
        nature: "credit",
        icon: "piggyBank",
        children: [
          { code: "2.3.1", name: "Capital Social", type: "passivo", nature: "credit", icon: "piggyBank" },
          { code: "2.3.2", name: "Reservas de Capital", type: "passivo", nature: "credit", icon: "piggyBank" },
          { code: "2.3.3", name: "Lucros Acumulados", type: "passivo", nature: "credit", icon: "trendingUp" },
          { code: "2.3.4", name: "(-) Prejuízos Acumulados", type: "passivo", nature: "debit", icon: "trendingDown" },
        ],
      },
    ],
  },
  {
    code: "3",
    name: "RECEITAS",
    type: "receita",
    nature: "credit",
    icon: "trendingUp",
    children: [
      {
        code: "3.1",
        name: "Receita Operacional",
        type: "receita",
        nature: "credit",
        icon: "arrowUp",
        children: [
          {
            code: "3.1.1",
            name: "Receita de Hospedagem",
            type: "receita",
            nature: "credit",
            icon: "building",
            children: [
              { code: "3.1.1.01", name: "Diárias - Reserva Direta", type: "receita", nature: "credit", icon: "building" },
              { code: "3.1.1.02", name: "Diárias - Booking.com", type: "receita", nature: "credit", icon: "transfer" },
              { code: "3.1.1.03", name: "Diárias - Airbnb", type: "receita", nature: "credit", icon: "transfer" },
              { code: "3.1.1.04", name: "Diárias - Expedia", type: "receita", nature: "credit", icon: "transfer" },
              { code: "3.1.1.05", name: "Diárias - Corporativo", type: "receita", nature: "credit", icon: "users" },
              { code: "3.1.1.06", name: "Day Use", type: "receita", nature: "credit", icon: "building" },
            ],
          },
          {
            code: "3.1.2",
            name: "Receita de Alimentos e Bebidas",
            type: "receita",
            nature: "credit",
            icon: "receipt",
            children: [
              { code: "3.1.2.01", name: "Restaurante", type: "receita", nature: "credit", icon: "receipt" },
              { code: "3.1.2.02", name: "Bar", type: "receita", nature: "credit", icon: "receipt" },
              { code: "3.1.2.03", name: "Room Service", type: "receita", nature: "credit", icon: "receipt" },
              { code: "3.1.2.04", name: "Frigobar", type: "receita", nature: "credit", icon: "package" },
              { code: "3.1.2.05", name: "Café da Manhã Avulso", type: "receita", nature: "credit", icon: "receipt" },
            ],
          },
          {
            code: "3.1.3",
            name: "Receita de Eventos",
            type: "receita",
            nature: "credit",
            icon: "sparkles",
            children: [
              { code: "3.1.3.01", name: "Locação de Salas", type: "receita", nature: "credit", icon: "building" },
              { code: "3.1.3.02", name: "Equipamentos Audiovisuais", type: "receita", nature: "credit", icon: "sparkles" },
              { code: "3.1.3.03", name: "Coffee Break", type: "receita", nature: "credit", icon: "receipt" },
            ],
          },
          {
            code: "3.1.4",
            name: "Receita de Serviços",
            type: "receita",
            nature: "credit",
            icon: "sparkles",
            children: [
              { code: "3.1.4.01", name: "Lavanderia", type: "receita", nature: "credit", icon: "sparkles" },
              { code: "3.1.4.02", name: "Estacionamento", type: "receita", nature: "credit", icon: "car" },
              { code: "3.1.4.03", name: "Transfer", type: "receita", nature: "credit", icon: "car" },
              { code: "3.1.4.04", name: "Spa e Bem-estar", type: "receita", nature: "credit", icon: "sparkles" },
              { code: "3.1.4.05", name: "Late Checkout", type: "receita", nature: "credit", icon: "building" },
              { code: "3.1.4.06", name: "Early Check-in", type: "receita", nature: "credit", icon: "building" },
              { code: "3.1.4.07", name: "Outros Serviços", type: "receita", nature: "credit", icon: "sparkles" },
            ],
          },
        ],
      },
      {
        code: "3.2",
        name: "Outras Receitas",
        type: "receita",
        nature: "credit",
        icon: "dollar",
        children: [
          { code: "3.2.1", name: "Receitas Financeiras", type: "receita", nature: "credit", icon: "trendingUp" },
          { code: "3.2.2", name: "Descontos Obtidos", type: "receita", nature: "credit", icon: "arrowDown" },
          { code: "3.2.3", name: "Recuperação de Despesas", type: "receita", nature: "credit", icon: "transfer" },
        ],
      },
    ],
  },
  {
    code: "4",
    name: "DESPESAS",
    type: "despesa",
    nature: "debit",
    icon: "trendingDown",
    children: [
      {
        code: "4.1",
        name: "Despesas Operacionais",
        type: "despesa",
        nature: "debit",
        icon: "arrowDown",
        children: [
          {
            code: "4.1.1",
            name: "Despesas com Pessoal",
            type: "despesa",
            nature: "debit",
            icon: "users",
            children: [
              { code: "4.1.1.01", name: "Salários e Ordenados", type: "despesa", nature: "debit", icon: "users" },
              { code: "4.1.1.02", name: "Encargos Sociais", type: "despesa", nature: "debit", icon: "file" },
              { code: "4.1.1.03", name: "Benefícios", type: "despesa", nature: "debit", icon: "users" },
              { code: "4.1.1.04", name: "Treinamentos", type: "despesa", nature: "debit", icon: "users" },
              { code: "4.1.1.05", name: "Uniformes", type: "despesa", nature: "debit", icon: "users" },
            ],
          },
          {
            code: "4.1.2",
            name: "Despesas Administrativas",
            type: "despesa",
            nature: "debit",
            icon: "file",
            children: [
              { code: "4.1.2.01", name: "Material de Escritório", type: "despesa", nature: "debit", icon: "file" },
              { code: "4.1.2.02", name: "Serviços Contábeis", type: "despesa", nature: "debit", icon: "file" },
              { code: "4.1.2.03", name: "Seguros", type: "despesa", nature: "debit", icon: "file" },
              { code: "4.1.2.04", name: "Taxas e Licenças", type: "despesa", nature: "debit", icon: "file" },
            ],
          },
          {
            code: "4.1.3",
            name: "Despesas com Utilidades",
            type: "despesa",
            nature: "debit",
            icon: "zap",
            children: [
              { code: "4.1.3.01", name: "Energia Elétrica", type: "despesa", nature: "debit", icon: "zap" },
              { code: "4.1.3.02", name: "Água e Esgoto", type: "despesa", nature: "debit", icon: "zap" },
              { code: "4.1.3.03", name: "Gás", type: "despesa", nature: "debit", icon: "zap" },
              { code: "4.1.3.04", name: "Telefone e Internet", type: "despesa", nature: "debit", icon: "zap" },
            ],
          },
          {
            code: "4.1.4",
            name: "Despesas de Manutenção",
            type: "despesa",
            nature: "debit",
            icon: "wrench",
            children: [
              { code: "4.1.4.01", name: "Manutenção Predial", type: "despesa", nature: "debit", icon: "wrench" },
              { code: "4.1.4.02", name: "Manutenção Equipamentos", type: "despesa", nature: "debit", icon: "wrench" },
              { code: "4.1.4.03", name: "Manutenção Veículos", type: "despesa", nature: "debit", icon: "car" },
              { code: "4.1.4.04", name: "Jardinagem e Paisagismo", type: "despesa", nature: "debit", icon: "sparkles" },
            ],
          },
          {
            code: "4.1.5",
            name: "Despesas Comerciais",
            type: "despesa",
            nature: "debit",
            icon: "trendingUp",
            children: [
              { code: "4.1.5.01", name: "Comissão OTAs", type: "despesa", nature: "debit", icon: "transfer" },
              { code: "4.1.5.02", name: "Marketing e Publicidade", type: "despesa", nature: "debit", icon: "sparkles" },
              { code: "4.1.5.03", name: "Taxas de Cartão", type: "despesa", nature: "debit", icon: "creditCard" },
              { code: "4.1.5.04", name: "Comissão Agências", type: "despesa", nature: "debit", icon: "users" },
            ],
          },
          {
            code: "4.1.6",
            name: "Despesas Operacionais Diretas",
            type: "despesa",
            nature: "debit",
            icon: "sparkles",
            children: [
              { code: "4.1.6.01", name: "Lavanderia Externa", type: "despesa", nature: "debit", icon: "sparkles" },
              { code: "4.1.6.02", name: "Amenities", type: "despesa", nature: "debit", icon: "sparkles" },
              { code: "4.1.6.03", name: "Material de Limpeza", type: "despesa", nature: "debit", icon: "sparkles" },
              { code: "4.1.6.04", name: "Enxoval e Rouparia", type: "despesa", nature: "debit", icon: "sparkles" },
            ],
          },
        ],
      },
      {
        code: "4.2",
        name: "Outras Despesas",
        type: "despesa",
        nature: "debit",
        icon: "dollar",
        children: [
          { code: "4.2.1", name: "Despesas Financeiras", type: "despesa", nature: "debit", icon: "trendingDown" },
          { code: "4.2.2", name: "Juros e Multas", type: "despesa", nature: "debit", icon: "arrowDown" },
          { code: "4.2.3", name: "Depreciação", type: "despesa", nature: "debit", icon: "arrowDown" },
        ],
      },
    ],
  },
  {
    code: "5",
    name: "CUSTOS",
    type: "custo",
    nature: "debit",
    icon: "shopping",
    children: [
      {
        code: "5.1",
        name: "Custo dos Produtos Vendidos",
        type: "custo",
        nature: "debit",
        icon: "package",
        children: [
          { code: "5.1.1", name: "CMV Restaurante", type: "custo", nature: "debit", icon: "receipt" },
          { code: "5.1.2", name: "CMV Bar", type: "custo", nature: "debit", icon: "receipt" },
          { code: "5.1.3", name: "CMV Frigobar", type: "custo", nature: "debit", icon: "package" },
          { code: "5.1.4", name: "CMV Coffee Break", type: "custo", nature: "debit", icon: "receipt" },
        ],
      },
      {
        code: "5.2",
        name: "Custo dos Serviços Prestados",
        type: "custo",
        nature: "debit",
        icon: "sparkles",
        children: [
          { code: "5.2.1", name: "Custo Lavanderia", type: "custo", nature: "debit", icon: "sparkles" },
          { code: "5.2.2", name: "Custo Transfer", type: "custo", nature: "debit", icon: "car" },
          { code: "5.2.3", name: "Custo Eventos", type: "custo", nature: "debit", icon: "sparkles" },
        ],
      },
    ],
  },
];

const typeConfig = {
  ativo: { label: "Ativo", color: "bg-blue-500", textColor: "text-blue-500", bgLight: "bg-blue-500/10" },
  passivo: { label: "Passivo", color: "bg-violet-500", textColor: "text-violet-500", bgLight: "bg-violet-500/10" },
  receita: { label: "Receita", color: "bg-emerald-500", textColor: "text-emerald-500", bgLight: "bg-emerald-500/10" },
  despesa: { label: "Despesa", color: "bg-red-500", textColor: "text-red-500", bgLight: "bg-red-500/10" },
  custo: { label: "Custo", color: "bg-amber-500", textColor: "text-amber-500", bgLight: "bg-amber-500/10" },
};

interface AccountRowProps {
  account: Account;
  level: number;
  searchTerm: string;
}

function AccountRow({ account, level, searchTerm }: AccountRowProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const Icon = getIcon(account.icon);
  const config = typeConfig[account.type];

  const matchesSearch = searchTerm === "" || 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase());

  const hasMatchingChildren = (acc: Account): boolean => {
    if (!acc.children) return false;
    return acc.children.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hasMatchingChildren(child)
    );
  };

  const shouldShow = searchTerm === "" || matchesSearch || hasMatchingChildren(account);

  if (!shouldShow) return null;

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={cn(
            "flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors group",
            "hover:bg-accent/50",
            level === 0 && "bg-muted/50 font-semibold"
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6" />
            )}
            
            <div className={cn("p-1.5 rounded-lg", config.bgLight)}>
              <Icon className={cn("h-4 w-4", config.textColor)} />
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">
                {account.code}
              </Badge>
              <span className={cn(
                "text-sm",
                level === 0 ? "font-semibold" : "font-medium"
              )}>
                {account.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge className={cn(config.bgLight, config.textColor, "border-0 text-xs")}>
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {account.nature === "debit" ? "D" : "C"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Subconta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {hasChildren && (
          <CollapsibleContent>
            {account.children!.map((child) => (
              <AccountRow 
                key={child.code} 
                account={child} 
                level={level + 1}
                searchTerm={searchTerm}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

function countAccounts(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    return total + 1 + (account.children ? countAccounts(account.children) : 0);
  }, 0);
}

export function ChartOfAccountsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<Account["type"] | "all">("all");

  const filteredAccounts = filterType === "all" 
    ? chartOfAccounts 
    : chartOfAccounts.filter(acc => acc.type === filterType);

  const totalAccounts = countAccounts(chartOfAccounts);
  const activeAccounts = countAccounts(chartOfAccounts.filter(a => a.type === "receita" || a.type === "despesa"));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <FolderTree className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Plano de Contas</h2>
                <p className="text-muted-foreground">Estrutura contábil brasileira padrão</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-500">{totalAccounts}</p>
                <p className="text-xs text-muted-foreground">Total de Contas</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{chartOfAccounts.filter(a => a.type === "receita").length}</p>
                <p className="text-xs text-muted-foreground">Grupos Receita</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{chartOfAccounts.filter(a => a.type === "despesa").length}</p>
                <p className="text-xs text-muted-foreground">Grupos Despesa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            Todos
          </Button>
          {(Object.keys(typeConfig) as Account["type"][]).map((type) => {
            const config = typeConfig[type];
            return (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className={cn(
                  filterType === type && config.color,
                  filterType === type && "text-white hover:opacity-90"
                )}
              >
                {config.label}
              </Button>
            );
          })}
        </div>
        <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Accounts Tree */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-indigo-500" />
              Estrutura de Contas
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">D</Badge>
                <span className="text-muted-foreground">Débito</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">C</Badge>
                <span className="text-muted-foreground">Crédito</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-[600px]">
          <CardContent className="p-4">
            <div className="space-y-1">
              {filteredAccounts.map((account) => (
                <AccountRow 
                  key={account.code} 
                  account={account} 
                  level={0}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}