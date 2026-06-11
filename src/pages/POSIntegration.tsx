import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  UtensilsCrossed, 
  Wine, 
  Sparkles, 
  ShoppingCart,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  User,
  BedDouble,
  Receipt,
  ArrowRight,
  TrendingUp,
  Package,
  CreditCard,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewSaleModal } from "@/components/pos/NewSaleModal";
import { OpenTerminalModal } from "@/components/pos/OpenTerminalModal";

interface POSTerminal {
  id: string;
  name: string;
  type: "restaurant" | "bar" | "spa" | "shop" | "pool";
  status: "online" | "offline" | "busy";
  todaySales: number;
  transactions: number;
  lastTransaction: string;
}

interface POSTransaction {
  id: string;
  terminal: string;
  room: string;
  guest: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "charged" | "paid";
  time: string;
}

const terminals: POSTerminal[] = [
  { id: "1", name: "Restaurante Principal", type: "restaurant", status: "online", todaySales: 8450.00, transactions: 45, lastTransaction: "14:32" },
  { id: "2", name: "Bar da Piscina", type: "bar", status: "online", todaySales: 3280.00, transactions: 28, lastTransaction: "14:45" },
  { id: "3", name: "Spa & Wellness", type: "spa", status: "online", todaySales: 5600.00, transactions: 12, lastTransaction: "13:20" },
  { id: "4", name: "Loja de Conveniência", type: "shop", status: "busy", todaySales: 1890.00, transactions: 34, lastTransaction: "14:50" },
  { id: "5", name: "Bar Rooftop", type: "bar", status: "offline", todaySales: 2100.00, transactions: 18, lastTransaction: "23:45" },
];

const recentTransactions: POSTransaction[] = [
  { 
    id: "TXN001", 
    terminal: "Restaurante Principal", 
    room: "205", 
    guest: "Maria Santos", 
    items: [
      { name: "Filé Mignon", qty: 2, price: 89.90 },
      { name: "Vinho Tinto", qty: 1, price: 120.00 },
      { name: "Sobremesa", qty: 2, price: 35.00 }
    ],
    total: 369.80,
    status: "pending",
    time: "14:32"
  },
  { 
    id: "TXN002", 
    terminal: "Bar da Piscina", 
    room: "312", 
    guest: "Carlos Oliveira", 
    items: [
      { name: "Caipirinha", qty: 3, price: 28.00 },
      { name: "Petiscos", qty: 1, price: 45.00 }
    ],
    total: 129.00,
    status: "charged",
    time: "14:45"
  },
  { 
    id: "TXN003", 
    terminal: "Spa & Wellness", 
    room: "501", 
    guest: "Ana Rodrigues", 
    items: [
      { name: "Massagem Relaxante", qty: 1, price: 280.00 },
      { name: "Aromaterapia", qty: 1, price: 80.00 }
    ],
    total: 360.00,
    status: "paid",
    time: "13:20"
  },
];

const terminalTypeConfig = {
  restaurant: { icon: UtensilsCrossed, color: "from-orange-500 to-red-500", label: "Restaurante" },
  bar: { icon: Wine, color: "from-purple-500 to-pink-500", label: "Bar" },
  spa: { icon: Sparkles, color: "from-cyan-500 to-blue-500", label: "Spa" },
  shop: { icon: ShoppingCart, color: "from-emerald-500 to-green-500", label: "Loja" },
  pool: { icon: Wine, color: "from-blue-500 to-cyan-500", label: "Piscina" },
};

export default function POSIntegration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerminal, setSelectedTerminal] = useState<POSTerminal | null>(null);
  const [newSaleModalOpen, setNewSaleModalOpen] = useState(false);
  const [terminalModalOpen, setTerminalModalOpen] = useState(false);

  const totalSales = terminals.reduce((acc, t) => acc + t.todaySales, 0);
  const totalTransactions = terminals.reduce((acc, t) => acc + t.transactions, 0);
  const onlineTerminals = terminals.filter(t => t.status === "online").length;

  const handleOpenTerminal = (terminal: POSTerminal) => {
    setSelectedTerminal(terminal);
    setTerminalModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Integração PDV</h1>
              <p className="text-muted-foreground">Pontos de venda: Restaurante, Bar, Spa e Lojas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={() => setNewSaleModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendas Hoje</p>
                  <p className="text-2xl font-bold text-emerald-500">R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold text-blue-500">{totalTransactions}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-500">R$ {(totalSales / totalTransactions).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terminais Online</p>
                  <p className="text-2xl font-bold text-amber-500">{onlineTerminals}/{terminals.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="terminals" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="terminals" className="gap-2">
              <Store className="w-4 h-4" />
              Terminais
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="w-4 h-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terminals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {terminals.map((terminal) => {
                const config = terminalTypeConfig[terminal.type];
                return (
                  <Card 
                    key={terminal.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedTerminal?.id === terminal.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedTerminal(terminal)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", config.color)}>
                          <config.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            terminal.status === "online" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            terminal.status === "offline" && "bg-red-500/10 text-red-500 border-red-500/20",
                            terminal.status === "busy" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}
                        >
                          {terminal.status === "online" ? "Online" : terminal.status === "offline" ? "Offline" : "Ocupado"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{terminal.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{config.label}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Vendas Hoje</span>
                          <span className="font-semibold text-emerald-500">R$ {terminal.todaySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Transações</span>
                          <span className="font-medium">{terminal.transactions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Última Venda</span>
                          <span className="font-medium">{terminal.lastTransaction}</span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full mt-4 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTerminal(terminal);
                        }}
                      >
                        Abrir Terminal
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.id}</p>
                              <p className="text-sm text-muted-foreground">{transaction.terminal}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              transaction.status === "pending" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                              transaction.status === "charged" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                              transaction.status === "paid" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}
                          >
                            {transaction.status === "pending" ? "Pendente" : transaction.status === "charged" ? "Lançado" : "Pago"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="w-4 h-4 text-muted-foreground" />
                            <span>Quarto {transaction.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{transaction.guest}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{transaction.time}</span>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          {transaction.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1">
                              <span>{item.qty}x {item.name}</span>
                              <span>R$ {(item.qty * item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">Total: R$ {transaction.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <div className="flex items-center gap-2">
                            {transaction.status === "pending" && (
                              <Button size="sm" className="gap-1">
                                <CreditCard className="w-4 h-4" />
                                Lançar na Conta
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Catálogo de Produtos</h3>
              <p className="text-muted-foreground mb-4">Gerencie os produtos disponíveis em cada ponto de venda</p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NewSaleModal open={newSaleModalOpen} onOpenChange={setNewSaleModalOpen} />
      <OpenTerminalModal 
        open={terminalModalOpen} 
        onOpenChange={setTerminalModalOpen} 
        terminal={selectedTerminal}
      />
    </DashboardLayout>
  );
}
