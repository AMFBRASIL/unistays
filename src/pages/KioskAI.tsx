import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConciergeAIModal } from "@/components/kiosk/ConciergeAIModal";
import {
  Bot,
  User,
  Send,
  UtensilsCrossed,
  Sparkles,
  Loader2,
  CheckCircle2,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  ArrowLeft,
  QrCode,
  KeyRound,
  BedDouble,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Languages,
  HelpCircle,
  Home,
  Utensils,
  GlassWater,
  Flower2,
  Shirt,
  Shield,
  Star,
  ChevronRight,
  Fingerprint,
  ScanLine,
  Users,
  Baby,
  Minus,
  Plus,
  Tv,
  Bath,
  Wind,
  Eye,
  CreditCard,
  ArrowRight,
  Check,
  X,
  UserPlus,
  Bell,
  Headphones,
  MessageCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "card" | "action" | "key";
  data?: any;
}

interface GuestData {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  reservation?: {
    id: string;
    room: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: string;
    nights: number;
    total: number;
    extras: string[];
  };
  preferences?: {
    roomTemperature?: number;
    pillowType?: string;
    dietaryRestrictions?: string[];
    language?: string;
  };
}

interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  amenities: string[];
  image: string;
  size: number;
  rooms: Room[];
}

interface Room {
  id: string;
  number: string;
  floor: number;
  status: "available" | "occupied" | "maintenance" | "cleaning";
  view?: string;
  image?: string;
  bedType?: string;
  highlights?: string[];
}

// Mock guest database
const mockGuests: Record<string, GuestData> = {
  "123.456.789-00": {
    id: "guest-001",
    name: "Carlos Eduardo Silva",
    cpf: "123.456.789-00",
    email: "carlos.silva@email.com",
    phone: "(11) 99999-8888",
    loyaltyTier: "Gold",
    loyaltyPoints: 4520,
    reservation: {
      id: "RES-2024-0892",
      room: "Suite 502",
      roomType: "Suíte Master",
      checkIn: "2024-01-29",
      checkOut: "2024-02-02",
      status: "confirmed",
      nights: 4,
      total: 2800,
      extras: ["Café da manhã", "Late checkout"],
    },
    preferences: {
      roomTemperature: 22,
      pillowType: "Macio",
      dietaryRestrictions: ["Vegetariano"],
      language: "pt-BR",
    },
  },
  "987.654.321-00": {
    id: "guest-002",
    name: "Maria Fernanda Costa",
    cpf: "987.654.321-00",
    email: "maria.costa@email.com",
    phone: "(21) 98888-7777",
    loyaltyTier: "Platinum",
    loyaltyPoints: 12800,
    reservation: {
      id: "RES-2024-0893",
      room: "Quarto 304",
      roomType: "Superior",
      checkIn: "2024-01-29",
      checkOut: "2024-01-31",
      status: "confirmed",
      nights: 2,
      total: 980,
      extras: ["Spa"],
    },
    preferences: {
      roomTemperature: 24,
      pillowType: "Firme",
      language: "pt-BR",
    },
  },
};

