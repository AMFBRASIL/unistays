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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  BedDouble,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  UtensilsCrossed,
  Wine,
  Sparkles,
  Package,
  Check,
  Building2,
  Home,
  Warehouse,
  Palmtree,
  Store,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Property types for hybrid system
const propertyTypes = [
  { id: "hotel", name: "Hotel", icon: Building2, color: "from-blue-500 to-cyan-500", description: "Diárias tradicionais" },
  { id: "apart-hotel", name: "Apart-Hotel", icon: Home, color: "from-purple-500 to-pink-500", description: "Diária, semanal ou mensal" },
  { id: "loft", name: "Loft", icon: Warehouse, color: "from-amber-500 to-orange-500", description: "Estadias flexíveis" },
  { id: "temporada", name: "Temporada", icon: Palmtree, color: "from-emerald-500 to-green-500", description: "Aluguel por temporada" },
];

// Terminals by property type
const terminalsByProperty: Record<string, { id: string; name: string; type: string }[]> = {
  hotel: [
    { id: "1", name: "Restaurante Principal", type: "restaurant" },
    { id: "2", name: "Bar da Piscina", type: "bar" },
    { id: "3", name: "Spa & Wellness", type: "spa" },
    { id: "4", name: "Loja de Conveniência", type: "shop" },
  ],
  "apart-hotel": [
    { id: "5", name: "Café Bistrô", type: "restaurant" },
    { id: "6", name: "Coworking Café", type: "shop" },
    { id: "7", name: "Rooftop Bar", type: "bar" },
  ],
  loft: [
    { id: "8", name: "Café Loft", type: "restaurant" },
    { id: "9", name: "Mini Market", type: "shop" },
  ],
  temporada: [
    { id: "10", name: "Beach Bar", type: "bar" },
    { id: "11", name: "Loja de Praia", type: "shop" },
  ],
};

// Rooms/units by property type
const roomsByProperty: Record<string, { id: string; number: string; guest: string; category: string }[]> = {
  hotel: [
    { id: "1", number: "101", guest: "Maria Santos", category: "Standard" },
    { id: "2", number: "205", guest: "Carlos Oliveira", category: "Luxo" },
    { id: "3", number: "312", guest: "Ana Rodrigues", category: "Suíte Master" },
    { id: "4", number: "501", guest: "Pedro Lima", category: "Presidencial" },
  ],
  "apart-hotel": [
    { id: "5", number: "A-101", guest: "Lucia Ferreira", category: "Studio" },
    { id: "6", number: "A-205", guest: "Roberto Alves", category: "1 Quarto" },
    { id: "7", number: "A-308", guest: "Fernanda Costa", category: "2 Quartos" },
  ],
  loft: [
    { id: "8", number: "L-01", guest: "Bruno Mendes", category: "Loft Compacto" },
    { id: "9", number: "L-05", guest: "Juliana Pires", category: "Loft Premium" },
    { id: "10", number: "L-12", guest: "Ricardo Souza", category: "Loft Duplex" },
  ],
  temporada: [
    { id: "11", number: "T-01", guest: "Amanda Silva", category: "Casa 2 Quartos" },
    { id: "12", number: "T-05", guest: "Marcelo Dias", category: "Casa 3 Quartos" },
    { id: "13", number: "T-08", guest: "Patricia Rocha", category: "Villa" },
  ],
};

const products: Product[] = [
  { id: "1", name: "Filé Mignon", price: 89.90, category: "restaurant" },
  { id: "2", name: "Salmão Grelhado", price: 78.00, category: "restaurant" },
  { id: "3", name: "Risoto de Camarão", price: 65.00, category: "restaurant" },
  { id: "4", name: "Caipirinha", price: 28.00, category: "bar" },
  { id: "5", name: "Gin Tônica", price: 35.00, category: "bar" },
  { id: "6", name: "Cerveja Artesanal", price: 22.00, category: "bar" },
  { id: "7", name: "Massagem Relaxante", price: 280.00, category: "spa" },
  { id: "8", name: "Aromaterapia", price: 80.00, category: "spa" },
  { id: "9", name: "Day Spa Completo", price: 450.00, category: "spa" },
  { id: "10", name: "Água Mineral", price: 8.00, category: "shop" },
  { id: "11", name: "Snacks", price: 15.00, category: "shop" },
  { id: "12", name: "Souvenir", price: 45.00, category: "shop" },
];

