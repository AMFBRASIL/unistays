import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Brush,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  DollarSign,
  AlertCircle,
  Building2,
} from "lucide-react";

interface CleaningServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: string;
    name: string;
    type: string;
    services: {
      cleaning: "per-stay" | "weekly" | "biweekly" | "monthly";
    };
  } | null;
}

type CleaningSchedule = "per-stay" | "weekly" | "biweekly" | "monthly";

const cleaningOptions: { 
  id: CleaningSchedule; 
  name: string; 
  description: string; 
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}[] = [
  { 
    id: "per-stay", 
    name: "Por Estadia", 
    description: "Limpeza completa realizada após cada check-out do hóspede",
    icon: Calendar,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20"
  },
  { 
    id: "weekly", 
    name: "Semanal", 
    description: "Limpeza toda semana, ideal para estadias de média duração",
    icon: CalendarDays,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20"
  },
  { 
    id: "biweekly", 
    name: "Quinzenal", 
    description: "Limpeza a cada 15 dias para estadias mais longas",
    icon: CalendarRange,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20"
  },
  { 
    id: "monthly", 
    name: "Mensal", 
    description: "Limpeza mensal para contratos de long stay",
    icon: Clock,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20"
  },
];

export default function CleaningServiceModal({ open, onOpenChange, property }: CleaningServiceModalProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<CleaningSchedule>(
    property?.services.cleaning || "per-stay"
  );
  const [additionalSettings, setAdditionalSettings] = useState({
    autoSchedule: true,
    notifyGuest: true,
    notifyStaff: true,
    priorityService: false,
    estimatedDuration: "2",
    baseCost: "150",
  });

  const handleSave = () => {
    toast.success("Configuração de limpeza atualizada com sucesso!");
    onOpenChange(false);
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-background via-background to-blue-500/5 border-blue-500/20 overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
                <Brush className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Configuração de Limpeza
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {property.name}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6 pt-2 space-y-6">
            {/* Property Info */}
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">Configuração atual: {
                      cleaningOptions.find(o => o.id === property.services.cleaning)?.name
                    }</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Selection */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Frequência de Limpeza
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {cleaningOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedSchedule === option.id;
                  
                  return (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected 
                          ? `border-2 border-blue-500/50 ${option.bgColor}` 
                          : "border-border/50 hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedSchedule(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${option.bgColor}`}>
                            <Icon className={`h-5 w-5 ${option.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{option.name}</h4>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Configurações Adicionais
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-500/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Agendamento Automático</Label>
                        <p className="text-xs text-muted-foreground">Criar tarefas automaticamente</p>
                      </div>
                      <Switch 
                        checked={additionalSettings.autoSchedule}
                        onCheckedChange={(checked) => setAdditionalSettings({...additionalSettings, autoSchedule: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificar Hóspede</Label>
                        <p className="text-xs text-muted-foreground">Avisar sobre limpeza agendada</p>
                      </div>
                      <Switch 
                        checked={additionalSettings.notifyGuest}
                        onCheckedChange={(checked) => setAdditionalSettings({...additionalSettings, notifyGuest: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificar Equipe</Label>
                        <p className="text-xs text-muted-foreground">Enviar alerta para governança</p>
                      </div>
                      <Switch 
                        checked={additionalSettings.notifyStaff}
                        onCheckedChange={(checked) => setAdditionalSettings({...additionalSettings, notifyStaff: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/5 to-amber-600/10 border-amber-500/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Serviço Prioritário</Label>
                        <p className="text-xs text-muted-foreground">Limpeza com prioridade alta</p>
                      </div>
                      <Switch 
                        checked={additionalSettings.priorityService}
                        onCheckedChange={(checked) => setAdditionalSettings({...additionalSettings, priorityService: checked})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duração Estimada (horas)
                      </Label>
                      <Input
                        type="number"
                        value={additionalSettings.estimatedDuration}
                        onChange={(e) => setAdditionalSettings({...additionalSettings, estimatedDuration: e.target.value})}
                        className="bg-background/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Custo Base (R$)
                      </Label>
                      <Input
                        type="number"
                        value={additionalSettings.baseCost}
                        onChange={(e) => setAdditionalSettings({...additionalSettings, baseCost: e.target.value})}
                        className="bg-background/50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Info Box */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Importante</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      As alterações serão aplicadas apenas para novas reservas. Reservas existentes 
                      manterão a configuração atual até serem modificadas manualmente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
