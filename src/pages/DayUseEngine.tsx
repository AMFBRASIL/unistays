import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays, 
  Users, 
  CreditCard, 
  Check, 
  Waves,
  Sun,
  Umbrella,
  Utensils,
  Car,
  Wifi,
  Sparkles,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Shield,
  Printer,
  Download,
  QrCode,
  Layers
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import dayuseBanner from "@/assets/dayuse-banner.jpg";

const dayUsePackages = [
  {
    id: 1,
    name: "Day Use Básico",
    description: "Acesso à piscina e áreas comuns",
    price: 89,
    originalPrice: 120,
    duration: "8h às 18h",
    includes: ["Piscina", "Espreguiçadeiras", "Wi-Fi", "Vestiários"],
    popular: false
  },
  {
    id: 2,
    name: "Day Use Premium",
    description: "Experiência completa com almoço incluso",
    price: 159,
    originalPrice: 200,
    duration: "8h às 20h",
    includes: ["Piscina", "Almoço Buffet", "Toalhas", "Wi-Fi", "Estacionamento", "Drinks Welcome"],
    popular: true
  },
  {
    id: 3,
    name: "Day Use VIP",
    description: "Área exclusiva com serviço personalizado",
    price: 249,
    originalPrice: 300,
    duration: "8h às 22h",
    includes: ["Área VIP", "Almoço + Jantar", "Open Bar", "Spa", "Cabana Privativa", "Concierge"],
    popular: false
  },
  {
    id: 4,
    name: "Day Use Família",
    description: "Pacote especial para até 4 pessoas",
    price: 299,
    originalPrice: 400,
    duration: "8h às 18h",
    includes: ["Piscina", "Kids Club", "Almoço Família", "Estacionamento", "Wi-Fi"],
    popular: false,
    capacity: 4
  }
];

