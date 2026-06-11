import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Package,
  Tv,
  AirVent,
  WashingMachine,
  Refrigerator,
  Flame,
  Wifi,
  Lock,
  Lightbulb,
  Zap,
  Thermometer,
  Camera,
  Car,
  Bed,
  Bath,
  Dumbbell,
  Music,
  Printer,
  Monitor,
  Server,
  Fan,
  Heater,
  Microwave,
  Coffee,
  Utensils,
  ShowerHead,
  DoorOpen,
  Key,
  Bell,
  Phone,
  Speaker,
  Projector,
  Router,
  HardDrive,
  Cpu,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface EquipmentCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated?: (category: { id: string; label: string; icon: string; color: string }) => void;
}

const availableIcons = [
  { id: "AirVent", icon: AirVent, label: "Climatização" },
  { id: "WashingMachine", icon: WashingMachine, label: "Lavanderia" },
  { id: "Flame", icon: Flame, label: "Fogão" },
  { id: "Refrigerator", icon: Refrigerator, label: "Refrigeração" },
  { id: "Tv", icon: Tv, label: "TV" },
  { id: "Lock", icon: Lock, label: "Segurança" },
  { id: "Lightbulb", icon: Lightbulb, label: "Iluminação" },
  { id: "Wifi", icon: Wifi, label: "Wi-Fi" },
  { id: "Zap", icon: Zap, label: "Elétrico" },
  { id: "Thermometer", icon: Thermometer, label: "Temperatura" },
  { id: "Camera", icon: Camera, label: "Câmera" },
  { id: "Car", icon: Car, label: "Veículo" },
  { id: "Bed", icon: Bed, label: "Cama" },
  { id: "Bath", icon: Bath, label: "Banheira" },
  { id: "Dumbbell", icon: Dumbbell, label: "Academia" },
  { id: "Music", icon: Music, label: "Música" },
  { id: "Printer", icon: Printer, label: "Impressora" },
  { id: "Monitor", icon: Monitor, label: "Monitor" },
  { id: "Server", icon: Server, label: "Servidor" },
  { id: "Fan", icon: Fan, label: "Ventilador" },
  { id: "Heater", icon: Heater, label: "Aquecedor" },
  { id: "Microwave", icon: Microwave, label: "Micro-ondas" },
  { id: "Coffee", icon: Coffee, label: "Cafeteira" },
  { id: "Utensils", icon: Utensils, label: "Utensílios" },
  { id: "ShowerHead", icon: ShowerHead, label: "Chuveiro" },
  { id: "DoorOpen", icon: DoorOpen, label: "Porta" },
  { id: "Key", icon: Key, label: "Chave" },
  { id: "Bell", icon: Bell, label: "Campainha" },
  { id: "Phone", icon: Phone, label: "Telefone" },
  { id: "Speaker", icon: Speaker, label: "Som" },
  { id: "Projector", icon: Projector, label: "Projetor" },
  { id: "Router", icon: Router, label: "Roteador" },
  { id: "HardDrive", icon: HardDrive, label: "Storage" },
  { id: "Cpu", icon: Cpu, label: "Computador" },
];

const colorOptions = [
  { id: "cyan-blue", gradient: "from-cyan-500 to-blue-500", label: "Azul Ciano" },
  { id: "violet-purple", gradient: "from-violet-500 to-purple-500", label: "Violeta" },
  { id: "orange-red", gradient: "from-orange-500 to-red-500", label: "Laranja" },
  { id: "blue-cyan", gradient: "from-blue-500 to-cyan-500", label: "Azul" },
  { id: "pink-rose", gradient: "from-pink-500 to-rose-500", label: "Rosa" },
  { id: "red-rose", gradient: "from-red-500 to-rose-500", label: "Vermelho" },
  { id: "yellow-amber", gradient: "from-yellow-500 to-amber-500", label: "Amarelo" },
  { id: "emerald-green", gradient: "from-emerald-500 to-green-500", label: "Verde" },
  { id: "amber-yellow", gradient: "from-amber-500 to-yellow-500", label: "Âmbar" },
  { id: "rose-pink", gradient: "from-rose-500 to-pink-500", label: "Rose" },
  { id: "teal-cyan", gradient: "from-teal-500 to-cyan-500", label: "Teal" },
  { id: "indigo-blue", gradient: "from-indigo-500 to-blue-500", label: "Índigo" },
];

export function EquipmentCategoryModal({ 
  open, 
  onOpenChange,
  onCategoryCreated 
}: EquipmentCategoryModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
  });

  const selectedIcon = availableIcons.find(i => i.id === formData.icon);
  const selectedColor = colorOptions.find(c => c.id === formData.color);
  const colorGradient = selectedColor?.gradient || "from-gray-500 to-slate-500";

  const handleSubmit = async () => {
    if (!formData.name || !formData.icon || !formData.color) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, ícone e cor da categoria.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.createEquipmentCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon,
        color: colorGradient,
      });
      const data = (res as { data?: { id: number; name: string; icon?: string; color?: string } }).data;
      if (data?.id != null) {
        toast({
          title: "Categoria criada",
          description: `${formData.name} foi adicionada com sucesso.`,
        });
        onCategoryCreated?.({
          id: String(data.id),
          label: data.name,
          icon: data.icon ?? formData.icon,
          color: data.color ?? colorGradient,
        });
        onOpenChange(false);
        setFormData({ name: "", description: "", icon: "", color: "" });
      } else {
        toast({
          title: "Erro ao criar categoria",
          description: "Resposta inválida do servidor.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Erro ao criar categoria",
        description: (e as Error)?.message ?? "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = formData.name && formData.icon && formData.color;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden bg-background border-border">
        <DialogHeader className="pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Nova Categoria de Equipamento
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Crie uma categoria personalizada para seus ativos
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Preview Card */}
            {(formData.name || formData.icon) && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${selectedColor?.gradient || "from-gray-400 to-gray-500"} flex items-center justify-center`}>
                    {selectedIcon ? (
                      <selectedIcon.icon className="h-6 w-6 text-white" />
                    ) : (
                      <Package className="h-6 w-6 text-white/50" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {formData.name || "Nome da Categoria"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || "Descrição da categoria"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Name & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Equipamentos de Piscina"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os tipos de equipamentos desta categoria..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label>Ícone *</Label>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                {availableIcons.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.icon === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                      className={`p-2.5 rounded-lg border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-border hover:border-orange-500/50"
                      }`}
                      title={item.label}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? "text-orange-500" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label>Cor *</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {colorOptions.map((color) => {
                  const isSelected = formData.color === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.id }))}
                      className={`relative p-1 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-foreground"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className={`h-10 rounded-lg bg-gradient-to-r ${color.gradient}`} />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center">
                            <Check className="h-4 w-4 text-foreground" />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-center text-muted-foreground mt-1">{color.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            {saving ? "Criando..." : "Criar Categoria"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}