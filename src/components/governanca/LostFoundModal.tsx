import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search,
  CheckCircle,
  X,
  Hotel,
  Building,
  TreePine,
  Home,
  MapPin,
  Package,
  Camera,
  Clock,
  User,
  FileText,
  Save,
  Glasses,
  Watch,
  Wallet,
  Key,
  Smartphone,
  Shirt,
  Briefcase,
  Headphones,
  BookOpen,
  Gift,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LostFoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type ItemStatus = "found" | "lost" | "returned" | "claimed";

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building, color: "text-purple-500" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500" },
  temporada: { label: "Temporada", icon: TreePine, color: "text-emerald-500" }
};

const properties = [
  { id: "hotel-central", name: "Hotel Central", type: "hotel" as PropertyType, rooms: ["101", "102", "103", "201", "202", "301"] },
  { id: "apart-business", name: "Apart Business Center", type: "apart-hotel" as PropertyType, rooms: ["A101", "A102", "A201", "A202"] },
  { id: "loft-urban", name: "Loft Urban Studio", type: "loft" as PropertyType, rooms: ["L01", "L02", "L03", "L04"] },
];

const itemCategories = [
  { id: "electronics", label: "Eletrônicos", icon: Smartphone, color: "text-blue-500" },
  { id: "accessories", label: "Acessórios", icon: Watch, color: "text-amber-500" },
  { id: "documents", label: "Documentos", icon: FileText, color: "text-red-500" },
  { id: "clothing", label: "Vestuário", icon: Shirt, color: "text-violet-500" },
  { id: "valuables", label: "Valores", icon: Wallet, color: "text-emerald-500" },
  { id: "keys", label: "Chaves", icon: Key, color: "text-orange-500" },
  { id: "bags", label: "Bolsas/Malas", icon: Briefcase, color: "text-cyan-500" },
  { id: "books", label: "Livros/Revistas", icon: BookOpen, color: "text-pink-500" },
  { id: "other", label: "Outros", icon: Gift, color: "text-slate-500" },
];

