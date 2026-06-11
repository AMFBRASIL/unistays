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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  BedDouble,
  Building2,
  DoorOpen,
  Eye,
  Compass,
  Wifi,
  Tv,
  AirVent,
  Coffee,
  Bath,
  Check,
  Sparkles,
  Hotel,
  Building,
  Home,
  Palmtree,
  Sun,
  Moon,
  MapPin,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const propertyTypes = [
  { id: "hotel", icon: Hotel, label: "Hotel", color: "from-blue-500 to-blue-600" },
  { id: "apart", icon: Building, label: "Apart-Hotel", color: "from-violet-500 to-violet-600" },
  { id: "loft", icon: Home, label: "Loft", color: "from-emerald-500 to-emerald-600" },
  { id: "temporada", icon: Palmtree, label: "Temporada", color: "from-amber-500 to-amber-600" },
];

const roomTypes = [
  { id: "standard", label: "Standard", price: "R$ 180,00" },
  { id: "superior", label: "Superior", price: "R$ 280,00" },
  { id: "deluxe", label: "Deluxe", price: "R$ 380,00" },
  { id: "suite", label: "Suíte", price: "R$ 480,00" },
  { id: "master", label: "Suíte Master", price: "R$ 680,00" },
];

const views = [
  { id: "mar", icon: Sun, label: "Vista Mar" },
  { id: "cidade", icon: Building2, label: "Vista Cidade" },
  { id: "jardim", icon: Palmtree, label: "Vista Jardim" },
  { id: "interna", icon: Moon, label: "Vista Interna" },
];

const features = [
  { id: "wifi", icon: Wifi, label: "Wi-Fi" },
  { id: "tv", icon: Tv, label: "Smart TV" },
  { id: "ac", icon: AirVent, label: "Ar Cond." },
  { id: "coffee", icon: Coffee, label: "Cafeteira" },
  { id: "bath", icon: Bath, label: "Banheira" },
];

export function RoomModal({ open, onOpenChange }: RoomModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    number: "",
    floor: "",
    propertyType: "",
    roomType: "",
    view: "",
    position: "",
    selectedFeatures: [] as string[],
    isActive: true,
    isClean: true,
    notes: "",
  });

  const toggleFeature = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(id)
        ? prev.selectedFeatures.filter(f => f !== id)
        : [...prev.selectedFeatures, id]
    }));
  };

  const handleSubmit = () => {
    toast({
      title: "Quarto Cadastrado",
      description: `Quarto ${formData.number} foi cadastrado com sucesso!`,
    });
    onOpenChange(false);
    setStep(1);
    setFormData({
      number: "",
      floor: "",
      propertyType: "",
      roomType: "",
      view: "",
      position: "",
      selectedFeatures: [],
      isActive: true,
      isClean: true,
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10">
        <DialogHeader className="pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Layers className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Novo Quarto
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Cadastre uma nova unidade habitacional
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === s
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      : step > s
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="py-6 px-1 space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Property Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-cyan-400" />
                    Tipo de Propriedade
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: type.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.propertyType === type.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mx-auto mb-3`}>
                          <type.icon className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-medium text-foreground text-center">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Number and Floor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number" className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-cyan-400" />
                      Número do Quarto
                    </Label>
                    <Input
                      id="number"
                      placeholder="Ex: 101"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      Andar
                    </Label>
                    <Select value={formData.floor} onValueChange={(v) => setFormData(prev => ({ ...prev, floor: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((f) => (
                          <SelectItem key={f} value={f.toString()}>{f}º Andar</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="flex items-center gap-2">
                      <Compass className="h-4 w-4 text-cyan-400" />
                      Posição
                    </Label>
                    <Select value={formData.position} onValueChange={(v) => setFormData(prev => ({ ...prev, position: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frente">Frente</SelectItem>
                        <SelectItem value="fundos">Fundos</SelectItem>
                        <SelectItem value="lateral-esq">Lateral Esquerda</SelectItem>
                        <SelectItem value="lateral-dir">Lateral Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Room Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <BedDouble className="h-5 w-5 text-violet-400" />
                    Tipo de Quarto
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roomTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, roomType: type.id }))}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.roomType === type.id
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">{type.label}</p>
                            <p className="text-sm text-muted-foreground">Diária a partir de</p>
                          </div>
                          <Badge className="bg-violet-500/20 text-violet-400 border-0">
                            {type.price}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-400" />
                    Vista do Quarto
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {views.map((view) => (
                      <button
                        key={view.id}
                        onClick={() => setFormData(prev => ({ ...prev, view: view.id }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.view === view.id
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <view.icon className={`h-8 w-8 mx-auto mb-2 ${
                          formData.view === view.id ? "text-amber-400" : "text-muted-foreground"
                        }`} />
                        <p className="text-sm font-medium text-center">{view.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {/* Features */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Características Especiais
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => toggleFeature(feature.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.selectedFeatures.includes(feature.id)
                            ? "border-pink-500 bg-pink-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <feature.icon className={`h-6 w-6 mx-auto mb-2 ${
                          formData.selectedFeatures.includes(feature.id) ? "text-pink-400" : "text-muted-foreground"
                        }`} />
                        <p className="text-xs font-medium text-center">{feature.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <Check className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Quarto Ativo</p>
                          <p className="text-sm text-muted-foreground">Disponível para reservas</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Sparkles className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Quarto Limpo</p>
                          <p className="text-sm text-muted-foreground">Status de limpeza</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isClean}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isClean: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Resumo do Quarto
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-foreground">{formData.number || "-"}</p>
                      <p className="text-xs text-muted-foreground">Número</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-foreground">{formData.floor || "-"}º</p>
                      <p className="text-xs text-muted-foreground">Andar</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <p className="text-lg font-bold text-foreground capitalize">
                        {roomTypes.find(t => t.id === formData.roomType)?.label || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                      <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                        {formData.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Status</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between gap-3 pt-4 border-t border-white/10 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            className="border-white/10"
          >
            {step > 1 ? "Voltar" : "Cancelar"}
          </Button>
          <Button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            {step < 3 ? "Continuar" : "Cadastrar Quarto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}