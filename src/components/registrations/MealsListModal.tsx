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
  Utensils,
  Coffee,
  Sun,
  Moon,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MealsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  breakfast: { label: "Café da Manhã", icon: Coffee, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  lunch: { label: "Almoço", icon: Sun, color: "text-yellow-600", bgColor: "from-yellow-500 to-amber-600" },
  dinner: { label: "Jantar", icon: Moon, color: "text-violet-600", bgColor: "from-violet-500 to-purple-600" },
  snack: { label: "Lanche", icon: Clock, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

const mockMeals = [
  {
    id: "1",
    name: "Café da Manhã Buffet",
    type: "breakfast",
    description: "Buffet completo com frutas, pães, frios, quentes e bebidas",
    price: 65,
    schedule: "06:30 - 10:30",
    location: "Restaurante Principal",
    capacity: 120,
    status: "active",
    inclusions: ["Frutas", "Pães", "Frios", "Ovos", "Café", "Sucos"],
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  },
  {
    id: "2",
    name: "Meia Pensão",
    type: "dinner",
    description: "Jantar a la carte ou buffet no restaurante",
    price: 95,
    schedule: "19:00 - 22:00",
    location: "Restaurante Gourmet",
    capacity: 80,
    status: "active",
    inclusions: ["Entrada", "Prato Principal", "Sobremesa", "Bebida"],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  },
  {
    id: "3",
    name: "Pensão Completa",
    type: "lunch",
    description: "Almoço e jantar inclusos na diária",
    price: 180,
    schedule: "12:00 - 15:00 / 19:00 - 22:00",
    location: "Restaurante Principal",
    capacity: 100,
    status: "active",
    inclusions: ["Buffet Almoço", "Jantar", "Sobremesa", "Bebidas"],
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  },
  {
    id: "4",
    name: "Lanche da Tarde",
    type: "snack",
    description: "Serviço de chá da tarde com salgados e doces",
    price: 45,
    schedule: "15:00 - 17:00",
    location: "Lounge Bar",
    capacity: 40,
    status: "active",
    inclusions: ["Chá", "Café", "Salgados", "Doces", "Tortas"],
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
  },
];

export function MealsListModal({ open, onOpenChange }: MealsListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMealModalOpen, setNewMealModalOpen] = useState(false);

  const filteredMeals = mockMeals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || meal.type === filterType;
    const matchesStatus = filterStatus === "all" || meal.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockMeals.length,
    active: mockMeals.filter(m => m.status === "active").length,
    totalCapacity: mockMeals.reduce((acc, m) => acc + m.capacity, 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                  <Utensils className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Refeições
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie opções de alimentação
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewMealModalOpen(true)}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Refeição
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <p className="text-xl font-bold text-blue-600">{stats.totalCapacity}</p>
              </div>
              <p className="text-xs text-muted-foreground">Capacidade Total</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar refeição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meals Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-4">
                {filteredMeals.map((meal) => {
                  const typeInfo = typeConfig[meal.type];
                  const statusInfo = statusConfig[meal.status];
                  const TypeIcon = typeInfo?.icon || Utensils;

                  return (
                    <div
                      key={meal.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Image Header */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`${statusInfo?.color} text-white border-0`}>
                            {statusInfo?.label}
                          </Badge>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${typeInfo?.bgColor} shadow-lg`}>
                            <TypeIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>

                        {/* Meal Name & Schedule */}
                        <div className="absolute bottom-2 left-2 right-12">
                          <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                            {meal.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{meal.schedule}</span>
                          </div>
                        </div>

                        {/* Menu */}
                        <div className="absolute bottom-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                                <MoreVertical className="h-4 w-4" />
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
                          {meal.description}
                        </p>

                        {/* Location & Capacity */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{meal.location}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{meal.capacity} lugares</span>
                          </div>
                        </div>

                        {/* Inclusions */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {meal.inclusions.slice(0, 4).map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {meal.inclusions.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{meal.inclusions.length - 4}
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Preço por pessoa</span>
                          <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(meal.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredMeals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Utensils className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhuma refeição encontrada</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre uma nova refeição
                  </p>
                  <Button 
                    onClick={() => setNewMealModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Refeição
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Create MealModal component */}
      <Dialog open={newMealModalOpen} onOpenChange={setNewMealModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Refeição</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Modal de cadastro de refeição em desenvolvimento.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