const categoryConfig = {
  restaurant: { icon: UtensilsCrossed, label: "Restaurante", color: "from-orange-500 to-red-500" },
  bar: { icon: Wine, label: "Bar", color: "from-purple-500 to-pink-500" },
  spa: { icon: Sparkles, label: "Spa", color: "from-cyan-500 to-blue-500" },
  shop: { icon: Package, label: "Loja", color: "from-emerald-500 to-green-500" },
};

export function NewSaleModal({ open, onOpenChange }: NewSaleModalProps) {
  const [step, setStep] = useState<"property" | "terminal" | "products" | "payment" | "success">("property");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");
  const [selectedTerminal, setSelectedTerminal] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const availableTerminals = selectedPropertyType ? terminalsByProperty[selectedPropertyType] || [] : [];
  const availableRooms = selectedPropertyType ? roomsByProperty[selectedPropertyType] || [] : [];
  const selectedRoomData = availableRooms.find(r => r.id === selectedRoom);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleFinishSale = () => {
    setStep("success");
  };

  const handleClose = () => {
    setStep("property");
    setSelectedPropertyType("");
    setSelectedTerminal("");
    setCart([]);
    setSelectedRoom("");
    setPaymentMethod("");
    setSearchQuery("");
    setSelectedCategory("all");
    onOpenChange(false);
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyType(propertyId);
    setSelectedTerminal("");
    setSelectedRoom("");
    setStep("terminal");
  };

  const handleSelectTerminal = (terminalId: string) => {
    setSelectedTerminal(terminalId);
    setStep("products");
  };

  const selectedProperty = propertyTypes.find(p => p.id === selectedPropertyType);
  const selectedTerminalData = availableTerminals.find(t => t.id === selectedTerminal);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-0">
          <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white">Nova Venda</DialogTitle>
                <p className="text-white/80 text-sm">
                  {step === "property" && "Selecione o tipo de propriedade"}
                  {step === "terminal" && `${selectedProperty?.name} • Selecione o terminal`}
                  {step === "products" && `${selectedProperty?.name} • ${selectedTerminalData?.name}`}
                  {step === "payment" && "Finalize o pagamento"}
                  {step === "success" && "Venda concluída"}
                </p>
              </div>
              {/* Breadcrumb */}
              {step !== "property" && step !== "success" && (
                <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
                  <span 
                    className="cursor-pointer hover:text-white"
                    onClick={() => setStep("property")}
                  >
                    Propriedade
                  </span>
                  <ChevronRight className="w-4 h-4" />
                  <span 
                    className={cn(
                      step === "terminal" ? "text-white" : "cursor-pointer hover:text-white"
                    )}
                    onClick={() => step !== "terminal" && setStep("terminal")}
                  >
                    Terminal
                  </span>
                  {(step === "products" || step === "payment") && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span 
                        className={cn(
                          step === "products" ? "text-white" : "cursor-pointer hover:text-white"
                        )}
                        onClick={() => step !== "products" && setStep("products")}
                      >
                        Produtos
                      </span>
                    </>
                  )}
                  {step === "payment" && (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-white">Pagamento</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Property Selection */}
        {step === "property" && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Selecione o Tipo de Propriedade</h3>
              <p className="text-muted-foreground text-sm">Escolha onde a venda será realizada</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyTypes.map((property) => (
                <div
                  key={property.id}
                  onClick={() => handleSelectProperty(property.id)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                    "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110",
                      property.color
                    )}>
                      <property.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{property.name}</h4>
                      <p className="text-sm text-muted-foreground">{property.description}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {(terminalsByProperty[property.id] || []).length} terminais
                        </Badge>
                        <Badge variant="outline" className="text-xs ml-2">
                          {(roomsByProperty[property.id] || []).length} unidades ocupadas
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Terminal Selection */}
        {step === "terminal" && (
          <div className="p-6">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => setStep("property")}>
                ← Voltar
              </Button>
              <h3 className="font-semibold text-lg mb-2">Selecione o Terminal</h3>
              <p className="text-muted-foreground text-sm">
                Terminais disponíveis em {selectedProperty?.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTerminals.map((terminal) => {
                const config = categoryConfig[terminal.type as keyof typeof categoryConfig];
                return (
                  <div
                    key={terminal.id}
                    onClick={() => handleSelectTerminal(terminal.id)}
                    className={cn(
                      "relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group",
                      "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                      config.color
                    )}>
                      <config.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-1">{terminal.name}</h4>
                    <Badge variant="outline" className="text-xs">{config.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Products */}
        {step === "products" && (
          <div className="flex flex-col lg:flex-row h-[600px]">
            {/* Products Section */}
            <div className="flex-1 p-6 border-r border-border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setStep("terminal")}>
                    ← Voltar
                  </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Todos
                  </Button>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className="gap-1.5"
                    >
                      <config.icon className="w-3.5 h-3.5" />
                      {config.label}
                    </Button>
                  ))}
                </div>

                {/* Products Grid */}
                <ScrollArea className="h-[380px]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-4">
                    {filteredProducts.map((product) => {
                      const config = categoryConfig[product.category as keyof typeof categoryConfig];
                      const inCart = cart.find((item) => item.id === product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className={cn(
                            "relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                            inCart ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          {inCart && (
                            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center">
                              {inCart.quantity}
                            </Badge>
                          )}
                          <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3", config.color)}>
                            <config.icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-medium text-sm mb-1 line-clamp-1">{product.name}</p>
                          <p className="text-primary font-bold">
                            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-full lg:w-[380px] flex flex-col bg-muted/30">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Carrinho ({cart.length} itens)
                </h3>
              </div>

              <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos para começar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{item.name}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-bold text-primary">
                            R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Customer Info */}
              <div className="p-4 border-t border-border space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    <BedDouble className="w-3 h-3" /> Unidade / Hóspede
                  </Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{room.number}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{room.guest}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRoomData && (
                  <div className="bg-primary/5 rounded-lg p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">{selectedRoomData.guest}</span>
                    </div>
                    <div className="text-muted-foreground mt-1">{selectedRoomData.category}</div>
                  </div>
                )}
              </div>

              {/* Total and Actions */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  disabled={cart.length === 0}
                  onClick={() => setStep("payment")}
                >
                  <CreditCard className="w-4 h-4" />
                  Ir para Pagamento
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === "payment" && (
          <div className="p-6 space-y-6">
            {/* Property and Terminal Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              {selectedProperty && (
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", selectedProperty.color)}>
                  <selectedProperty.icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{selectedProperty?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedTerminalData?.name}</p>
              </div>
              {selectedRoomData && (
                <div className="text-right">
                  <p className="font-medium">{selectedRoomData.number}</p>
                  <p className="text-sm text-muted-foreground">{selectedRoomData.guest}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Resumo do Pedido
              </h3>
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Forma de Pagamento</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "room", label: "Conta da Unidade", icon: BedDouble, color: "from-blue-500 to-cyan-500" },
                  { id: "card", label: "Cartão", icon: CreditCard, color: "from-purple-500 to-pink-500" },
                  { id: "cash", label: "Dinheiro", icon: Banknote, color: "from-emerald-500 to-green-500" },
                  { id: "pix", label: "PIX", icon: QrCode, color: "from-amber-500 to-orange-500" },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "relative p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {paymentMethod === method.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-2", method.color)}>
                      <method.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-sm">{method.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep("products")}>
                Voltar
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                disabled={!paymentMethod}
                onClick={handleFinishSale}
              >
                <Check className="w-4 h-4" />
                Finalizar Venda
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Venda Realizada!</h2>
            <p className="text-muted-foreground mb-6">Transação concluída com sucesso</p>
            
            <div className="bg-muted/50 rounded-xl p-4 mb-6 max-w-sm mx-auto text-left">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocolo</span>
                  <span className="font-mono font-bold">PDV-{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Propriedade</span>
                  <span className="font-medium">{selectedProperty?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Terminal</span>
                  <span className="font-medium">{selectedTerminalData?.name}</span>
                </div>
                {selectedRoomData && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidade</span>
                    <span className="font-medium">{selectedRoomData.number} - {selectedRoomData.guest}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium capitalize">{paymentMethod === "room" ? "Conta da Unidade" : paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-600"
                onClick={() => {
                  setStep("property");
                  setSelectedPropertyType("");
                  setSelectedTerminal("");
                  setCart([]);
                  setSelectedRoom("");
                  setPaymentMethod("");
                }}
              >
                <Plus className="w-4 h-4" />
                Nova Venda
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
