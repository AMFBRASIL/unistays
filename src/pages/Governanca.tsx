import { useState, useEffect, useCallback, useMemo } from "react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { BarChart3, ClipboardList, Package, Wine, Search as SearchIcon } from "lucide-react";
import {
  Sparkles,
  Wrench,
  Bed,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  RefreshCw,
  ChevronRight,
  Loader2,
  ShowerHead,
  Paintbrush,
  Lightbulb,
  ThermometerSun,
  Wifi,
  DoorOpen,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { NewTaskModal } from "@/components/governanca/NewTaskModal";

import { InventoryModal } from "@/components/governanca/InventoryModal";
import { ConsumptionModal } from "@/components/governanca/ConsumptionModal";
import { LostFoundModal } from "@/components/governanca/LostFoundModal";

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskCategory = "cleaning" | "arrangement" | "maintenance";

interface Task {
  id: string;
  room: string;
  floor: string;
  category: TaskCategory;
  type: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  createdAt: string;
  estimatedTime: string;
  notes?: string;
}



const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2 },
  completed: { label: "Concluído", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  blocked: { label: "Bloqueado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-slate-500/10 text-slate-500" },
  medium: { label: "Média", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "Alta", color: "bg-orange-500/10 text-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500/10 text-red-500" },
};

const categoryConfig: Record<TaskCategory, { label: string; color: string; icon: React.ElementType }> = {
  cleaning: { label: "Limpeza", color: "from-cyan-500 to-blue-500", icon: Sparkles },
  arrangement: { label: "Arrumação", color: "from-violet-500 to-purple-500", icon: Bed },
  maintenance: { label: "Manutenção", color: "from-orange-500 to-red-500", icon: Wrench },
};

const maintenanceTypes = [
  { value: "ac", label: "Ar Condicionado", icon: ThermometerSun },
  { value: "plumbing", label: "Encanamento", icon: ShowerHead },
  { value: "electrical", label: "Elétrica", icon: Lightbulb },
  { value: "painting", label: "Pintura", icon: Paintbrush },
  { value: "wifi", label: "Wi-Fi", icon: Wifi },
  { value: "door", label: "Portas/Fechaduras", icon: DoorOpen },
];