export default function DayUseEngine() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [selectedPackage, setSelectedPackage] = useState<typeof dayUsePackages[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: ""
  });
  const [bookingCode, setBookingCode] = useState("");

  const total = selectedPackage ? selectedPackage.price * parseInt(guests) : 0;
  const discount = paymentMethod === "pix" ? total * 0.05 : 0;
  const finalTotal = total - discount;

  const handleSelectPackage = (pkg: typeof dayUsePackages[0]) => {
    setSelectedPackage(pkg);
    setStep(2);
  };

  const handleConfirmBooking = () => {
    const code = `DU-${Date.now().toString().slice(-8)}`;
    setBookingCode(code);
    toast({
      title: "Reserva Confirmada! 🏖️",
      description: "Seu voucher foi gerado com sucesso.",
    });
    setStep(4);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Uni | Stays</h1>
                <p className="text-xs text-sky-600">Day Use • Seu dia de lazer</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-slate-600 text-sm">
              <a href="#" className="hover:text-sky-600 transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" />
                (11) 99999-9999
              </a>
              <a href="#" className="hover:text-sky-600 transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                dayuse@hotel.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {step === 1 && (
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img 
            src={dayuseBanner} 
            alt="Day Use Pool" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-50 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Badge className="bg-white/90 text-sky-600 border-sky-200 mb-4 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Promoção de Verão
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Um Dia de <span className="text-sky-300">Lazer</span> Perfeito
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Desfrute de nossas piscinas e áreas de lazer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {[
              { num: 1, label: "Pacote", icon: Sun },
              { num: 2, label: "Dados", icon: Users },
              { num: 3, label: "Pagamento", icon: CreditCard },
              { num: 4, label: "Voucher", icon: QrCode }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
                  step >= s.num 
                    ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-md" 
                    : "bg-sky-100 text-sky-600"
                )}>
                  <s.icon className="h-4 w-4" />
                  <span className="hidden md:inline text-sm font-medium">{s.label}</span>
                </div>
                {idx < 3 && (
                  <div className={cn(
                    "w-8 md:w-16 h-0.5 mx-2",
                    step > s.num ? "bg-sky-500" : "bg-sky-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: Select Package */}
        {step === 1 && (
          <div className="space-y-8">
            {/* Date Selection */}
            <Card className="bg-white border-sky-100 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Data do Day Use</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start bg-sky-50 border-sky-200 text-slate-700 hover:bg-sky-100">
                          <CalendarDays className="mr-2 h-4 w-4 text-sky-500" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-sky-200">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Quantidade de Pessoas</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="bg-sky-50 border-sky-200 text-slate-700">
                        <Users className="mr-2 h-4 w-4 text-blue-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-sky-200">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <SelectItem key={n} value={n.toString()} className="hover:bg-sky-50">
                            {n} {n === 1 ? "Pessoa" : "Pessoas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md">
                      Ver Pacotes Disponíveis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dayUsePackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={cn(
                    "bg-white border-sky-100 shadow-sm overflow-hidden relative group hover:shadow-lg hover:border-sky-300 transition-all duration-300",
                    pkg.popular && "ring-2 ring-sky-500"
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Mais Vendido
                    </div>
                  )}
                  <CardContent className="p-5 space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        {pkg.id === 1 && <Waves className="h-8 w-8 text-sky-500" />}
                        {pkg.id === 2 && <Utensils className="h-8 w-8 text-sky-500" />}
                        {pkg.id === 3 && <Sparkles className="h-8 w-8 text-sky-500" />}
                        {pkg.id === 4 && <Users className="h-8 w-8 text-sky-500" />}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{pkg.name}</h3>
                      <p className="text-sm text-slate-500">{pkg.description}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sky-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{pkg.duration}</span>
                    </div>

                    <div className="space-y-2">
                      {pkg.includes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <Check className="h-4 w-4 text-sky-500" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-4 border-t border-sky-100">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl font-bold text-slate-800">R$ {pkg.price}</span>
                        <span className="text-sm text-sky-500 line-through">R$ {pkg.originalPrice}</span>
                      </div>
                      <span className="text-xs text-slate-500">por pessoa</span>
                    </div>

                    <Button 
                      onClick={() => handleSelectPackage(pkg)}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md"
                      disabled={!selectedDate}
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Waves, label: "2 Piscinas", desc: "Adulto e Infantil" },
                { icon: Utensils, label: "Restaurante", desc: "Culinária Premium" },
                { icon: Car, label: "Estacionamento", desc: "Gratuito" },
                { icon: Wifi, label: "Wi-Fi", desc: "Alta Velocidade" }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white border border-sky-100 rounded-xl p-4 text-center shadow-sm">
                  <feature.icon className="h-8 w-8 mx-auto mb-2 text-sky-500" />
                  <p className="font-medium text-slate-800">{feature.label}</p>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Guest Information */}
        {step === 2 && selectedPackage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border-sky-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <Users className="h-5 w-5 text-sky-500" />
                    Dados do Responsável
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Nome Completo *</Label>
                      <Input 
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                        className="bg-sky-50 border-sky-200 text-slate-800"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">CPF *</Label>
                      <Input 
                        value={guestInfo.cpf}
                        onChange={(e) => setGuestInfo({...guestInfo, cpf: e.target.value})}
                        className="bg-sky-50 border-sky-200 text-slate-800"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">E-mail *</Label>
                      <Input 
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        className="bg-sky-50 border-sky-200 text-slate-800"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Telefone *</Label>
                      <Input 
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                        className="bg-sky-50 border-sky-200 text-slate-800"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="border-sky-200 text-sky-600 hover:bg-sky-50">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md"
                  disabled={!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.cpf}
                >
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <Card className="bg-white border-sky-100 shadow-sm sticky top-32">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg">
                    <h4 className="font-semibold text-slate-800">{selectedPackage.name}</h4>
                    <p className="text-sm text-sky-600">{selectedPackage.duration}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Data</span>
                      <span className="text-slate-800 font-medium">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Pessoas</span>
                      <span className="text-slate-800 font-medium">{guests}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{guests}x R$ {selectedPackage.price}</span>
                      <span className="text-slate-800 font-medium">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-sky-100 pt-4">
                    <div className="flex justify-between text-lg font-bold text-slate-800">
                      <span>Total</span>
                      <span className="text-sky-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && selectedPackage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border-sky-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-sky-500" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "pix", label: "PIX", desc: "5% de desconto", icon: "💳" },
                      { id: "credit", label: "Cartão de Crédito", desc: "Até 6x", icon: "💳" },
                      { id: "debit", label: "Cartão de Débito", desc: "À vista", icon: "💳" }
                    ].map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all",
                          paymentMethod === method.id
                            ? "border-sky-500 bg-sky-50"
                            : "border-sky-100 bg-white hover:border-sky-200"
                        )}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <h4 className="font-medium text-slate-800">{method.label}</h4>
                        <p className="text-xs text-sky-600">{method.desc}</p>
                      </div>
                    ))}
                  </div>

                  {paymentMethod === "pix" && (
                    <div className="bg-sky-50 p-6 rounded-xl text-center space-y-4">
                      <div className="bg-white p-4 rounded-lg inline-block shadow-inner">
                        <QRCodeSVG 
                          value={`00020126580014BR.GOV.BCB.PIX0136${crypto.randomUUID()}5204000053039865802BR5925UNI STAYS HOTELARIA LTDA6009SAO PAULO62070503***6304`}
                          size={128}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-slate-600">Escaneie o QR Code ou copie o código PIX</p>
                      <Button 
                        variant="outline" 
                        className="border-sky-500 text-sky-600 hover:bg-sky-100"
                        onClick={() => {
                          navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136abc123-def456-ghi789");
                          toast({ title: "Código PIX copiado!" });
                        }}
                      >
                        Copiar Código PIX
                      </Button>
                    </div>
                  )}

                  {paymentMethod === "credit" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-700">Número do Cartão</Label>
                          <Input className="bg-sky-50 border-sky-200 text-slate-800" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">Validade</Label>
                          <Input className="bg-sky-50 border-sky-200 text-slate-800" placeholder="MM/AA" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">CVV</Label>
                          <Input className="bg-sky-50 border-sky-200 text-slate-800" placeholder="123" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-700">Nome no Cartão</Label>
                          <Input className="bg-sky-50 border-sky-200 text-slate-800" placeholder="NOME COMO NO CARTÃO" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-700">Parcelas</Label>
                          <Select defaultValue="1">
                            <SelectTrigger className="bg-sky-50 border-sky-200 text-slate-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-sky-200">
                              {[1, 2, 3, 6].map(n => (
                                <SelectItem key={n} value={n.toString()} className="hover:bg-sky-50">
                                  {n}x de R$ {(total / n).toFixed(2)} {n === 1 ? "à vista" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                <Shield className="h-6 w-6 text-sky-500" />
                <div>
                  <p className="text-slate-800 font-medium">Pagamento 100% Seguro</p>
                  <p className="text-sm text-slate-600">Seus dados são protegidos com criptografia</p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="border-sky-200 text-sky-600 hover:bg-sky-50">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleConfirmBooking}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md"
                  disabled={!paymentMethod}
                >
                  Confirmar e Gerar Voucher
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <Card className="bg-white border-sky-100 shadow-sm sticky top-32">
                <CardHeader>
                  <CardTitle className="text-slate-800 text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold text-slate-800">{selectedPackage.name}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Data</span>
                      <span className="text-slate-800 font-medium">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{guests}x R$ {selectedPackage.price}</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    {paymentMethod === "pix" && (
                      <div className="flex justify-between text-sky-600">
                        <span>Desconto PIX (5%)</span>
                        <span>- R$ {discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-sky-100 pt-4">
                    <div className="flex justify-between text-lg font-bold text-slate-800">
                      <span>Total</span>
                      <span className="text-sky-600">R$ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Voucher */}
        {step === 4 && selectedPackage && (
          <div className="max-w-2xl mx-auto space-y-8 print:space-y-4">
            <div className="text-center space-y-4 print:hidden">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-sky-500 to-blue-500 flex items-center justify-center animate-scale-in shadow-lg">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Voucher Gerado!</h2>
              <p className="text-slate-600">Apresente este voucher na recepção</p>
            </div>

            {/* Voucher Card */}
            <Card className="bg-white text-slate-900 overflow-hidden shadow-lg print:shadow-none">
              <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Layers className="h-8 w-8" />
                  <span className="text-2xl font-bold">Uni | Stays</span>
                </div>
                <p className="text-sky-100">Voucher Day Use</p>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-sky-100">
                  <span className="text-slate-500">Código do Voucher</span>
                  <span className="text-2xl font-mono font-bold text-sky-600">{bookingCode}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-sm block">Pacote</span>
                    <span className="font-semibold">{selectedPackage.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm block">Data</span>
                    <span className="font-semibold">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm block">Horário</span>
                    <span className="font-semibold">{selectedPackage.duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-sm block">Pessoas</span>
                    <span className="font-semibold">{guests}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-sm block">Responsável</span>
                    <span className="font-semibold">{guestInfo.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-sm block">CPF</span>
                    <span className="font-semibold">{guestInfo.cpf}</span>
                  </div>
                </div>

                <div className="bg-sky-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sky-800 mb-2">Incluso no pacote:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.includes.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="border-sky-300 text-sky-700 bg-white">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-sky-100">
                  <span className="text-slate-500">Valor Pago</span>
                  <span className="text-2xl font-bold text-sky-600">R$ {finalTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg shadow-inner">
                    <QRCodeSVG 
                      value={`https://unistays.com/voucher/${bookingCode}`}
                      size={120}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400">
                  Apresente este voucher na recepção junto com um documento de identificação com foto.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
              <Button 
                onClick={handlePrintVoucher}
                variant="outline" 
                className="border-sky-200 text-sky-600 hover:bg-sky-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Voucher
              </Button>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-sky-100 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2024 Uni | Stays. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-sky-600 transition-colors">Regulamento</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