// Mock room types
const roomTypes: RoomType[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Confortável e funcional",
    basePrice: 280,
    maxGuests: 2,
    amenities: ["Wi-Fi", "TV", "Ar-condicionado", "Frigobar"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
    size: 22,
    rooms: [
      { id: "101", number: "101", floor: 1, status: "available", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop", bedType: "Casal Queen", highlights: ["Silencioso", "Próximo ao elevador"] },
      { id: "102", number: "102", floor: 1, status: "available", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop", bedType: "2 Solteiros", highlights: ["Ideal para amigos", "Vista interna"] },
      { id: "103", number: "103", floor: 1, status: "occupied", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop", bedType: "Casal Queen", highlights: ["Recém reformado"] },
      { id: "201", number: "201", floor: 2, status: "available", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&h=400&fit=crop", bedType: "Casal King", highlights: ["Mais espaçoso", "Banheira"] },
      { id: "202", number: "202", floor: 2, status: "cleaning", image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=400&fit=crop", bedType: "Casal Queen", highlights: ["Vista jardim"] },
    ],
  },
  {
    id: "superior",
    name: "Superior",
    description: "Mais espaço e conforto",
    basePrice: 380,
    maxGuests: 3,
    amenities: ["Wi-Fi", "TV 50\"", "Ar-condicionado", "Frigobar", "Cofre", "Varanda"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
    size: 30,
    rooms: [
      { id: "301", number: "301", floor: 3, status: "available", view: "Cidade", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop", bedType: "Casal King", highlights: ["Vista panorâmica", "Varanda grande"] },
      { id: "302", number: "302", floor: 3, status: "available", view: "Piscina", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop", bedType: "Casal King + Sofá-cama", highlights: ["Vista piscina", "Perfeito para família"] },
      { id: "303", number: "303", floor: 3, status: "maintenance", view: "Cidade", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=400&fit=crop", bedType: "Casal Queen", highlights: ["Em manutenção"] },
      { id: "401", number: "401", floor: 4, status: "available", view: "Cidade", image: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&h=400&fit=crop", bedType: "Casal King", highlights: ["Andar alto", "Silencioso", "Sol da manhã"] },
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    description: "Luxo e sofisticação",
    basePrice: 520,
    maxGuests: 3,
    amenities: ["Wi-Fi", "TV 55\"", "Ar-condicionado", "Frigobar", "Cofre", "Banheira", "Varanda"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    size: 40,
    rooms: [
      { id: "501", number: "501", floor: 5, status: "available", view: "Mar", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop", bedType: "Casal King Size", highlights: ["Vista mar frontal", "Banheira de hidromassagem", "Varanda privativa"] },
      { id: "502", number: "502", floor: 5, status: "available", view: "Mar", image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600&h=400&fit=crop", bedType: "Casal King Size", highlights: ["Nascer do sol", "Champagne de boas-vindas", "Amenities premium"] },
    ],
  },
  {
    id: "suite",
    name: "Suíte Master",
    description: "A experiência completa",
    basePrice: 850,
    maxGuests: 4,
    amenities: ["Wi-Fi", "TV 65\"", "Ar-condicionado", "Frigobar", "Cofre", "Banheira", "Sala de estar", "Varanda panorâmica"],
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=300&fit=crop",
    size: 65,
    rooms: [
      { id: "601", number: "Suíte 601", floor: 6, status: "available", view: "Panorâmica", image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&h=400&fit=crop", bedType: "Cama King Size + Sofá-cama", highlights: ["Cobertura", "Jacuzzi privativa", "Sala de estar", "Butler service"] },
      { id: "602", number: "Suíte 602", floor: 6, status: "occupied", view: "Panorâmica", image: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop", bedType: "Cama Super King", highlights: ["Vista 360°", "Terraço exclusivo", "Adega climatizada"] },
    ],
  },
];

const quickActions = [
  { icon: UtensilsCrossed, label: "Restaurante", description: "Ver cardápio e reservar mesa" },
  { icon: Flower2, label: "Spa", description: "Tratamentos e massagens" },
  { icon: Dumbbell, label: "Academia", description: "Horários e equipamentos" },
  { icon: Car, label: "Transfer", description: "Solicitar transporte" },
  { icon: Coffee, label: "Room Service", description: "Pedir no quarto" },
  { icon: Wifi, label: "Wi-Fi", description: "Conectar dispositivos" },
];

const suggestions = [
  {
    icon: Utensils,
    title: "Jantar Especial",
    description: "Nosso restaurante tem um menu degustação às 19h",
    badge: "Recomendado",
    discount: "10% para hóspedes",
  },
  {
    icon: Waves,
    title: "Piscina Aquecida",
    description: "Aberta até 22h com vista panorâmica",
    badge: "Popular",
  },
];

export default function KioskAI() {
  const [step, setStep] = useState<"welcome" | "identify" | "booking" | "room-selection" | "guest-form" | "payment" | "confirmation" | "chat">("welcome");
  const [cpf, setCpf] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Concierge modal state
  const [showConciergeModal, setShowConciergeModal] = useState(false);

  // Booking state
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Guest form state
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  // Calculate nights and total
  const nights = checkIn && checkOut ? Math.max(1, differenceInDays(checkOut, checkIn)) : 1;
  const totalPrice = selectedRoomType ? selectedRoomType.basePrice * nights : 0;
  const taxes = totalPrice * 0.05;
  const grandTotal = totalPrice + taxes;

  // Format CPF as user types
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  const searchGuest = async () => {
    if (cpf.length < 14) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const foundGuest = mockGuests[cpf];
    
    if (foundGuest) {
      setGuest(foundGuest);
      setStep("chat");
      
      const greeting: Message = {
        id: "greeting",
        role: "assistant",
        content: `Olá, ${foundGuest.name.split(" ")[0]}! 🎉\n\nQue alegria em recebê-lo(a)! Encontrei sua reserva para o **${foundGuest.reservation?.roomType}** (${foundGuest.reservation?.room}).\n\nSeu check-in está confirmado para hoje. Posso gerar seu cartão de acesso digital agora mesmo!`,
        timestamp: new Date(),
        type: "text",
      };
      
      setMessages([greeting]);
    } else {
      // Guest not found - go to booking flow
      setGuestForm((prev) => ({ ...prev, cpf }));
      setStep("booking");
    }
    
    setIsLoading(false);
  };

  const selectRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setSelectedRoom(null);
    setStep("room-selection");
  };

  const selectRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const proceedToGuestForm = () => {
    if (selectedRoom) {
      setStep("guest-form");
    }
  };

  const proceedToPayment = () => {
    if (guestForm.name && guestForm.email && guestForm.phone) {
      setStep("payment");
    }
  };

  const completeBooking = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setStep("confirmation");
  };

  const generateRoomKey = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const keyMessage: Message = {
      id: `key-${Date.now()}`,
      role: "assistant",
      content: "Seu cartão de acesso digital foi gerado com sucesso!",
      timestamp: new Date(),
      type: "key",
      data: {
        room: guest?.reservation?.room,
        validFrom: new Date().toISOString(),
        validUntil: guest?.reservation?.checkOut,
        qrCode: `ROOM-KEY-${guest?.reservation?.id}-${Date.now()}`,
      },
    };
    
    setMessages((prev) => [...prev, keyMessage]);
    setKeyGenerated(true);
    setIsLoading(false);
    
    setTimeout(() => {
      const suggestionsMessage: Message = {
        id: `suggestions-${Date.now()}`,
        role: "assistant",
        content: "Enquanto você se acomoda, que tal conhecer algumas experiências especiais do hotel?",
        timestamp: new Date(),
        type: "card",
        data: suggestions,
      };
      setMessages((prev) => [...prev, suggestionsMessage]);
    }, 1000);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let response = "Entendi sua solicitação! Vou verificar isso para você.";
      
      const lowerText = messageText.toLowerCase();
      
      if (lowerText.includes("cartão") || lowerText.includes("chave") || lowerText.includes("acesso")) {
        if (!keyGenerated && guest?.reservation) {
          generateRoomKey();
          return;
        } else {
          response = "Seu cartão de acesso já foi gerado! Aproxime o celular da fechadura do quarto.";
        }
      } else if (lowerText.includes("restaurante") || lowerText.includes("jantar")) {
        response = "🍽️ **Restaurante Panorama**\n\n• Café: 6h30 às 10h30\n• Almoço: 12h às 15h\n• Jantar: 19h às 23h\n\nHoje recomendo o **Menu Degustação**!";
      } else if (lowerText.includes("wifi")) {
        response = "📶 **Wi-Fi do Hotel**\n\nRede: UniStays_Guest\nSenha: Bem-vindo2024";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (step === "identify" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const resetKiosk = () => {
    setStep("welcome");
    setCpf("");
    setGuest(null);
    setMessages([]);
    setKeyGenerated(false);
    setInput("");
    setSelectedRoomType(null);
    setSelectedRoom(null);
    setGuestForm({ name: "", email: "", phone: "", cpf: "" });
    setShowConciergeModal(false);
  };

  // Concierge functions
  const callConcierge = () => {
    setShowConciergeModal(true);
  };

  const getAmenityIcon = (amenity: string) => {
    if (amenity.includes("Wi-Fi")) return Wifi;
    if (amenity.includes("TV")) return Tv;
    if (amenity.includes("Ar")) return Wind;
    if (amenity.includes("Banheira")) return Bath;
    if (amenity.includes("Varanda") || amenity.includes("Vista")) return Eye;
    return Check;
  };

  // Welcome Screen
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
            <Languages className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
              <Bot className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Uni|Stays</span>
          </h1>
          <p className="text-xl text-white/70 mb-12">
            Seu assistente inteligente de check-in está pronto para ajudá-lo
          </p>

          <Button
            size="lg"
            className="h-20 px-16 text-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-300 hover:scale-105"
            onClick={() => setStep("identify")}
          >
            <Fingerprint className="w-8 h-8 mr-4" />
            Iniciar Check-in
          </Button>

          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              { icon: KeyRound, label: "Cartão Digital", desc: "Acesso direto ao quarto" },
              { icon: Clock, label: "Rápido", desc: "Check-in em 30 segundos" },
              { icon: Shield, label: "Seguro", desc: "Dados protegidos" },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-white font-medium">{feature.label}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 text-white/40 text-sm">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>
    );
  }

  // Identification Screen
  if (step === "identify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <Button variant="ghost" size="icon" className="absolute top-6 left-6 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setStep("welcome")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="relative z-10 w-full max-w-lg mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center">
              <ScanLine className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">Identificação</h2>
          <p className="text-white/60 text-center mb-8">Digite seu CPF para buscarmos sua reserva</p>

          <div className="relative mb-6">
            <Input
              ref={inputRef}
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCPFChange}
              onKeyDown={(e) => e.key === "Enter" && searchGuest()}
              className="h-20 text-3xl text-center bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-2xl focus:ring-primary focus:border-primary font-mono tracking-wider"
              disabled={isLoading}
            />
          </div>

          <Button
            size="lg"
            className="w-full h-16 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-2xl shadow-xl"
            onClick={searchGuest}
            disabled={cpf.length < 14 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Buscando sua reserva...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 mr-3" />
                Continuar
              </>
            )}
          </Button>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <QrCode className="w-5 h-5 mr-2" />
              Usar QR Code
            </Button>
            <span className="text-white/30">|</span>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10" onClick={callConcierge}>
              <Phone className="w-5 h-5 mr-2" />
              Chamar Concierge
            </Button>
          </div>
        </div>

        <p className="absolute bottom-6 text-white/30 text-sm">Não tem reserva? Digite seu CPF e faça uma agora!</p>

        {/* Concierge AI Modal */}
        <ConciergeAIModal 
          open={showConciergeModal} 
          onOpenChange={setShowConciergeModal}
        />
      </div>
    );
  }

  // Booking Flow - Room Selection
  if (step === "booking") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setStep("identify")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Nova Reserva</h1>
                <p className="text-sm text-white/50">Escolha seu quarto ideal</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={resetKiosk}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex relative z-10">
          {/* Left: Room Selection */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Date & Guest Selection */}
            <div className="max-w-5xl mx-auto mb-8">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="grid grid-cols-4 gap-6">
                  {/* Check-in */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-16 bg-white/5 border-white/20 text-white hover:bg-white/10 flex flex-col items-start justify-center px-4">
                        <span className="text-xs text-white/50 mb-1">Check-in</span>
                        <span className="text-lg font-semibold">
                          {checkIn ? format(checkIn, "dd MMM", { locale: ptBR }) : "Selecione"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < new Date()} locale={ptBR} />
                    </PopoverContent>
                  </Popover>

                  {/* Check-out */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-16 bg-white/5 border-white/20 text-white hover:bg-white/10 flex flex-col items-start justify-center px-4">
                        <span className="text-xs text-white/50 mb-1">Check-out</span>
                        <span className="text-lg font-semibold">
                          {checkOut ? format(checkOut, "dd MMM", { locale: ptBR }) : "Selecione"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date <= (checkIn || new Date())} locale={ptBR} />
                    </PopoverContent>
                  </Popover>

                  {/* Adults */}
                  <div className="h-16 bg-white/5 border border-white/20 rounded-lg flex items-center justify-between px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/50">Adultos</span>
                      <span className="text-lg font-semibold text-white">{adults}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setAdults(adults + 1)} disabled={adults >= 6}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="h-16 bg-white/5 border border-white/20 rounded-lg flex items-center justify-between px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/50">Crianças</span>
                      <span className="text-lg font-semibold text-white">{children}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10" onClick={() => setChildren(children + 1)} disabled={children >= 4}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Nights indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Moon className="w-4 h-4 text-primary" />
                  <span className="text-white/80">{nights} {nights === 1 ? "noite" : "noites"}</span>
                </div>
              </Card>
            </div>

            {/* Room Types Grid */}
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Escolha sua categoria</h2>
              <div className="grid grid-cols-2 gap-6">
                {roomTypes.map((type) => {
                  const availableRooms = type.rooms.filter((r) => r.status === "available");
                  
                  return (
                    <Card
                      key={type.id}
                      className={cn(
                        "bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden transition-all duration-300 cursor-pointer group hover:ring-2 hover:ring-primary/50",
                        availableRooms.length === 0 && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => availableRooms.length > 0 && selectRoomType(type)}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img src={type.image} alt={type.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-white">{type.name}</h3>
                              <p className="text-white/70 text-sm">{type.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">R$ {type.basePrice}</p>
                              <p className="text-white/60 text-xs">/noite</p>
                            </div>
                          </div>
                        </div>
                        {availableRooms.length > 0 && (
                          <Badge className="absolute top-4 right-4 bg-green-500/90 text-white">
                            {availableRooms.length} disponível
                          </Badge>
                        )}
                        {availableRooms.length === 0 && (
                          <Badge className="absolute top-4 right-4 bg-red-500/90 text-white">Indisponível</Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <div className="flex items-center gap-4 text-white/60 text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Até {type.maxGuests} pessoas
                          </span>
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-4 h-4" />
                            {type.size}m²
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {type.amenities.slice(0, 4).map((amenity, i) => {
                            const Icon = getAmenityIcon(amenity);
                            return (
                              <Badge key={i} variant="outline" className="bg-white/5 border-white/20 text-white/70 text-xs">
                                <Icon className="w-3 h-3 mr-1" />
                                {amenity}
                              </Badge>
                            );
                          })}
                          {type.amenities.length > 4 && (
                            <Badge variant="outline" className="bg-white/5 border-white/20 text-white/70 text-xs">
                              +{type.amenities.length - 4}
                            </Badge>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-white/60 text-sm">Ver quartos disponíveis</span>
                          <ChevronRight className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary Panel */}
          <aside className="w-96 border-l border-white/10 bg-black/30 backdrop-blur-xl p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Resumo da Estadia
            </h3>

            <Card className="bg-white/5 border-white/10 p-4 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Check-in</span>
                  <span className="text-white">{checkIn ? format(checkIn, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Check-out</span>
                  <span className="text-white">{checkOut ? format(checkOut, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Noites</span>
                  <span className="text-white">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Hóspedes</span>
                  <span className="text-white">{adults} adultos{children > 0 && `, ${children} crianças`}</span>
                </div>
              </div>
            </Card>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center mb-4">
                <BedDouble className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/60">Selecione uma categoria para ver os quartos disponíveis</p>
            </div>

            <div className="mt-auto pt-6">
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={callConcierge}>
                <Phone className="w-4 h-4 mr-2" />
                Precisa de ajuda?
              </Button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Room Selection Screen (NEW)
  if (step === "room-selection" && selectedRoomType) {
    const availableRooms = selectedRoomType.rooms.filter((r) => r.status === "available");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setStep("booking")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{selectedRoomType.name}</h1>
                <p className="text-sm text-white/50">{availableRooms.length} quartos disponíveis</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={resetKiosk}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex relative z-10">
          {/* Left: Rooms Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              {/* Category summary */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden">
                    <img src={selectedRoomType.image} alt={selectedRoomType.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{selectedRoomType.name}</h2>
                    <p className="text-white/60">{selectedRoomType.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-white/50 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Até {selectedRoomType.maxGuests} pessoas
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        {selectedRoomType.size}m²
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-sm">A partir de</p>
                    <p className="text-3xl font-bold text-white">R$ {selectedRoomType.basePrice}</p>
                    <p className="text-white/50 text-sm">/noite</p>
                  </div>
                </div>
              </Card>

              <h3 className="text-lg font-semibold text-white mb-4">Escolha seu quarto</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  
                  return (
                    <Card
                      key={room.id}
                      className={cn(
                        "bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden transition-all duration-300 cursor-pointer group",
                        isSelected && "ring-2 ring-primary border-primary/50 bg-primary/10"
                      )}
                      onClick={() => selectRoom(room)}
                    >
                      {/* Room Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={room.image || selectedRoomType.image} 
                          alt={`Quarto ${room.number}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Room number badge */}
                        <Badge className="absolute top-4 left-4 bg-black/60 text-white backdrop-blur-sm text-lg px-3 py-1">
                          {room.number}
                        </Badge>
                        
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}

                        {/* Floor indicator */}
                        <div className="absolute bottom-4 left-4">
                          <p className="text-white/70 text-sm">{room.floor}º Andar</p>
                          {room.view && (
                            <p className="text-white font-medium flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              Vista {room.view}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="p-4">
                        {room.bedType && (
                          <div className="flex items-center gap-2 text-white mb-3">
                            <BedDouble className="w-5 h-5 text-primary" />
                            <span className="font-medium">{room.bedType}</span>
                          </div>
                        )}

                        {room.highlights && room.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {room.highlights.map((highlight, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  isSelected 
                                    ? "bg-primary/20 border-primary/40 text-white" 
                                    : "bg-white/5 border-white/20 text-white/70"
                                )}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Select button */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <Button
                            className={cn(
                              "w-full",
                              isSelected 
                                ? "bg-primary text-white" 
                                : "bg-white/10 text-white hover:bg-white/20"
                            )}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Selecionado
                              </>
                            ) : (
                              "Selecionar este quarto"
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary Panel */}
          <aside className="w-96 border-l border-white/10 bg-black/30 backdrop-blur-xl p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Resumo da Reserva
            </h3>

            {selectedRoom ? (
              <>
                <Card className="bg-white/5 border-white/10 p-4 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img src={selectedRoom.image || selectedRoomType.image} alt={selectedRoomType.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{selectedRoomType.name}</h4>
                      <p className="text-white/60 text-sm">Quarto {selectedRoom.number}</p>
                      {selectedRoom.view && (
                        <Badge variant="outline" className="mt-1 text-xs border-primary/30 text-primary">
                          Vista: {selectedRoom.view}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Check-in</span>
                      <span className="text-white">{checkIn ? format(checkIn, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Check-out</span>
                      <span className="text-white">{checkOut ? format(checkOut, "dd/MM/yyyy", { locale: ptBR }) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Noites</span>
                      <span className="text-white">{nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Hóspedes</span>
                      <span className="text-white">{adults} adultos{children > 0 && `, ${children} crianças`}</span>
                    </div>
                  </div>
                </Card>

                {/* Pricing */}
                <Card className="bg-white/5 border-white/10 p-4 mb-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Diárias ({nights}x R$ {selectedRoomType.basePrice})</span>
                      <span className="text-white">R$ {totalPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Taxas e impostos</span>
                      <span className="text-white">R$ {taxes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total</span>
                        <span className="text-2xl font-bold text-white">R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="mt-auto">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl"
                    onClick={proceedToGuestForm}
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center mb-4">
                  <BedDouble className="w-10 h-10 text-white/30" />
                </div>
                <p className="text-white/60">Selecione um quarto para ver o resumo completo</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  // Guest Form
  if (step === "guest-form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setStep("booking")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Seus Dados</h1>
                <p className="text-sm text-white/50">Preencha suas informações</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-xl">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8">
              <div className="space-y-6">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Nome Completo</label>
                  <Input
                    value={guestForm.name}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite seu nome completo"
                    className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">E-mail</label>
                  <Input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Telefone</label>
                  <Input
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">CPF</label>
                  <Input
                    value={guestForm.cpf}
                    onChange={(e) => setGuestForm((prev) => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                    className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl"
                    maxLength={14}
                  />
                </div>
              </div>

              {/* Summary strip */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-white font-medium">{selectedRoomType?.name} - {selectedRoom?.number}</p>
                      <p className="text-white/60 text-sm">{nights} {nights === 1 ? "noite" : "noites"}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl mt-6"
                onClick={proceedToPayment}
                disabled={!guestForm.name || !guestForm.email || !guestForm.phone}
              >
                Continuar para Pagamento
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Payment
  if (step === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setStep("guest-form")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Pagamento</h1>
                <p className="text-sm text-white/50">Escolha a forma de pagamento</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-xl">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8">
              {/* Summary */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img src={selectedRoomType?.image} alt={selectedRoomType?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{selectedRoomType?.name}</p>
                    <p className="text-white/60 text-sm">Quarto {selectedRoom?.number}</p>
                    <p className="text-white/60 text-sm">{nights} {nights === 1 ? "noite" : "noites"} • {adults} adultos</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total a pagar</span>
                    <span className="text-2xl font-bold text-white">R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Payment options */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Forma de Pagamento</h3>
                
                <Button
                  variant="outline"
                  className="w-full h-16 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start px-6"
                  onClick={completeBooking}
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mr-4">
                    <QrCode className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">PIX</p>
                    <p className="text-white/60 text-sm">Pagamento instantâneo</p>
                  </div>
                  <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">5% OFF</Badge>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start px-6"
                  onClick={completeBooking}
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-4">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-white/60 text-sm">Até 12x sem juros</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-16 bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start px-6"
                  onClick={completeBooking}
                  disabled={isLoading}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mr-4">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Cartão de Débito</p>
                    <p className="text-white/60 text-sm">Pagamento imediato</p>
                  </div>
                </Button>
              </div>

              {isLoading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-white/60">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando pagamento...</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation
  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-lg mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Reserva Confirmada!</h1>
          <p className="text-xl text-white/70 mb-8">
            Obrigado, {guestForm.name.split(" ")[0]}! Seu quarto está pronto.
          </p>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-8 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <img src={selectedRoomType?.image} alt={selectedRoomType?.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{selectedRoomType?.name}</p>
                <p className="text-white/60">Quarto {selectedRoom?.number}</p>
                <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                  <KeyRound className="w-3 h-3 mr-1" />
                  Acesso liberado
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs mb-1">Check-in</p>
                <p className="text-white font-medium">{checkIn ? format(checkIn, "dd/MM/yyyy") : "-"}</p>
                <p className="text-white/50 text-xs">14:00</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs mb-1">Check-out</p>
                <p className="text-white font-medium">{checkOut ? format(checkOut, "dd/MM/yyyy") : "-"}</p>
                <p className="text-white/50 text-xs">12:00</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center p-6 bg-white rounded-xl">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto text-slate-900" />
                <p className="text-slate-600 text-sm mt-2">Escaneie para acessar o quarto</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
              onClick={resetKiosk}
            >
              <Home className="w-5 h-5 mr-2" />
              Início
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl"
              onClick={callConcierge}
            >
              <Phone className="w-5 h-5 mr-2" />
              Chamar Concierge
            </Button>
          </div>

          {/* Concierge AI Modal */}
          <ConciergeAIModal 
            open={showConciergeModal} 
            onOpenChange={setShowConciergeModal}
            guestName={guestForm.name.split(" ")[0]}
          />
        </div>
      </div>
    );
  }

  // Chat Screen (for guests with reservation)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={resetKiosk}>
              <Home className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Assistente UniStays</h1>
              <p className="text-sm text-white/50">Online • Pronto para ajudar</p>
            </div>
          </div>

          {guest && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{guest.name}</p>
                <div className="flex items-center gap-2 justify-end">
                  {guest.loyaltyTier && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      {guest.loyaltyTier}
                    </Badge>
                  )}
                  {guest.reservation && (
                    <span className="text-white/50 text-sm">{guest.reservation.room}</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center text-white font-semibold">
                {guest.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex relative z-10">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-4", message.role === "user" ? "flex-row-reverse" : "")}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      message.role === "user" ? "bg-primary text-white" : "bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10"
                    )}
                  >
                    {message.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
                  </div>

                  <div className={cn("max-w-[80%]", message.role === "user" ? "text-right" : "")}>
                    {message.type !== "key" && message.type !== "card" && (
                      <div
                        className={cn(
                          "rounded-2xl px-5 py-4",
                          message.role === "user" ? "bg-primary text-white rounded-br-md" : "bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-bl-md"
                        )}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content.split("\n").map((line, i) => {
                            let formattedLine = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                            formattedLine = formattedLine.replace(/\*(.+?)\*/g, "<em>$1</em>");
                            return (
                              <p key={i} className={cn("mb-1 last:mb-0", line.startsWith("•") && "ml-2")} dangerouslySetInnerHTML={{ __html: formattedLine }} />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {message.type === "key" && (
                      <div className="bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">Cartão de Acesso Digital</h4>
                            <p className="text-white/60 text-sm">{message.data?.room}</p>
                          </div>
                          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        </div>

                        <div className="flex gap-6">
                          <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-slate-900" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 text-white/80">
                              <BedDouble className="w-4 h-4 text-primary" />
                              <span>{guest?.reservation?.roomType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                              <span>Válido até {guest?.reservation?.checkOut}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>5º andar • Elevador A</span>
                            </div>
                            <p className="text-white/50 text-xs mt-2">Aproxime o QR Code da fechadura</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === "card" && message.data && (
                      <div className="space-y-3 text-left">
                        <p className="text-white/80 text-sm mb-3">{message.content}</p>
                        <div className="grid gap-3">
                          {message.data.map((suggestion: any, i: number) => (
                            <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/10 p-4 hover:bg-white/15 transition-colors cursor-pointer group">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                  <suggestion.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-white font-medium">{suggestion.title}</h4>
                                    {suggestion.badge && (
                                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                        {suggestion.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-sm">{suggestion.description}</p>
                                  {suggestion.discount && <p className="text-green-400 text-xs mt-1">{suggestion.discount}</p>}
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className={cn("text-xs mt-2 text-white/40", message.role === "user" ? "text-right" : "")}>
                      {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-md px-5 py-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {keyGenerated && (
            <div className="px-6 pb-4">
              <div className="max-w-3xl mx-auto">
                <p className="text-white/40 text-xs mb-3">Ações rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, i) => (
                    <Button key={i} variant="outline" size="sm" className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white" onClick={() => handleSend(action.label)}>
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {guest?.reservation && !keyGenerated && !isLoading && (
            <div className="px-6 pb-4">
              <div className="max-w-3xl mx-auto">
                <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl" onClick={generateRoomKey}>
                  <KeyRound className="w-5 h-5 mr-3" />
                  Gerar Meu Cartão de Acesso
                </Button>
              </div>
            </div>
          )}

          <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem ou pergunta..."
                className="flex-1 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl text-lg"
                disabled={isLoading}
              />
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="max-w-3xl mx-auto text-center text-white/30 text-xs mt-3">Powered by UniStays AI • Seu assistente 24 horas</p>
          </div>
        </div>

        {/* Side panel - Reservation info */}
        {guest?.reservation && (
          <aside className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-xl p-6 hidden lg:block">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Sua Reserva
            </h3>

            <Card className="bg-white/5 border-white/10 p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Quarto</span>
                  <span className="text-white font-medium">{guest.reservation.room}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Tipo</span>
                  <span className="text-white">{guest.reservation.roomType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Check-in</span>
                  <span className="text-white">{new Date(guest.reservation.checkIn).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Check-out</span>
                  <span className="text-white">{new Date(guest.reservation.checkOut).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-sm">Noites</span>
                  <span className="text-white">{guest.reservation.nights}</span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Total</span>
                    <span className="text-white font-bold text-lg">R$ {guest.reservation.total.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </Card>

            {guest.reservation.extras.length > 0 && (
              <>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Inclusos
                </h3>
                <div className="space-y-2 mb-6">
                  {guest.reservation.extras.map((extra, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      {extra}
                    </div>
                  ))}
                </div>
              </>
            )}

            {guest.preferences && (
              <>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Preferências
                </h3>
                <div className="space-y-2">
                  {guest.preferences.roomTemperature && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Sun className="w-4 h-4" />
                      Temperatura: {guest.preferences.roomTemperature}°C
                    </div>
                  )}
                  {guest.preferences.pillowType && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Moon className="w-4 h-4" />
                      Travesseiro: {guest.preferences.pillowType}
                    </div>
                  )}
                  {guest.preferences.dietaryRestrictions && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <UtensilsCrossed className="w-4 h-4" />
                      {guest.preferences.dietaryRestrictions.join(", ")}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-white/10">
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={callConcierge}>
                <Phone className="w-4 h-4 mr-2" />
                Chamar Concierge
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Concierge AI Modal */}
      <ConciergeAIModal 
        open={showConciergeModal} 
        onOpenChange={setShowConciergeModal}
        guestName={guest?.name.split(" ")[0]}
      />
    </div>
  );
}