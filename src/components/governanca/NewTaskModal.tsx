import { useState, useEffect, useMemo } from "react";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Hotel,
  Building,
  TreePine,
  Home,
  CheckCircle,
  X,
  Sparkles,
  Bed,
  Wrench,
  Clock,
  User,
  ThermometerSun,
  ShowerHead,
  Lightbulb,
  Paintbrush,
  Wifi,
  DoorOpen,
  Calendar,
  MapPin,
  FileText,
  Zap,
  ClipboardList,
  AlertTriangle,
  Timer,
  UserCheck,
  Building2,
  Hammer,
  Brush,
  BedDouble,
  SprayCan,
  Loader2
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";


interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  initialCategory?: "cleaning" | "arrangement" | "maintenance";
  initialPropertyId?: string;
  initialUnitId?: string;
}


type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type TaskCategory = "cleaning" | "arrangement" | "maintenance";
type TaskPriority = "low" | "medium" | "high" | "urgent";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; bgColor: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500", bgColor: "bg-emerald-500/10" }
};

const categoryConfig: Record<TaskCategory, {
  label: string;
  icon: typeof Sparkles;
  color: string;
  gradient: string;
  lightBg: string;
  description: string;
  illustration: typeof SprayCan;
}> = {
  cleaning: {
    label: "Limpeza",
    icon: Sparkles,
    color: "text-cyan-500",
    gradient: "from-cyan-500 to-blue-500",
    lightBg: "from-cyan-500/10 via-blue-500/10 to-cyan-500/5",
    description: "Limpeza completa ou de manutenção",
    illustration: SprayCan
  },
  arrangement: {
    label: "Arrumação",
    icon: Bed,
    color: "text-violet-500",
    gradient: "from-violet-500 to-purple-500",
    lightBg: "from-violet-500/10 via-purple-500/10 to-violet-500/5",
    description: "Arrumação de cama e reposição",
    illustration: BedDouble
  },
  maintenance: {
    label: "Manutenção",
    icon: Wrench,
    color: "text-orange-500",
    gradient: "from-orange-500 to-red-500",
    lightBg: "from-orange-500/10 via-red-500/10 to-orange-500/5",
    description: "Reparos e manutenção preventiva",
    illustration: Hammer
  }
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  low: { label: "Baixa", color: "text-slate-500", bgColor: "bg-slate-500/10", borderColor: "border-slate-500/30" },
  medium: { label: "Média", color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  high: { label: "Alta", color: "text-orange-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  urgent: { label: "Urgente", color: "text-red-500", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" }
};

const cleaningTypes = [
  { value: "complete", label: "Limpeza Completa", time: "45 min", icon: Sparkles },
  { value: "quick", label: "Limpeza Rápida", time: "15 min", icon: Brush },
  { value: "deep", label: "Limpeza Profunda", time: "90 min", icon: SprayCan },
  { value: "checkout", label: "Pós Check-out", time: "60 min", icon: DoorOpen },
];

const arrangementTypes = [
  { value: "bed", label: "Arrumação de Cama", time: "10 min", icon: Bed },
  { value: "amenities", label: "Reposição Amenities", time: "15 min", icon: Sparkles },
  { value: "towels", label: "Troca de Enxoval", time: "20 min", icon: BedDouble },
  { value: "full", label: "Arrumação Completa", time: "25 min", icon: CheckCircle },
];

const maintenanceTypes = [
  { value: "ac", label: "Ar Condicionado", icon: ThermometerSun, time: "1h" },
  { value: "plumbing", label: "Encanamento", icon: ShowerHead, time: "2h" },
  { value: "electrical", label: "Elétrica", icon: Lightbulb, time: "1h" },
  { value: "painting", label: "Pintura", icon: Paintbrush, time: "3h" },
  { value: "wifi", label: "Wi-Fi", icon: Wifi, time: "45 min" },
  { value: "door", label: "Portas/Fechaduras", icon: DoorOpen, time: "1h" },
];




export function NewTaskModal({
  open,
  onOpenChange,
  onSave,
  initialCategory = "cleaning",
  initialPropertyId,
  initialUnitId
}: NewTaskModalProps) {
  const [category, setCategory] = useState<TaskCategory>(initialCategory);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | "all">("all");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    property: "",
    room: "",
    type: "",
    priority: "medium" as TaskPriority,
    assignee: "",
    description: "",
    notes: "",
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: "09:00",
  });

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        property: initialPropertyId || "",
        room: initialUnitId || "",
      }));
      fetchInitialData();
    }
  }, [open, initialPropertyId, initialUnitId]);

  useEffect(() => {
    if (formData.property) {
      fetchUnitsAndReservations(parseInt(formData.property));
    } else {
      setUnits([]);
      setReservations([]);
    }
  }, [formData.property]);


  const fetchInitialData = async () => {
    try {
      const [propsRes, usersRes] = await Promise.all([
        api.getProperties(),
        api.getUsers()
      ]);

      if (propsRes.success) {
        setProperties(propsRes.data?.properties || []);
      }

      if (usersRes.success) {
        setStaff((usersRes.data?.users || []).map((u: any) => {
          const groupName = u.group?.name?.toLowerCase() || '';
          const isHousekeeping =
            groupName.includes('limpeza') ||
            groupName.includes('housekeeping') ||
            groupName.includes('governança') ||
            groupName.includes('governanca') ||
            groupName.includes('camareira') ||
            groupName.includes('arrumadeira') ||
            groupName.includes('serviço') ||
            groupName.includes('arrumação') ||
            groupName.includes('arrumacao');

          const isMaintenance =
            groupName.includes('manutenção') ||
            groupName.includes('manutencao') ||
            groupName.includes('maintenance') ||
            groupName.includes('técnico') ||
            groupName.includes('tecnico') ||
            groupName.includes('reparos');

          return {
            id: u.id.toString(),
            name: u.name,
            role: u.group?.name || "Colaborador",
            avatar: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
            category: isHousekeeping ? 'cleaning' : (isMaintenance ? 'maintenance' : 'other'),
            isHousekeeping
          };
        }));
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  };

  const fetchUnitsAndReservations = async (propertyId: number) => {
    setIsLoading(true);
    try {
      const [unitsRes, resRes] = await Promise.all([
        api.getUnits(propertyId),
        api.getReservations({ propertyId, status: 'checked_in' })
      ]);
      if (unitsRes.success) {
        setUnits(unitsRes.data?.units || []);
      }
      if (resRes.success) {
        setReservations(resRes.data?.reservations || []);
      }
    } catch (error) {
      console.error("Failed to fetch property data", error);
      toast.error("Erro ao carregar unidades e reservas");
    } finally {
      setIsLoading(false);
    }
  };



  const filteredProperties = propertyTypeFilter === "all"
    ? properties
    : properties.filter(p => p.type === propertyTypeFilter);

  const selectedProperty = properties.find(p => p.id.toString() === formData.property);

  // Quarto/Unidade: mostrar apenas os que estão no dia do checkout (em uso mas saindo hoje) ou já desocupados
  const availableRooms = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return units.filter(unit => {
      // 1. Ocultar se já estiver em Limpeza ou Manutenção (tarefa em andamento)
      if (['cleaning', 'maintenance'].includes(unit.status)) return false;

      // 2. Verificar reservas checked_in para esta unidade
      const unitReservation = reservations.find(res => res.unitId === unit.id);
      if (unitReservation) {
        const resCheckOut = new Date(unitReservation.checkOut);
        resCheckOut.setHours(0, 0, 0, 0);
        const checkoutToday = resCheckOut.getTime() === today.getTime();
        const checkoutAlreadyPassed = resCheckOut.getTime() < today.getTime();
        // Em uso com checkout HOJE -> mostrar (pode agendar tarefa para após saída)
        if (checkoutToday) return true;
        // Em uso com checkout no FUTURO -> não mostrar (quarto ainda ocupado)
        if (resCheckOut.getTime() > today.getTime()) return false;
        // Checkout já passou (reserva ainda em checked_in mas data passou) -> liberar
        if (checkoutAlreadyPassed) return true;
      }

      // 3. Sem reserva checked_in para esta unidade: desocupado ou disponível -> mostrar
      // (inclui status available, unoccupied, etc.)
      return true;
    });
  }, [units, reservations]);



  const filteredStaff = useMemo(() => staff.filter(s => {
    // Para todas as categorias (Limpeza, Arrumação ou Manutenção), mostramos tanto equipe de Governança quanto Manutenção
    // para garantir que o usuário sempre tenha opções de atribuição.
    return s.isHousekeeping || s.category === "maintenance";
  }), [staff, category]);

  const getTaskTypes = () => {
    switch (category) {
      case "cleaning": return cleaningTypes;
      case "arrangement": return arrangementTypes;
      case "maintenance": return maintenanceTypes;
      default: return [];
    }
  };

  const handleSubmit = async () => {
    if (!formData.property || !formData.room || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const taskType = getTaskTypes().find(t => t.value === formData.type);

      const response = await api.createHousekeepingTask({
        propertyId: parseInt(formData.property),
        unitId: parseInt(formData.room),
        category,
        type: taskType?.label || formData.type,
        description: formData.description,
        priority: formData.priority,
        assigneeId: formData.assignee ? parseInt(formData.assignee) : null,
        estimatedTime: taskType?.time || null,
        notes: formData.notes,
        scheduledAt: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
      });

      if (response.success) {
        toast.success("Tarefa criada com sucesso!");
        if (onSave) onSave();
        handleClose();
      } else {
        toast.error(response.error?.message || "Erro ao criar tarefa");
      }
    } catch (error) {
      toast.error("Erro de conexão ao servidor");
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFormData({
        property: "",
        room: "",
        type: "",
        priority: "medium",
        assignee: "",
        description: "",
        notes: "",
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: "09:00",
      });
    }, 300);
  };

  const CategoryIcon = categoryConfig[category].icon;
  const IllustrationIcon = categoryConfig[category].illustration;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={cn(
          "relative px-6 py-5 border-b bg-gradient-to-r",
          categoryConfig[category].lightBg
        )}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className={cn("w-full h-full", categoryConfig[category].color)}>
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          {/* Floating illustration */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <IllustrationIcon className={cn("h-24 w-24", categoryConfig[category].color)} />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={cn(
                "p-3 rounded-2xl shadow-lg bg-gradient-to-br",
                categoryConfig[category].gradient
              )}>
                <CategoryIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Nova Tarefa</span>
                <span className={cn("text-sm font-normal", categoryConfig[category].color)}>
                  {categoryConfig[category].description}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Category Selection */}
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(categoryConfig) as TaskCategory[]).map((cat) => {
                const config = categoryConfig[cat];
                const Icon = config.icon;
                const Illustration = config.illustration;
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setFormData(prev => ({ ...prev, type: "", assignee: "" }));
                    }}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 transition-all overflow-hidden group",
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg`
                        : "border-border/50 hover:border-border bg-card"
                    )}
                  >
                    {/* Background illustration */}
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Illustration className={cn(
                        "h-20 w-20 transition-transform group-hover:scale-110",
                        !isSelected && config.color
                      )} />
                    </div>

                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                        isSelected
                          ? "bg-white/20"
                          : "bg-muted group-hover:scale-105"
                      )}>
                        <Icon className={cn("h-6 w-6", !isSelected && config.color)} />
                      </div>
                      <p className="font-semibold text-lg">{config.label}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      )}>
                        {config.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Property & Room Selection */}
            <div className={cn(
              "p-5 rounded-2xl border bg-gradient-to-r",
              categoryConfig[category].lightBg,
              "border-opacity-20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  categoryConfig[category].gradient
                )}>
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Local da Tarefa</Label>
                  <p className="text-xs text-muted-foreground">Selecione a propriedade e o quarto/unidade</p>
                </div>
              </div>

              {/* Property Type Filter */}
              <div className="flex gap-2 flex-wrap mb-4">
                <Button
                  type="button"
                  variant={propertyTypeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropertyTypeFilter("all")}
                  className={cn(
                    propertyTypeFilter === "all" && `bg-gradient-to-r ${categoryConfig[category].gradient}`
                  )}
                >
                  Todas
                </Button>
                {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                  const config = propertyTypeConfig[type];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant={propertyTypeFilter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPropertyTypeFilter(type)}
                      className={cn(
                        "gap-1.5",
                        propertyTypeFilter === type && `bg-gradient-to-r ${categoryConfig[category].gradient}`
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Propriedade *</Label>
                  <Select
                    value={formData.property}
                    onValueChange={(v) => setFormData({ ...formData, property: v, room: "" })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione a propriedade" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProperties.map((prop) => {
                        const config = propertyTypeConfig[prop.type];
                        const Icon = config.icon;
                        return (
                          <SelectItem key={prop.id} value={prop.id.toString()}>

                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-4 w-4", config.color)} />
                              <span>{prop.name}</span>
                              <Badge variant="outline" className="text-xs ml-1">
                                {config.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quarto/Unidade *</Label>
                  <Select
                    value={formData.room}
                    onValueChange={(v) => setFormData({ ...formData, room: v })}
                    disabled={!formData.property}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecione o quarto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.length === 0 ? (
                        <div className="p-4 text-sm text-center text-muted-foreground">
                          {formData.property
                            ? "Nenhuma unidade disponível: apenas quartos em checkout hoje ou já desocupados aparecem aqui."
                            : "Selecione uma propriedade primeiro."}
                        </div>
                      ) : (
                        availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              Quarto {room.number}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Task Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  categoryConfig[category].gradient
                )}>
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Tipo de {categoryConfig[category].label} *</Label>
                  <p className="text-xs text-muted-foreground">Selecione o tipo de tarefa a ser executada</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getTaskTypes().map((type) => {
                  const isSelected = formData.type === type.value;
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center group",
                        isSelected
                          ? `border-transparent bg-gradient-to-br ${categoryConfig[category].gradient} text-white shadow-lg`
                          : "border-border/50 hover:border-border bg-card"
                      )}
                    >
                      <div className={cn(
                        "mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all",
                        isSelected
                          ? "bg-white/20"
                          : "bg-muted group-hover:scale-105"
                      )}>
                        <TypeIcon className={cn(
                          "h-5 w-5",
                          isSelected ? "text-white" : categoryConfig[category].color
                        )} />
                      </div>
                      <p className="font-medium text-sm">{type.label}</p>
                      <div className={cn(
                        "flex items-center justify-center gap-1 mt-1",
                        isSelected ? "text-white/80" : "text-muted-foreground"
                      )}>
                        <Timer className="h-3 w-3" />
                        <span className="text-xs">{type.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority & Assignee */}
            <div className="grid grid-cols-2 gap-6">
              {/* Priority */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    categoryConfig[category].gradient
                  )}>
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Prioridade *</Label>
                    <p className="text-xs text-muted-foreground">Defina a urgência da tarefa</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(priorityConfig) as TaskPriority[]).map((priority) => {
                    const config = priorityConfig[priority];
                    const isSelected = formData.priority === priority;
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2",
                          isSelected
                            ? `${config.bgColor} ${config.borderColor} border-2`
                            : "border-border/50 hover:border-border bg-card"
                        )}
                      >
                        {priority === "urgent" && <Zap className={cn("h-4 w-4", config.color)} />}
                        <span className={cn("text-sm font-medium", isSelected && config.color)}>
                          {config.label}
                        </span>
                        {isSelected && <CheckCircle className={cn("h-4 w-4", config.color)} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    categoryConfig[category].gradient
                  )}>
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Responsável *</Label>
                    <p className="text-xs text-muted-foreground">Atribua a tarefa a um colaborador</p>
                  </div>
                </div>

                <Select
                  value={formData.assignee}
                  onValueChange={(v) => setFormData({ ...formData, assignee: v })}
                >
                  <SelectTrigger className="bg-background h-12">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStaff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br",
                            categoryConfig[category].gradient
                          )}>
                            {person.avatar}
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{person.name}</p>
                            <p className="text-xs text-muted-foreground">{person.role}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className={cn("h-4 w-4", categoryConfig[category].color)} />
                  <Label>Data Agendada</Label>
                </div>
                <Input
                  type="date"
                  className="bg-background"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className={cn("h-4 w-4", categoryConfig[category].color)} />
                  <Label>Horário</Label>
                </div>
                <Input
                  type="time"
                  className="bg-background"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            {/* Description & Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className={cn("h-4 w-4", categoryConfig[category].color)} />
                <Label>Descrição / Observações</Label>
              </div>
              <Textarea
                placeholder="Descreva a tarefa em detalhes ou adicione observações..."
                className="bg-background resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Summary Card */}
            {formData.property && formData.room && formData.type && (
              <div className={cn(
                "p-5 rounded-2xl border-2 relative overflow-hidden bg-gradient-to-r",
                categoryConfig[category].lightBg
              )}>
                {/* Decorative illustration */}
                <div className="absolute -right-6 -top-6 opacity-10">
                  <IllustrationIcon className={cn("h-28 w-28", categoryConfig[category].color)} />
                </div>

                <div className="relative flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    categoryConfig[category].gradient
                  )}>
                    <CategoryIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Resumo da tarefa</p>
                    <p className="font-semibold text-lg">
                      {getTaskTypes().find(t => t.value === formData.type)?.label}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {selectedProperty?.name}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Quarto {availableRooms.find(r => r.id.toString() === formData.room)?.number ?? formData.room}
                      </Badge>
                      {formData.assignee && (
                        <Badge variant="outline" className="gap-1">
                          <User className="h-3 w-3" />
                          {staff.find(s => s.id === formData.assignee)?.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-3 py-1.5",
                    priorityConfig[formData.priority].bgColor,
                    priorityConfig[formData.priority].color
                  )}>
                    {formData.priority === "urgent" && <Zap className="h-3 w-3 mr-1" />}
                    {priorityConfig[formData.priority].label}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={handleClose} size="lg">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={isLoading}
            className={cn(
              "min-w-[180px] bg-gradient-to-r",
              categoryConfig[category].gradient
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            {isLoading ? "Criando..." : "Criar Tarefa"}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