const statusConfig: Record<ItemStatus, { label: string; color: string; bgColor: string }> = {
  found: { label: "Encontrado", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  lost: { label: "Perdido", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  returned: { label: "Devolvido", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  claimed: { label: "Reivindicado", color: "text-violet-500", bgColor: "bg-violet-500/10" },
};

const locations = [
  "Quarto",
  "Lobby",
  "Restaurante",
  "Piscina",
  "Academia",
  "Estacionamento",
  "Área de Eventos",
  "Spa",
  "Lavanderia",
  "Outro"
];

export function LostFoundModal({ open, onOpenChange }: LostFoundModalProps) {
  const [formData, setFormData] = useState({
    type: "found" as "found" | "lost",
    property: "",
    room: "",
    location: "",
    category: "",
    itemName: "",
    description: "",
    foundBy: "",
    guestName: "",
    guestContact: "",
    notes: "",
  });

  const selectedProperty = properties.find(p => p.id === formData.property);
  const availableRooms = selectedProperty?.rooms || [];
  const selectedCategory = itemCategories.find(c => c.id === formData.category);

  const handleSubmit = () => {
    if (!formData.property || !formData.category || !formData.itemName) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    
    const message = formData.type === "found" 
      ? "Item encontrado registrado com sucesso!"
      : "Registro de item perdido criado!";
    toast.success(message);
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFormData({
        type: "found",
        property: "",
        room: "",
        location: "",
        category: "",
        itemName: "",
        description: "",
        foundBy: "",
        guestName: "",
        guestContact: "",
        notes: "",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className={cn(
          "relative px-6 py-5 border-b bg-gradient-to-r",
          formData.type === "found" 
            ? "from-emerald-500/10 via-teal-500/10 to-cyan-500/10"
            : "from-amber-500/10 via-orange-500/10 to-red-500/10"
        )}>
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className={cn(
              "w-full h-full",
              formData.type === "found" ? "text-emerald-500" : "text-amber-500"
            )}>
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            {formData.type === "found" ? (
              <Package className="h-24 w-24 text-emerald-500" />
            ) : (
              <Search className="h-24 w-24 text-amber-500" />
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={cn(
                "p-3 rounded-2xl shadow-lg bg-gradient-to-br",
                formData.type === "found" 
                  ? "from-emerald-500 to-teal-500"
                  : "from-amber-500 to-orange-500"
              )}>
                {formData.type === "found" ? (
                  <Package className="h-6 w-6 text-white" />
                ) : (
                  <Search className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <span className="block">Achados e Perdidos</span>
                <span className={cn(
                  "text-sm font-normal",
                  formData.type === "found" ? "text-emerald-600" : "text-amber-600"
                )}>
                  {formData.type === "found" 
                    ? "Registrar item encontrado" 
                    : "Registrar item perdido por hóspede"}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "found" })}
                className={cn(
                  "relative p-5 rounded-2xl border-2 transition-all overflow-hidden group",
                  formData.type === "found"
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-lg"
                    : "border-border/50 hover:border-emerald-500/50"
                )}
              >
                <div className="absolute -right-4 -top-4 opacity-20">
                  <Package className={cn(
                    "h-20 w-20",
                    formData.type === "found" ? "text-emerald-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="relative flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    formData.type === "found" 
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500" 
                      : "bg-muted"
                  )}>
                    <Package className={cn(
                      "h-6 w-6",
                      formData.type === "found" ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-semibold text-lg",
                      formData.type === "found" && "text-emerald-600"
                    )}>Item Encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      Registrar item encontrado no hotel
                    </p>
                  </div>
                </div>
                {formData.type === "found" && (
                  <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-emerald-500" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "lost" })}
                className={cn(
                  "relative p-5 rounded-2xl border-2 transition-all overflow-hidden group",
                  formData.type === "lost"
                    ? "border-amber-500 bg-gradient-to-br from-amber-500/10 to-orange-500/10 shadow-lg"
                    : "border-border/50 hover:border-amber-500/50"
                )}
              >
                <div className="absolute -right-4 -top-4 opacity-20">
                  <Search className={cn(
                    "h-20 w-20",
                    formData.type === "lost" ? "text-amber-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="relative flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    formData.type === "lost" 
                      ? "bg-gradient-to-br from-amber-500 to-orange-500" 
                      : "bg-muted"
                  )}>
                    <Search className={cn(
                      "h-6 w-6",
                      formData.type === "lost" ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-semibold text-lg",
                      formData.type === "lost" && "text-amber-600"
                    )}>Item Perdido</p>
                    <p className="text-sm text-muted-foreground">
                      Hóspede reportou perda de item
                    </p>
                  </div>
                </div>
                {formData.type === "lost" && (
                  <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-amber-500" />
                )}
              </button>
            </div>

            {/* Location Selection */}
            <div className={cn(
              "p-5 rounded-2xl border bg-gradient-to-r",
              formData.type === "found" 
                ? "from-emerald-500/5 to-teal-500/5"
                : "from-amber-500/5 to-orange-500/5"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  formData.type === "found" 
                    ? "from-emerald-500 to-teal-500"
                    : "from-amber-500 to-orange-500"
                )}>
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Localização</Label>
                  <p className="text-xs text-muted-foreground">
                    Onde o item foi {formData.type === "found" ? "encontrado" : "perdido"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Select value={formData.property} onValueChange={(v) => setFormData({ ...formData, property: v, room: "" })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Propriedade *" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((prop) => {
                      const config = propertyTypeConfig[prop.type];
                      const Icon = config.icon;
                      return (
                        <SelectItem key={prop.id} value={prop.id}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", config.color)} />
                            <span>{prop.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Local" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={formData.room} onValueChange={(v) => setFormData({ ...formData, room: v })} disabled={!formData.property}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Quarto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>Quarto {room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  formData.type === "found" 
                    ? "from-emerald-500 to-teal-500"
                    : "from-amber-500 to-orange-500"
                )}>
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Categoria do Item *</Label>
                  <p className="text-xs text-muted-foreground">Selecione o tipo de item</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {itemCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        isSelected
                          ? formData.type === "found"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-amber-500 bg-amber-500/10"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-1",
                        isSelected ? "bg-white/50" : "bg-muted"
                      )}>
                        <Icon className={cn("h-5 w-5", cat.color)} />
                      </div>
                      <p className="text-xs font-medium">{cat.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Item *</Label>
                <Input
                  placeholder="Ex: iPhone 14, Carteira de couro..."
                  className="bg-background"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{formData.type === "found" ? "Encontrado por" : "Reportado por"}</Label>
                <Input
                  placeholder="Nome do colaborador ou hóspede"
                  className="bg-background"
                  value={formData.foundBy}
                  onChange={(e) => setFormData({ ...formData, foundBy: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição do Item</Label>
              <Textarea
                placeholder="Descreva o item em detalhes (cor, marca, condição, identificadores únicos...)"
                className="bg-background resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Guest Contact (for lost items) */}
            {formData.type === "lost" && (
              <div className="p-4 rounded-xl border bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-amber-500" />
                  <Label className="font-semibold">Dados do Hóspede</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Hóspede</Label>
                    <Input
                      placeholder="Nome completo"
                      className="bg-background"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Input
                      placeholder="Telefone ou email"
                      className="bg-background"
                      value={formData.guestContact}
                      onChange={(e) => setFormData({ ...formData, guestContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações Adicionais</Label>
              <Textarea
                placeholder="Informações adicionais relevantes..."
                className="bg-background resize-none"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Summary */}
            {formData.category && formData.itemName && (
              <div className={cn(
                "p-5 rounded-2xl border-2 relative overflow-hidden bg-gradient-to-r",
                formData.type === "found"
                  ? "from-emerald-500/10 to-teal-500/10"
                  : "from-amber-500/10 to-orange-500/10"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br",
                    formData.type === "found"
                      ? "from-emerald-500 to-teal-500"
                      : "from-amber-500 to-orange-500"
                  )}>
                    {selectedCategory && <selectedCategory.icon className="h-7 w-7 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {formData.type === "found" ? "Item Encontrado" : "Item Perdido"}
                    </p>
                    <p className="font-semibold text-lg">{formData.itemName}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedProperty?.name}
                      </Badge>
                      {formData.location && (
                        <Badge variant="outline">{formData.location}</Badge>
                      )}
                      {formData.room && (
                        <Badge variant="outline">Quarto {formData.room}</Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-3 py-1.5",
                    formData.type === "found"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-amber-500/20 text-amber-500"
                  )}>
                    {formData.type === "found" ? "Encontrado" : "Perdido"}
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
            className={cn(
              "min-w-[180px] bg-gradient-to-r",
              formData.type === "found"
                ? "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                : "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            Registrar Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
