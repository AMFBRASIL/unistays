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
  Car,
  ParkingCircle,
  ShieldCheck,
  Zap,
  Clock,
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

interface ParkingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  covered: { label: "Coberto", icon: ParkingCircle, color: "text-blue-600", bgColor: "from-blue-500 to-cyan-600" },
  uncovered: { label: "Descoberto", icon: Car, color: "text-slate-600", bgColor: "from-slate-500 to-gray-600" },
  valet: { label: "Valet", icon: ShieldCheck, color: "text-amber-600", bgColor: "from-amber-500 to-orange-600" },
  electric: { label: "Elétrico", icon: Zap, color: "text-emerald-600", bgColor: "from-emerald-500 to-teal-600" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "bg-emerald-500", icon: CheckCircle },
  inactive: { label: "Inativo", color: "bg-gray-500", icon: XCircle },
};

const mockParking = [
  {
    id: "1",
    name: "Estacionamento Coberto Principal",
    type: "covered",
    description: "Garagem coberta com monitoramento 24h",
    priceDaily: 50,
    priceHourly: 15,
    spots: 80,
    availableSpots: 23,
    features: ["Monitorado", "Coberto", "Iluminado", "Segurança"],
    status: "active",
    image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400",
  },
  {
    id: "2",
    name: "Estacionamento Descoberto",
    type: "uncovered",
    description: "Área externa com fácil acesso",
    priceDaily: 30,
    priceHourly: 8,
    spots: 120,
    availableSpots: 67,
    features: ["Iluminado", "Acesso 24h"],
    status: "active",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400",
  },
  {
    id: "3",
    name: "Serviço de Valet",
    type: "valet",
    description: "Manobrista profissional com serviço premium",
    priceDaily: 80,
    priceHourly: 25,
    spots: 30,
    availableSpots: 12,
    features: ["Manobrista", "Lavagem", "Seguro", "Premium"],
    status: "active",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400",
  },
  {
    id: "4",
    name: "Vagas para Veículos Elétricos",
    type: "electric",
    description: "Pontos de recarga para carros elétricos",
    priceDaily: 60,
    priceHourly: 20,
    spots: 10,
    availableSpots: 6,
    features: ["Carregador", "Coberto", "Exclusivo EV"],
    status: "active",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400",
  },
];

export function ParkingListModal({ open, onOpenChange }: ParkingListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newParkingModalOpen, setNewParkingModalOpen] = useState(false);

  const filteredParking = mockParking.filter((parking) => {
    const matchesSearch = parking.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || parking.type === filterType;
    const matchesStatus = filterStatus === "all" || parking.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockParking.length,
    active: mockParking.filter(p => p.status === "active").length,
    totalSpots: mockParking.reduce((acc, p) => acc + p.spots, 0),
    availableSpots: mockParking.reduce((acc, p) => acc + p.availableSpots, 0),
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
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    Estacionamento
                  </DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    Gerencie vagas e tipos de estacionamento
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setNewParkingModalOpen(true)}
                className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
          </DialogHeader>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 py-4 flex-shrink-0">
            <div className="p-3 rounded-xl border border-border bg-card">
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Tipos</p>
            </div>
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <p className="text-xl font-bold text-blue-600">{stats.totalSpots}</p>
              <p className="text-xs text-muted-foreground">Total Vagas</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <p className="text-xl font-bold text-amber-600">{stats.availableSpots}</p>
              <p className="text-xs text-muted-foreground">Disponíveis</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estacionamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[160px]">
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

          {/* Parking Grid */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 pr-4">
                {filteredParking.map((parking) => {
                  const typeInfo = typeConfig[parking.type];
                  const statusInfo = statusConfig[parking.status];
                  const TypeIcon = typeInfo?.icon || Car;
                  const occupancyPercent = Math.round(((parking.spots - parking.availableSpots) / parking.spots) * 100);

                  return (
                    <div
                      key={parking.id}
                      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
                    >
                      {/* Image Header */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={parking.image}
                          alt={parking.name}
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

                        {/* Parking Name */}
                        <div className="absolute bottom-2 left-2 right-12">
                          <h3 className="font-bold text-white text-lg truncate drop-shadow-lg">
                            {parking.name}
                          </h3>
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
                          {parking.description}
                        </p>

                        {/* Occupancy Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ocupação</span>
                            <span className="font-medium">{occupancyPercent}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                occupancyPercent > 80 ? 'bg-red-500' : 
                                occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{parking.spots - parking.availableSpots} ocupadas</span>
                            <span>{parking.availableSpots} disponíveis</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {parking.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        {/* Prices */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{formatCurrency(parking.priceHourly)}</p>
                            <p className="text-xs text-muted-foreground">Por hora</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{formatCurrency(parking.priceDaily)}</p>
                            <p className="text-xs text-muted-foreground">Diária</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredParking.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Car className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Nenhum estacionamento encontrado</h3>
                  <p className="text-muted-foreground mt-1">
                    Tente ajustar os filtros ou cadastre um novo tipo
                  </p>
                  <Button 
                    onClick={() => setNewParkingModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tipo
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* TODO: Create ParkingModal component */}
      <Dialog open={newParkingModalOpen} onOpenChange={setNewParkingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Estacionamento</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Modal de cadastro de estacionamento em desenvolvimento.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
