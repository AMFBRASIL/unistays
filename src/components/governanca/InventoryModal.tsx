import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Package,
  CheckCircle,
  X,
  Hotel,
  Building,
  TreePine,
  Home,
  MapPin,
  ClipboardCheck,
  AlertTriangle,
  Minus,
  Plus,
  Bath,
  Shirt,
  Coffee,
  Sparkles,
  FileText,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

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

const inventoryCategories = [
  {
    id: "bathroom",
    label: "Banheiro",
    icon: Bath,
    color: "text-cyan-500",
    items: [
      { id: "towel-bath", name: "Toalha de Banho", expected: 2 },
      { id: "towel-face", name: "Toalha de Rosto", expected: 2 },
      { id: "towel-floor", name: "Toalha de Piso", expected: 1 },
      { id: "soap", name: "Sabonete", expected: 2 },
      { id: "shampoo", name: "Shampoo", expected: 1 },
      { id: "conditioner", name: "Condicionador", expected: 1 },
      { id: "toilet-paper", name: "Papel Higiênico", expected: 2 },
    ]
  },
  {
    id: "bedroom",
    label: "Quarto",
    icon: Shirt,
    color: "text-violet-500",
    items: [
      { id: "sheet", name: "Lençol", expected: 1 },
      { id: "duvet", name: "Edredom", expected: 1 },
      { id: "pillow", name: "Travesseiro", expected: 2 },
      { id: "pillowcase", name: "Fronha", expected: 2 },
      { id: "blanket", name: "Cobertor Extra", expected: 1 },
      { id: "bathrobe", name: "Roupão", expected: 2 },
      { id: "slippers", name: "Chinelos", expected: 2 },
    ]
  },
  {
    id: "amenities",
    label: "Amenities",
    icon: Coffee,
    color: "text-amber-500",
    items: [
      { id: "coffee", name: "Café Sachê", expected: 4 },
      { id: "tea", name: "Chá Sachê", expected: 4 },
      { id: "sugar", name: "Açúcar", expected: 4 },
      { id: "sweetener", name: "Adoçante", expected: 2 },
      { id: "water", name: "Água Mineral", expected: 2 },
      { id: "cookies", name: "Biscoitos", expected: 1 },
    ]
  },
  {
    id: "cleaning",
    label: "Limpeza",
    icon: Sparkles,
    color: "text-emerald-500",
    items: [
      { id: "trash-bag", name: "Saco de Lixo", expected: 2 },
      { id: "air-freshener", name: "Odorizador", expected: 1 },
      { id: "tissue", name: "Lenço de Papel", expected: 1 },
    ]
  }
];

export function InventoryModal({ open, onOpenChange }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    property: "",
    room: "",
  });
  const [inventoryCounts, setInventoryCounts] = useState<Record<string, number>>({});
  const [issues, setIssues] = useState<string[]>([]);

  const selectedProperty = properties.find(p => p.id === formData.property);
  const availableRooms = selectedProperty?.rooms || [];

  const updateCount = (itemId: string, delta: number, expected: number) => {
    const current = inventoryCounts[itemId] ?? expected;
    const newValue = Math.max(0, current + delta);
    setInventoryCounts(prev => ({ ...prev, [itemId]: newValue }));
  };

  const toggleIssue = (itemId: string) => {
    setIssues(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemStatus = (itemId: string, expected: number) => {
    const count = inventoryCounts[itemId] ?? expected;
    if (count === expected) return "ok";
    if (count < expected) return "missing";
    return "extra";
  };

  const totalItems = inventoryCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = Object.keys(inventoryCounts).length;
  const issuesCount = issues.length + 
    Object.entries(inventoryCounts).filter(([id, count]) => {
      const item = inventoryCategories.flatMap(c => c.items).find(i => i.id === id);
      return item && count !== item.expected;
    }).length;

  const handleSubmit = () => {
    if (!formData.property || !formData.room) {
      toast.error("Selecione a propriedade e o quarto");
      return;
    }
    
    toast.success("Inventário registrado com sucesso!");
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFormData({ property: "", room: "" });
      setInventoryCounts({});
      setIssues([]);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-teal-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <ClipboardCheck className="h-24 w-24 text-teal-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Checklist de Inventário</span>
                <span className="text-sm font-normal text-teal-600">
                  Verificação de itens e amenities do quarto
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Property & Room Selection */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Local</Label>
                  <p className="text-xs text-muted-foreground">Selecione o quarto para inventário</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select value={formData.property} onValueChange={(v) => setFormData({ ...formData, property: v, room: "" })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Propriedade" />
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
                
                <Select value={formData.room} onValueChange={(v) => setFormData({ ...formData, room: v })} disabled={!formData.property}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Quarto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>Quarto {room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Inventory Categories */}
            {formData.room && (
              <div className="space-y-4">
                {inventoryCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="p-4 rounded-xl border bg-card/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-lg bg-muted", category.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">{category.label}</h3>
                        <Badge variant="outline" className="ml-auto">
                          {category.items.length} itens
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {category.items.map((item) => {
                          const count = inventoryCounts[item.id] ?? item.expected;
                          const status = getItemStatus(item.id, item.expected);
                          const hasIssue = issues.includes(item.id);
                          
                          return (
                            <div 
                              key={item.id}
                              className={cn(
                                "flex items-center gap-4 p-3 rounded-lg transition-colors",
                                status === "missing" && "bg-red-500/10",
                                status === "extra" && "bg-amber-500/10",
                                hasIssue && "bg-orange-500/10"
                              )}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Esperado: {item.expected}
                                </p>
                              </div>
                              
                              {/* Counter */}
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCount(item.id, -1, item.expected)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className={cn(
                                  "w-8 text-center font-bold",
                                  status === "missing" && "text-red-500",
                                  status === "extra" && "text-amber-500"
                                )}>
                                  {count}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateCount(item.id, 1, item.expected)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Issue Flag */}
                              <Button
                                type="button"
                                variant={hasIssue ? "destructive" : "ghost"}
                                size="sm"
                                onClick={() => toggleIssue(item.id)}
                                className="gap-1"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                {hasIssue ? "Problema" : "Reportar"}
                              </Button>
                              
                              {/* Status */}
                              {status === "ok" && !hasIssue && (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {formData.room && (
              <div className="p-5 rounded-2xl border-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resumo do Inventário</p>
                    <p className="font-semibold text-lg">
                      {selectedProperty?.name} - Quarto {formData.room}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <Badge variant="outline" className="gap-1">
                        <Package className="h-3 w-3" />
                        {totalItems} itens
                      </Badge>
                      {issuesCount > 0 && (
                        <Badge className="gap-1 bg-red-500/20 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {issuesCount} problemas
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl",
                    issuesCount === 0 ? "bg-emerald-500/20" : "bg-amber-500/20"
                  )}>
                    {issuesCount === 0 ? (
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                    )}
                  </div>
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
            className="min-w-[180px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Inventário
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
