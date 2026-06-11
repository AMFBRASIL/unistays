import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Zap,
  Droplets,
  Wind,
  Building,
  Shield,
  BedDouble,
  Pencil,
  X,
  Play,
  Pause,
  Ban,
  ImageIcon,
  Tag,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api } from "@/lib/api";

interface MaintenanceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Record<string, unknown> | null;
  onEdit: (order: Record<string, unknown>) => void;
  onStart?: (id: number) => void;
  onComplete?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const typeLabels: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  outros: "Preditiva / Outros",
  inspecao: "Inspeção",
};

const typeColors: Record<string, string> = {
  preventiva: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  corretiva: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  outros: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  inspecao: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  scheduled: "Agendado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  overdue: "Vencido",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  overdue: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  scheduled: Calendar,
  in_progress: Settings,
  completed: CheckCircle2,
  cancelled: Ban,
  overdue: AlertTriangle,
};

// Type icons mapping
const typeIcons: Record<string, typeof Wrench> = {
  preventiva: Shield,
  corretiva: Wrench,
  outros: Sparkles,
  inspecao: SearchIcon,
};

// Category icon mapping (matches backend icon field names)
const categoryIconMap: Record<string, typeof Settings> = {
  Wind, Building, Zap, Droplets, Shield, BedDouble, Settings, Wrench,
};

export function MaintenanceDetailsModal({
  open,
  onOpenChange,
  order,
  onEdit,
  onStart,
  onComplete,
  onCancel,
}: MaintenanceDetailsModalProps) {
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryIcon, setCategoryIcon] = useState<string>("");
  const [categoryColor, setCategoryColor] = useState<string>("");
  const [equipmentDetails, setEquipmentDetails] = useState<Record<string, unknown> | null>(null);

  // Fetch category and equipment details when order changes
  useEffect(() => {
    if (!open || !order) {
      setCategoryName("");
      setCategoryIcon("");
      setCategoryColor("");
      setEquipmentDetails(null);
      return;
    }

    // Fetch category name from categoryId
    if (order.categoryId) {
      api.getEquipmentCategories().then((res) => {
        if (res.success && res.data?.equipmentCategories) {
          const cats = res.data.equipmentCategories as { id: number; name: string; icon?: string; color?: string }[];
          const cat = cats.find(c => c.id === Number(order.categoryId));
          if (cat) {
            setCategoryName(cat.name);
            setCategoryIcon(cat.icon || "");
            setCategoryColor(cat.color || "");
          }
        }
      });
    }

    // Fetch equipment details from equipmentId
    if (order.equipmentId) {
      api.getEquipmentById(Number(order.equipmentId)).then((res) => {
        if (res.success && res.data) {
          setEquipmentDetails(res.data as Record<string, unknown>);
        }
      }).catch(() => {
        // Equipment may have been deleted, ignore
      });
    }
  }, [open, order]);

  if (!order) return null;

  const status = String(order.status || "pending");
  const type = String(order.type || "preventiva");
  const priority = String(order.priority || "medium");
  const StatusIcon = statusIcons[status] || Clock;
  const TypeIcon = typeIcons[type] || Wrench;
  const CategoryIcon = categoryIcon ? (categoryIconMap[categoryIcon] || Tag) : Tag;

  const formatDate = (value: unknown) => {
    if (!value) return "-";
    try {
      return format(new Date(value as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatDateShort = (value: unknown) => {
    if (!value) return "-";
    try {
      return format(new Date(value as string), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatCurrency = (value: unknown) => {
    const num = Number(value || 0);
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const images = Array.isArray(order.images) ? order.images as string[] : [];
  const canStart = status === "pending" || status === "scheduled" || status === "overdue";
  const canComplete = status === "in_progress";
  const canCancel = status !== "completed" && status !== "cancelled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden bg-white dark:bg-card border-0">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 pb-5">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold truncate">{String(order.title || "Ordem de Manutenção")}</h2>
              </div>
              <p className="text-white/70 text-sm">
                Protocolo: <span className="font-mono font-semibold text-white/90">{String(order.uuid || "-").slice(0, 8).toUpperCase()}</span>
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={`${statusColors[status]} border bg-white/10 text-white`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusLabels[status] || status}
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {typeLabels[type] || type}
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  {priorityLabels[priority] || priority}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(85vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Tipo, Categoria e Equipamento - Destaque Principal */}
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                  {/* Tipo de Manutenção */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Wrench className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Tipo de Manutenção</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${typeColors[type]?.split(" ")[0] || "bg-orange-500/10"}`}>
                        <TypeIcon className={`w-5 h-5 ${typeColors[type]?.split(" ")[1] || "text-orange-500"}`} />
                      </div>
                      <div>
                        <p className="font-bold text-base">{typeLabels[type] || type}</p>
                        <Badge variant="outline" className={`mt-1 text-[10px] ${typeColors[type]}`}>
                          {type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Categoria */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Categoria</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${categoryColor || "bg-muted"}`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base">{categoryName || "Sem categoria"}</p>
                        {order.categoryId && (
                          <p className="text-xs text-muted-foreground mt-0.5">ID: {String(order.categoryId)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Equipamento */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Settings className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Equipamento</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-500/10">
                        <Settings className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-bold text-base">{String(order.equipment || "-")}</p>
                        {equipmentDetails?.location && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {String(equipmentDetails.location)}
                          </p>
                        )}
                        {!equipmentDetails?.location && order.location && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {String(order.location)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização, Responsável e Prioridade */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Localização</span>
                  </div>
                  <p className="font-semibold">{String(order.location || "-")}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Responsável</span>
                  </div>
                  <p className="font-semibold">{String(order.assignedTo || "Não atribuído")}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Prioridade</span>
                  </div>
                  <Badge variant="outline" className={priorityColors[priority]}>
                    {priorityLabels[priority] || priority}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Dates */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Datas</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Agendado Para</p>
                    <p className="font-semibold text-sm">{formatDate(order.scheduledDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Vencimento</p>
                    <p className={`font-semibold text-sm ${status === "overdue" ? "text-red-500" : ""}`}>
                      {formatDateShort(order.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Concluído Em</p>
                    <p className="font-semibold text-sm">{formatDate(order.completedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Criado Em</p>
                    <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Custo Estimado</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">R$ {formatCurrency(order.cost)}</p>
              </CardContent>
            </Card>

            {/* Description */}
            {order.description && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Descrição do Serviço</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{String(order.description)}</p>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {images.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Anexos ({images.length})</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border bg-muted aspect-video">
                        <img
                          src={url.startsWith("http") ? url : `${(import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace("/api/v1", "")}${url}`}
                          alt={`Anexo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline / Audit */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Linha do Tempo</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Ordem criada</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.scheduledDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Agendada para {formatDateShort(order.scheduledDate)}</p>
                      </div>
                    </div>
                  )}
                  {status === "in_progress" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Em andamento</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  {order.completedDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Concluída</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.completedDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <Button
                variant="outline"
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                onClick={() => onCancel(order.id as number)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
            {canStart && onStart && (
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => onStart(order.id as number)}
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </Button>
            )}
            {canComplete && onComplete && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onComplete(order.id as number)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90"
              onClick={() => {
                onOpenChange(false);
                onEdit(order);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
