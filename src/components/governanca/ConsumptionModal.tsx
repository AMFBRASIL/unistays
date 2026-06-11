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
  Wine,
  CheckCircle,
  X,
  Hotel,
  Building,
  TreePine,
  Home,
  MapPin,
  ShoppingCart,
  Minus,
  Plus,
  Beer,
  Coffee,
  Cookie,
  Candy,
  Sandwich,
  Milk,
  Apple,
  Droplets,
  DollarSign,
  Receipt,
  Save,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConsumptionModalProps {
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

const consumptionCategories = [
  {
    id: "drinks",
    label: "Bebidas",
    icon: Wine,
    color: "text-rose-500",
    items: [
      { id: "water-500", name: "Água Mineral 500ml", price: 8.00, icon: Droplets },
      { id: "water-1l", name: "Água Mineral 1L", price: 12.00, icon: Droplets },
      { id: "soda", name: "Refrigerante Lata", price: 10.00, icon: Coffee },
      { id: "juice", name: "Suco Natural", price: 15.00, icon: Apple },
      { id: "beer", name: "Cerveja Long Neck", price: 18.00, icon: Beer },
      { id: "wine-mini", name: "Vinho Mini", price: 35.00, icon: Wine },
      { id: "whisky-mini", name: "Whisky Mini", price: 45.00, icon: Wine },
      { id: "energy", name: "Energético", price: 22.00, icon: Coffee },
    ]
  },
  {
    id: "snacks",
    label: "Snacks",
    icon: Cookie,
    color: "text-amber-500",
    items: [
      { id: "chips", name: "Batata Chips", price: 12.00, icon: Cookie },
      { id: "nuts", name: "Castanhas Mix", price: 18.00, icon: Cookie },
      { id: "chocolate", name: "Chocolate Barra", price: 15.00, icon: Candy },
      { id: "cookies", name: "Cookies Premium", price: 14.00, icon: Cookie },
      { id: "crackers", name: "Biscoito Salgado", price: 10.00, icon: Cookie },
    ]
  },
  {
    id: "food",
    label: "Alimentação",
    icon: Sandwich,
    color: "text-emerald-500",
    items: [
      { id: "sandwich", name: "Sanduíche Natural", price: 25.00, icon: Sandwich },
      { id: "fruit", name: "Salada de Frutas", price: 18.00, icon: Apple },
      { id: "yogurt", name: "Iogurte", price: 12.00, icon: Milk },
      { id: "cereal-bar", name: "Barra de Cereal", price: 8.00, icon: Cookie },
    ]
  }
];

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export function ConsumptionModal({ open, onOpenChange }: ConsumptionModalProps) {
  const [formData, setFormData] = useState({
    property: "",
    room: "",
    notes: "",
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  const selectedProperty = properties.find(p => p.id === formData.property);
  const availableRooms = selectedProperty?.rooms || [];

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmit = () => {
    if (!formData.property || !formData.room) {
      toast.error("Selecione a propriedade e o quarto");
      return;
    }
    if (cart.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    
    toast.success("Consumo registrado com sucesso!");
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFormData({ property: "", room: "", notes: "" });
      setCart([]);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-orange-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-rose-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <ShoppingCart className="h-24 w-24 text-rose-500" />
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-rose-500 to-pink-500">
                <Wine className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Registro de Consumo</span>
                <span className="text-sm font-normal text-rose-600">
                  Frigobar e consumíveis do quarto
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Property & Room Selection */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-pink-500/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Local</Label>
                  <p className="text-xs text-muted-foreground">Selecione o quarto do consumo</p>
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

            {/* Products Grid */}
            {formData.room && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Categories */}
                <div className="lg:col-span-2 space-y-4">
                  {consumptionCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <div key={category.id} className="p-4 rounded-xl border bg-card/50">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn("p-2 rounded-lg bg-muted", category.color)}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold">{category.label}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {category.items.map((item) => {
                            const ItemIcon = item.icon;
                            const inCart = cart.find(c => c.id === item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addToCart(item)}
                                className={cn(
                                  "p-3 rounded-lg border text-left transition-all hover:border-rose-500/50 hover:bg-rose-500/5",
                                  inCart && "border-rose-500 bg-rose-500/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <ItemIcon className={cn("h-4 w-4", category.color)} />
                                  <span className="text-sm font-medium flex-1">{item.name}</span>
                                  {inCart && (
                                    <Badge className="bg-rose-500 text-white">{inCart.quantity}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  R$ {item.price.toFixed(2)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border bg-gradient-to-br from-rose-500/10 to-pink-500/10 sticky top-0">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingCart className="h-5 w-5 text-rose-500" />
                      <h3 className="font-semibold">Itens Consumidos</h3>
                      {totalItems > 0 && (
                        <Badge className="bg-rose-500 ml-auto">{totalItems}</Badge>
                      )}
                    </div>
                    
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum item adicionado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-background">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                R$ {item.price.toFixed(2)} cada
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-3 mt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold text-rose-500">
                              R$ {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações sobre o consumo..."
                      className="bg-background resize-none"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {cart.length > 0 && (
              <div className="p-5 rounded-2xl border-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resumo do Consumo</p>
                    <p className="font-semibold text-lg">
                      {selectedProperty?.name} - Quarto {formData.room}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Badge variant="outline" className="gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {totalItems} itens
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-3xl font-bold text-rose-500">
                      R$ {total.toFixed(2)}
                    </p>
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
            className="min-w-[180px] bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            <Receipt className="h-4 w-4 mr-2" />
            Registrar Consumo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
