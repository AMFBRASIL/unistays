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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  ArrowLeft,
  Ruler,
  Scale,
  Box,
  Droplets,
  Thermometer,
  Timer,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnitsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  weight: { label: "Peso", icon: Scale, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  volume: { label: "Volume", icon: Droplets, color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" },
  length: { label: "Comprimento", icon: Ruler, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
  quantity: { label: "Quantidade", icon: Box, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
  temperature: { label: "Temperatura", icon: Thermometer, color: "text-rose-600", bgColor: "from-rose-500 to-pink-600" },
  time: { label: "Tempo", icon: Timer, color: "text-sky-600", bgColor: "from-sky-500 to-blue-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

const mockUnits = [
  {
    id: "1",
    name: "Quilograma",
    abbreviation: "kg",
    category: "weight",
    description: "Unidade padrão de peso no sistema métrico",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 45,
    status: "active",
  },
  {
    id: "2",
    name: "Grama",
    abbreviation: "g",
    category: "weight",
    description: "Submúltiplo do quilograma",
    conversionFactor: 0.001,
    baseUnit: false,
    productsCount: 28,
    status: "active",
  },
  {
    id: "3",
    name: "Litro",
    abbreviation: "L",
    category: "volume",
    description: "Unidade padrão de volume",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 67,
    status: "active",
  },
  {
    id: "4",
    name: "Mililitro",
    abbreviation: "mL",
    category: "volume",
    description: "Submúltiplo do litro",
    conversionFactor: 0.001,
    baseUnit: false,
    productsCount: 34,
    status: "active",
  },
  {
    id: "5",
    name: "Unidade",
    abbreviation: "un",
    category: "quantity",
    description: "Contagem individual de itens",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 156,
    status: "active",
  },
  {
    id: "6",
    name: "Caixa",
    abbreviation: "cx",
    category: "quantity",
    description: "Agrupamento em caixa",
    conversionFactor: 1,
    baseUnit: false,
    productsCount: 23,
    status: "active",
  },
  {
    id: "7",
    name: "Metro",
    abbreviation: "m",
    category: "length",
    description: "Unidade padrão de comprimento",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 12,
    status: "active",
  },
  {
    id: "8",
    name: "Centímetro",
    abbreviation: "cm",
    category: "length",
    description: "Submúltiplo do metro",
    conversionFactor: 0.01,
    baseUnit: false,
    productsCount: 8,
    status: "active",
  },
  {
    id: "9",
    name: "Hora",
    abbreviation: "h",
    category: "time",
    description: "Unidade de tempo",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 15,
    status: "active",
  },
  {
    id: "10",
    name: "Celsius",
    abbreviation: "°C",
    category: "temperature",
    description: "Unidade de temperatura",
    conversionFactor: 1,
    baseUnit: true,
    productsCount: 3,
    status: "inactive",
  },
];

export function UnitsListModal({ open, onOpenChange }: UnitsListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newUnitModalOpen, setNewUnitModalOpen] = useState(false);

  const filteredUnits = mockUnits.filter((unit) => {
    const matchesSearch = 
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || unit.category === filterCategory;
    const matchesStatus = filterStatus === "all" || unit.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: mockUnits.length,
    active: mockUnits.filter(u => u.status === "active").length,
    categories: new Set(mockUnits.map(u => u.category)).size,
    totalProducts: mockUnits.reduce((acc, u) => acc + u.productsCount, 0),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden bg-background border-border">
          <DialogHeader className="pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-10 w-10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <Ruler className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Unidades de Medida
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie unidades para produtos e estoque
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewUnitModalOpen(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{stats.categories}</p>
              <p className="text-xs text-muted-foreground">Categorias</p>
            </div>
            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/5">
              <p className="text-xl font-bold text-violet-600">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar unidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Units Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 pr-4">
                {filteredUnits.map((unit) => {
                  const categoryInfo = categoryConfig[unit.category];
                  const statusInfo = statusConfig[unit.status];
                  const CategoryIcon = categoryInfo?.icon || Ruler;

                  return (
                    <div
                      key={unit.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Header */}
                      <div className={`relative h-24 bg-gradient-to-r ${categoryInfo?.bgColor} p-4`}>
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                            <CategoryIcon className="h-5 w-5 text-white" />
                          </div>
                          <Badge className={`${statusInfo?.color} text-white border-0`}>
                            {statusInfo?.label}
                          </Badge>
                        </div>
                        
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                          <div>
                            <h3 className="font-bold text-white text-lg drop-shadow-lg">
                              {unit.name}
                            </h3>
                          </div>
                          <div className="text-4xl font-bold text-white/90 drop-shadow-lg">
                            {unit.abbreviation}
                          </div>
                        </div>

                        {/* Menu */}
                        <div className="absolute top-2 right-16">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30 border-0">
                                <MoreVertical className="h-4 w-4 text-white" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {unit.description}
                        </p>

                        {/* Tags */}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryInfo?.label}
                          </Badge>
                          {unit.baseUnit && (
                            <Badge variant="secondary" className="text-xs">
                              Base
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div>
                            <p className="text-lg font-bold text-foreground">{unit.productsCount}</p>
                            <p className="text-xs text-muted-foreground">Produtos</p>
                          </div>
                          {!unit.baseUnit && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                Fator: {unit.conversionFactor}
                              </p>
                              <p className="text-xs text-muted-foreground">Conversão</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUnits.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Ruler className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhuma unidade encontrada</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre uma nova unidade
                  </p>
                  <Button 
                    onClick={() => setNewUnitModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Unidade
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Create UnitModal component */}
      <Dialog open={newUnitModalOpen} onOpenChange={setNewUnitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Unidade de Medida</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Modal de cadastro de unidade em desenvolvimento.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