export default function Governanca() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.getHousekeepingTasks(),
        api.getUsers()
      ]);

      if (tasksRes.success) {
        const mappedTasks: Task[] = (tasksRes.data?.tasks || []).map((t: any) => ({
          id: t.id.toString(),
          room: t.unitNumber || "N/A",
          floor: t.unitFloor ? `${t.unitFloor}º Andar` : "Térreo",
          category: t.category,
          type: t.type,
          description: t.description || "",
          status: t.status,
          priority: t.priority,
          assignee: t.assigneeName || "Não atribuído",
          createdAt: format(new Date(t.createdAt), "yyyy-MM-dd HH:mm"),
          estimatedTime: t.estimatedTime || "N/A",
          notes: t.notes,
        }));
        setTasks(mappedTasks);
      }

      if (usersRes.success) {
        // Filter users that could be staff (housekeeping, maintenance, etc)
        // or just show all for now if no strict role filtering is needed
        const mappedStaff = (usersRes.data?.users || []).map((u: any) => ({
          id: u.id.toString(),
          name: u.name,
          role: u.group?.name || "Colaborador",
          tasks: (tasksRes.data?.tasks || []).filter((t: any) => t.assignee_id === u.id && t.status !== 'completed').length,

          avatar: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
        }));
        setStaff(mappedStaff);
      }
    } catch (error) {
      console.error("Failed to fetch governance data", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesTab = activeTab === "all" || task.category === activeTab;
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });


  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  }), [tasks]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;


  const handleCreateTask = () => {
    fetchData();
    setIsNewTaskModalOpen(false);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await api.updateHousekeepingTask(parseInt(taskId), { status: newStatus });
      if (response.success) {
        toast.success(`Status atualizado para ${statusConfig[newStatus].label}`);
        fetchData();
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Governança
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie limpeza, arrumação e manutenção do hotel
            </p>
          </div>
          <Button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-400/70">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400/70">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-400/70">Concluídos</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-400/70">Bloqueados</p>
                  <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs & Filters */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="bg-muted/50 p-1">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background">
                        Todas
                      </TabsTrigger>
                      <TabsTrigger value="cleaning" className="data-[state=active]:bg-background">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Limpeza
                      </TabsTrigger>
                      <TabsTrigger value="arrangement" className="data-[state=active]:bg-background">
                        <Bed className="w-4 h-4 mr-2" />
                        Arrumação
                      </TabsTrigger>
                      <TabsTrigger value="maintenance" className="data-[state=active]:bg-background">
                        <Wrench className="w-4 h-4 mr-2" />
                        Manutenção
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48 bg-muted/50"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 bg-muted/50">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32 bg-muted/50">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Grid */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-3 pr-4">
                {filteredTasks.map((task) => {
                  const StatusIcon = statusConfig[task.status].icon;
                  const CategoryIcon = categoryConfig[task.category].icon;

                  return (
                    <Card
                      key={task.id}
                      className="bg-card/50 backdrop-blur border-border/50 hover:bg-card/70 transition-all duration-200 group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Category Icon */}
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryConfig[task.category].color} flex items-center justify-center shrink-0 shadow-lg`}
                          >
                            <CategoryIcon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground">
                                    Quarto {task.room}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {task.floor}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {task.type} - {task.description}
                                </p>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "in_progress")}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Iniciar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "completed")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Concluir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(task.id, "blocked")}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Bloquear
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              <Badge
                                variant="outline"
                                className={`${statusConfig[task.status].color} border`}
                              >
                                <StatusIcon className={`w-3 h-3 mr-1 ${task.status === "in_progress" ? "animate-spin" : ""}`} />
                                {statusConfig[task.status].label}
                              </Badge>
                              <Badge className={priorityConfig[task.priority].color}>
                                {priorityConfig[task.priority].label}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                {task.assignee}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {task.estimatedTime}
                              </div>
                            </div>

                            {task.notes && (
                              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-xs text-red-400">
                                  <AlertCircle className="w-3 h-3 inline mr-1" />
                                  {task.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progresso do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold text-emerald-400">{completionRate}%</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.completed}/{stats.total} tarefas
                    </span>
                  </div>
                  <Progress value={completionRate} className="h-2 bg-emerald-950" />
                </div>
              </CardContent>
            </Card>

            {/* Staff Card */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Equipe</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Ver todos
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white">
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {member.tasks} tarefas
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsNewTaskModalOpen(true)}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs">Limpeza</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsNewTaskModalOpen(true)}
                >
                  <Bed className="w-4 h-4 text-violet-400" />
                  <span className="text-xs">Arrumação</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsNewTaskModalOpen(true)}
                >
                  <Wrench className="w-4 h-4 text-orange-400" />
                  <span className="text-xs">Manutenção</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsInventoryModalOpen(true)}
                >
                  <Package className="w-4 h-4 text-teal-400" />
                  <span className="text-xs">Inventário</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsConsumptionModalOpen(true)}
                >
                  <Wine className="w-4 h-4 text-rose-400" />
                  <span className="text-xs">Consumos</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1"
                  onClick={() => setIsLostFoundModalOpen(true)}
                >
                  <SearchIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs">Achados</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewTaskModal
        open={isNewTaskModalOpen}
        onOpenChange={setIsNewTaskModalOpen}
        onSave={handleCreateTask}
      />

      <InventoryModal
        open={isInventoryModalOpen}
        onOpenChange={setIsInventoryModalOpen}
      />
      <ConsumptionModal
        open={isConsumptionModalOpen}
        onOpenChange={setIsConsumptionModalOpen}
      />
      <LostFoundModal
        open={isLostFoundModalOpen}
        onOpenChange={setIsLostFoundModalOpen}
      />
    </DashboardLayout>
  );
}
