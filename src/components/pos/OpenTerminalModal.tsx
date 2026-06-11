import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DollarSign,
  Clock,
  User,
  BedDouble,
  Receipt,
  TrendingUp,
  Package,
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Power,
  Settings,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenTerminalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  terminal: {
    id: string;
    name: string;
    type: "restaurant" | "bar" | "spa" | "shop" | "pool";
    status: "online" | "offline" | "busy";
    todaySales: number;
    transactions: number;
    lastTransaction: string;
  } | null;
}

const terminalTypeConfig = {
  restaurant: { icon: UtensilsCrossed, color: "from-orange-500 to-red-500", label: "Restaurante" },
  bar: { icon: Wine, color: "from-purple-500 to-pink-500", label: "Bar" },
  spa: { icon: Sparkles, color: "from-cyan-500 to-blue-500", label: "Spa" },
  shop: { icon: ShoppingCart, color: "from-emerald-500 to-green-500", label: "Loja" },
  pool: { icon: Wine, color: "from-blue-500 to-cyan-500", label: "Piscina" },
};

const recentSales = [
  { id: "1", time: "14:32", room: "205", guest: "Maria Santos", amount: 369.80, items: 4 },
  { id: "2", time: "14:15", room: "312", guest: "Carlos Oliveira", amount: 129.00, items: 2 },
  { id: "3", time: "13:58", room: "101", guest: "Ana Rodrigues", amount: 245.50, items: 3 },
  { id: "4", time: "13:42", room: "405", guest: "Pedro Lima", amount: 88.00, items: 1 },
  { id: "5", time: "13:20", room: "208", guest: "Lucia Ferreira", amount: 156.00, items: 2 },
];

const topProducts = [
  { name: "Filé Mignon", qty: 18, revenue: 1618.20 },
  { name: "Caipirinha", qty: 32, revenue: 896.00 },
  { name: "Vinho Tinto", qty: 12, revenue: 1440.00 },
  { name: "Sobremesa Chef", qty: 24, revenue: 840.00 },
  { name: "Água Mineral", qty: 45, revenue: 360.00 },
];

const hourlyStats = [
  { hour: "08:00", sales: 450 },
  { hour: "09:00", sales: 680 },
  { hour: "10:00", sales: 920 },
  { hour: "11:00", sales: 1250 },
  { hour: "12:00", sales: 2100 },
  { hour: "13:00", sales: 1850 },
  { hour: "14:00", sales: 1200 },
];

export function OpenTerminalModal({ open, onOpenChange, terminal }: OpenTerminalModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!terminal) return null;

  const config = terminalTypeConfig[terminal.type];
  const Icon = config.icon;

  const avgTicket = terminal.todaySales / terminal.transactions;
  const maxSales = Math.max(...hourlyStats.map(s => s.sales));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-0">
          <div className={cn("relative bg-gradient-to-r p-6", config.color)}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">{terminal.name}</DialogTitle>
                  <p className="text-white/80 text-sm">{config.label} • Terminal #{terminal.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "px-3 py-1",
                    terminal.status === "online" && "bg-emerald-500/20 text-white border-emerald-300/30",
                    terminal.status === "offline" && "bg-red-500/20 text-white border-red-300/30",
                    terminal.status === "busy" && "bg-amber-500/20 text-white border-amber-300/30"
                  )}
                >
                  {terminal.status === "online" ? "Online" : terminal.status === "offline" ? "Offline" : "Ocupado"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Vendas Hoje</span>
              </div>
              <p className="text-xl font-bold">R$ {terminal.todaySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+12% vs ontem</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-500 mb-1">
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-medium">Transações</span>
              </div>
              <p className="text-xl font-bold">{terminal.transactions}</p>
              <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+8 hoje</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Ticket Médio</span>
              </div>
              <p className="text-xl font-bold">R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 text-xs text-purple-500 mt-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+5% vs média</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Última Venda</span>
              </div>
              <p className="text-xl font-bold">{terminal.lastTransaction}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <span>Há 18 minutos</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="sales" className="gap-2">
                <Receipt className="w-4 h-4" />
                Vendas Recentes
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="w-4 h-4" />
                Top Produtos
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Análise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar vendas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sale.guest}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BedDouble className="w-3 h-3" />
                            <span>Quarto {sale.room}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{sale.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          R$ {sale.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">{sale.items} itens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <ScrollArea className="h-[320px]">
                <div className="space-y-2">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                          index === 0 && "bg-amber-500/20 text-amber-500",
                          index === 1 && "bg-slate-400/20 text-slate-400",
                          index === 2 && "bg-orange-600/20 text-orange-600",
                          index > 2 && "bg-muted text-muted-foreground"
                        )}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.qty} vendidos</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Vendas por Hora
                </h4>
                <div className="flex items-end gap-2 h-[200px]">
                  {hourlyStats.map((stat) => (
                    <div key={stat.hour} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-full rounded-t-md bg-gradient-to-t",
                          config.color
                        )}
                        style={{ height: `${(stat.sales / maxSales) * 160}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{stat.hour.split(':')[0]}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="w-4 h-4" />
                Configurar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-amber-500 hover:text-amber-600">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                <Power className="w-4 h-4" />
                Desligar
              </Button>
            </div>
            <Button className={cn("gap-2 bg-gradient-to-r", config.color)}>
              <Plus className="w-4 h-4" />
              Nova Venda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
