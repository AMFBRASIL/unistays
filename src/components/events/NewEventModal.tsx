import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Sparkles,
  PartyPopper,
  Briefcase,
  Heart,
  Music,
  GraduationCap,
  Utensils,
  FileText,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  BedDouble,
  Percent,
  Home,
  Copy,
  Printer,
  Send,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const generateProtocol = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `EVT-${year}${month}${day}-${random}`;
};

interface NewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypes = [
  { id: "corporate", label: "Corporativo", icon: Briefcase, color: "from-blue-500 to-blue-600" },
  { id: "wedding", label: "Casamento", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "party", label: "Festa", icon: PartyPopper, color: "from-purple-500 to-violet-500" },
  { id: "conference", label: "Conferência", icon: GraduationCap, color: "from-amber-500 to-orange-500" },
  { id: "concert", label: "Show/Música", icon: Music, color: "from-emerald-500 to-green-500" },
  { id: "dinner", label: "Jantar/Buffet", icon: Utensils, color: "from-red-500 to-rose-600" },
];

const eventSpaces = [
  { id: "salon-principal", name: "Salão Principal", capacity: 200, price: 5000 },
  { id: "sala-reunioes", name: "Sala de Reuniões A", capacity: 30, price: 800 },
  { id: "sala-reunioes-b", name: "Sala de Reuniões B", capacity: 20, price: 600 },
  { id: "area-externa", name: "Área Externa", capacity: 150, price: 3500 },
  { id: "rooftop", name: "Rooftop Lounge", capacity: 80, price: 2500 },
  { id: "restaurante", name: "Restaurante Privativo", capacity: 50, price: 1500 },
];

const additionalServices = [
  { id: "catering", label: "Buffet/Catering", price: 150 },
  { id: "decoration", label: "Decoração", price: 2000 },
  { id: "audio-video", label: "Áudio e Vídeo", price: 1500 },
  { id: "photography", label: "Fotografia", price: 1200 },
  { id: "dj", label: "DJ/Som", price: 800 },
  { id: "security", label: "Segurança Extra", price: 500 },
  { id: "valet", label: "Manobrista", price: 400 },
  { id: "cleaning", label: "Limpeza Especial", price: 300 },
];

const availableRooms = [
  { id: "101", number: "101", type: "Standard", category: "Quarto", floor: 1, price: 250 },
  { id: "102", number: "102", type: "Standard", category: "Quarto", floor: 1, price: 250 },
  { id: "103", number: "103", type: "Superior", category: "Quarto", floor: 1, price: 350 },
  { id: "201", number: "201", type: "Luxo", category: "Apartamento", floor: 2, price: 450 },
  { id: "202", number: "202", type: "Luxo", category: "Apartamento", floor: 2, price: 450 },
  { id: "203", number: "203", type: "Master Suite", category: "Apartamento", floor: 2, price: 650 },
  { id: "301", number: "301", type: "Penthouse", category: "Apartamento", floor: 3, price: 950 },
  { id: "302", number: "302", type: "Presidencial", category: "Suite", floor: 3, price: 1200 },
];

export function NewEventModal({ open, onOpenChange }: NewEventModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [includeAccommodation, setIncludeAccommodation] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [accommodationDiscount, setAccommodationDiscount] = useState(0);
  const [accommodationCheckIn, setAccommodationCheckIn] = useState("");
  const [accommodationCheckOut, setAccommodationCheckOut] = useState("");
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>("all");
  const [protocol, setProtocol] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    guests: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    company: "",
    notes: "",
  });

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(r => r !== roomId)
        : [...prev, roomId]
    );
  };

  const calculateNights = () => {
    if (!accommodationCheckIn || !accommodationCheckOut) return 0;
    const checkIn = new Date(accommodationCheckIn);
    const checkOut = new Date(accommodationCheckOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateAccommodationTotal = () => {
    const nights = calculateNights();
    const roomsTotal = selectedRooms.reduce((acc, roomId) => {
      const room = availableRooms.find(r => r.id === roomId);
      return acc + (room?.price || 0) * nights;
    }, 0);
    const discountAmount = (roomsTotal * accommodationDiscount) / 100;
    return roomsTotal - discountAmount;
  };

  const calculateTotal = () => {
    const space = eventSpaces.find(s => s.id === selectedSpace);
    const spacePrice = space?.price || 0;
    const servicesPrice = selectedServices.reduce((acc, serviceId) => {
      const service = additionalServices.find(s => s.id === serviceId);
      return acc + (service?.price || 0);
    }, 0);
    const guestCount = parseInt(formData.guests) || 0;
    const cateringTotal = selectedServices.includes("catering") ? guestCount * 150 : 0;
    const accommodationTotal = includeAccommodation ? calculateAccommodationTotal() : 0;
    return spacePrice + servicesPrice + cateringTotal - (selectedServices.includes("catering") ? 150 : 0) + accommodationTotal;
  };

  const filteredRooms = roomCategoryFilter === "all" 
    ? availableRooms 
    : availableRooms.filter(r => r.category === roomCategoryFilter);

  const handleSubmit = () => {
    const newProtocol = generateProtocol();
    setProtocol(newProtocol);
    setStep(5);
    toast.success("Evento criado com sucesso!", {
      description: `Protocolo: ${newProtocol}`,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after closing
    setTimeout(() => {
      setStep(1);
      setSelectedType(null);
      setSelectedSpace(null);
      setSelectedServices([]);
      setIncludeAccommodation(false);
      setSelectedRooms([]);
      setAccommodationDiscount(0);
      setAccommodationCheckIn("");
      setAccommodationCheckOut("");
      setRoomCategoryFilter("all");
      setProtocol("");
      setFormData({
        name: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        guests: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        company: "",
        notes: "",
      });
    }, 300);
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocol);
    toast.success("Protocolo copiado!");
  };

  const selectedTypeData = eventTypes.find(t => t.id === selectedType);
  const selectedSpaceData = eventSpaces.find(s => s.id === selectedSpace);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-background border-border">
        {/* Header with gradient */}
        <div className={`relative p-6 bg-gradient-to-r ${selectedTypeData?.color || "from-primary to-primary/80"}`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {selectedTypeData ? (
                  <selectedTypeData.icon className="w-7 h-7 text-white" />
                ) : (
                  <Calendar className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Novo Evento
                </DialogTitle>
                <DialogDescription className="text-white/80 text-sm mt-1">
                  {step === 1 && "Selecione o tipo de evento"}
                  {step === 2 && "Informações do evento"}
                  {step === 3 && "Espaço e serviços"}
                  {step === 4 && "Confirmação"}
                  {step === 5 && "Evento criado com sucesso!"}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {step < 5 && (
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      s === step
                        ? "bg-white text-primary"
                        : s < step
                        ? "bg-white/30 text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-1 rounded-full ${s < step ? "bg-white/50" : "bg-white/20"}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6">
            {/* Step 1: Event Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Qual o tipo de evento?</h3>
                  <p className="text-sm text-muted-foreground mt-1">Selecione a categoria que melhor descreve seu evento</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedType === type.id
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                        <type.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{type.label}</span>
                      {selectedType === type.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Info */}
                  <div className="space-y-4 p-5 rounded-xl bg-accent/30 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Informações do Evento</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-foreground">Nome do Evento *</Label>
                        <Input
                          placeholder="Ex: Conferência Anual 2024"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Descrição</Label>
                        <Textarea
                          placeholder="Descreva os detalhes do evento..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="mt-1.5 resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4 p-5 rounded-xl bg-accent/30 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Data e Horário</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-foreground">Data do Evento *</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground">Início</Label>
                          <Input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Término</Label>
                          <Input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground">Número de Convidados *</Label>
                        <div className="relative mt-1.5">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Ex: 100"
                            value={formData.guests}
                            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="md:col-span-2 space-y-4 p-5 rounded-xl bg-accent/30 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Contato do Responsável</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground">Nome Completo *</Label>
                        <Input
                          placeholder="Nome do responsável"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Empresa/Organização</Label>
                        <div className="relative mt-1.5">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Nome da empresa"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground">Telefone *</Label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="(00) 00000-0000"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground">E-mail *</Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Space & Services */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Space Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Selecione o Espaço</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventSpaces.map((space) => {
                      const guestCount = parseInt(formData.guests) || 0;
                      const exceedsCapacity = guestCount > space.capacity;
                      
                      return (
                        <button
                          key={space.id}
                          onClick={() => setSelectedSpace(space.id)}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            selectedSpace === space.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-foreground">{space.name}</h5>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                <span>Até {space.capacity} pessoas</span>
                              </div>
                            </div>
                            {selectedSpace === space.id && (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          {exceedsCapacity && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Capacidade menor que convidados</span>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t border-border">
                            <span className="text-lg font-bold text-primary">
                              R$ {space.price.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Services */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Serviços Adicionais</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {additionalServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedServices.includes(service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{service.label}</span>
                          {selectedServices.includes(service.id) && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {service.id === "catering" ? "R$ 150/pessoa" : `R$ ${service.price.toLocaleString("pt-BR")}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accommodation Section */}
                <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-amber-500" />
                      <h4 className="font-semibold text-foreground">Incluir Acomodações</h4>
                    </div>
                    <Switch
                      checked={includeAccommodation}
                      onCheckedChange={setIncludeAccommodation}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vincule quartos ou apartamentos ao evento com desconto especial
                  </p>

                  {includeAccommodation && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-amber-500/20">
                      {/* Check-in/Check-out dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-foreground">Check-in</Label>
                          <Input
                            type="date"
                            value={accommodationCheckIn}
                            onChange={(e) => setAccommodationCheckIn(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Check-out</Label>
                          <Input
                            type="date"
                            value={accommodationCheckOut}
                            onChange={(e) => setAccommodationCheckOut(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>

                      {calculateNights() > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Calendar className="w-4 h-4" />
                          <span>{calculateNights()} {calculateNights() === 1 ? "noite" : "noites"}</span>
                        </div>
                      )}

                      {/* Discount */}
                      <div>
                        <Label className="text-foreground">Desconto para o Evento (%)</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="relative flex-1">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={accommodationDiscount || ""}
                              onChange={(e) => setAccommodationDiscount(parseInt(e.target.value) || 0)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex gap-1">
                            {[0, 10, 15, 20, 30].map((discount) => (
                              <Button
                                key={discount}
                                type="button"
                                variant={accommodationDiscount === discount ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAccommodationDiscount(discount)}
                                className="px-2"
                              >
                                {discount}%
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filtrar:</span>
                        {["all", "Quarto", "Apartamento", "Suite"].map((cat) => (
                          <Button
                            key={cat}
                            type="button"
                            variant={roomCategoryFilter === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRoomCategoryFilter(cat)}
                          >
                            {cat === "all" ? "Todos" : cat + "s"}
                          </Button>
                        ))}
                      </div>

                      {/* Room Selection */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                        {filteredRooms.map((room) => (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleRoomToggle(room.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              selectedRooms.includes(room.id)
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-border hover:border-amber-500/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-foreground">{room.number}</span>
                              {selectedRooms.includes(room.id) && (
                                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{room.type}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {room.category}
                              </Badge>
                              <span className="text-xs font-semibold text-amber-600">
                                R$ {room.price}/noite
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Selected Rooms Summary */}
                      {selectedRooms.length > 0 && (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {selectedRooms.length} {selectedRooms.length === 1 ? "acomodação selecionada" : "acomodações selecionadas"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {calculateNights()} {calculateNights() === 1 ? "noite" : "noites"} × {selectedRooms.length} {selectedRooms.length === 1 ? "unidade" : "unidades"}
                                {accommodationDiscount > 0 && ` (-${accommodationDiscount}%)`}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-amber-600">
                              R$ {calculateAccommodationTotal().toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Total Estimado</h4>
                      <p className="text-sm text-muted-foreground">
                        Espaço + serviços{includeAccommodation && selectedRooms.length > 0 && " + acomodações"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">
                        R$ {calculateTotal().toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Confirme os Detalhes</h3>
                  <p className="text-sm text-muted-foreground mt-1">Revise as informações antes de criar o evento</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Summary */}
                  <div className="p-5 rounded-xl bg-accent/30 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedTypeData && (
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTypeData.color} flex items-center justify-center`}>
                          <selectedTypeData.icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-foreground">{formData.name || "Evento"}</h4>
                        <p className="text-sm text-muted-foreground">{selectedTypeData?.label}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formData.date || "Data não definida"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formData.startTime} - {formData.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{formData.guests} convidados</span>
                      </div>
                    </div>
                  </div>

                  {/* Space & Contact */}
                  <div className="p-5 rounded-xl bg-accent/30 border border-border">
                    <h4 className="font-semibold text-foreground mb-4">Local e Contato</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedSpaceData?.name || "Espaço não selecionado"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{formData.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{formData.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{formData.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  {selectedServices.length > 0 && (
                    <div className="md:col-span-2 p-5 rounded-xl bg-accent/30 border border-border">
                      <h4 className="font-semibold text-foreground mb-4">Serviços Inclusos</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((serviceId) => {
                          const service = additionalServices.find(s => s.id === serviceId);
                          return (
                            <Badge key={serviceId} variant="secondary" className="px-3 py-1">
                              {service?.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accommodations */}
                  {includeAccommodation && selectedRooms.length > 0 && (
                    <div className="md:col-span-2 p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-4">
                        <BedDouble className="w-5 h-5 text-amber-500" />
                        <h4 className="font-semibold text-foreground">Acomodações Vinculadas</h4>
                        {accommodationDiscount > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                            -{accommodationDiscount}% desconto
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedRooms.map((roomId) => {
                          const room = availableRooms.find(r => r.id === roomId);
                          return (
                            <Badge key={roomId} variant="outline" className="px-3 py-1 border-amber-500/30">
                              <Home className="w-3 h-3 mr-1" />
                              {room?.number} - {room?.type}
                            </Badge>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {accommodationCheckIn && accommodationCheckOut && (
                            <>Check-in: {new Date(accommodationCheckIn).toLocaleDateString("pt-BR")} → Check-out: {new Date(accommodationCheckOut).toLocaleDateString("pt-BR")} ({calculateNights()} noites)</>
                          )}
                        </span>
                        <span className="font-semibold text-amber-600">
                          R$ {calculateAccommodationTotal().toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="md:col-span-2 p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">Valor Total</h4>
                        <p className="text-sm text-muted-foreground">
                          Inclui espaço, serviços{includeAccommodation && selectedRooms.length > 0 && " e acomodações"}
                        </p>
                      </div>
                      <span className="text-3xl font-bold text-green-500">
                        R$ {calculateTotal().toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-foreground">Observações Finais</Label>
                  <Textarea
                    placeholder="Adicione observações ou requisitos especiais..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1.5 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Success Screen */}
            {step === 5 && (
              <div className="space-y-6">
                {/* Success Animation */}
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Evento Criado com Sucesso!</h3>
                  <p className="text-muted-foreground">Seu evento foi registrado em nosso sistema</p>
                </div>

                {/* Protocol Number */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Número do Protocolo</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-mono font-bold text-primary tracking-wider">
                        {protocol}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyProtocol}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Guarde este número para consultas futuras
                    </p>
                  </div>
                </div>

                {/* Notifications Sent */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Send className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Notificações Enviadas</p>
                      <p className="text-sm text-muted-foreground">
                        Confirmação enviada para {formData.contactEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event Summary */}
                <div className="p-5 rounded-xl bg-accent/30 border border-border">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Resumo do Evento
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Event Info */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {selectedTypeData && (
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedTypeData.color} flex items-center justify-center shrink-0`}>
                            <selectedTypeData.icon className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">{formData.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedTypeData?.label}</p>
                        </div>
                      </div>
                      
                      <div className="pl-13 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{new Date(formData.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{formData.startTime} às {formData.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{formData.guests} convidados</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{selectedSpaceData?.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Responsável</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-foreground">{formData.contactName}</p>
                        {formData.company && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{formData.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{formData.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{formData.contactEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  {selectedServices.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Serviços Contratados</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((serviceId) => {
                          const service = additionalServices.find(s => s.id === serviceId);
                          return (
                            <Badge key={serviceId} className="bg-primary/10 text-primary border-primary/30">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {service?.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accommodations */}
                  {includeAccommodation && selectedRooms.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="w-5 h-5 text-amber-500" />
                        <span className="font-medium text-foreground">Acomodações Vinculadas</span>
                        {accommodationDiscount > 0 && (
                          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
                            -{accommodationDiscount}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedRooms.map((roomId) => {
                          const room = availableRooms.find(r => r.id === roomId);
                          return (
                            <Badge key={roomId} variant="outline" className="border-amber-500/30">
                              <Home className="w-3 h-3 mr-1" />
                              {room?.number} - {room?.type}
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Check-in: {new Date(accommodationCheckIn).toLocaleDateString("pt-BR")} → Check-out: {new Date(accommodationCheckOut).toLocaleDateString("pt-BR")} ({calculateNights()} noites)
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {formData.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-1">Observações</p>
                      <p className="text-sm text-muted-foreground">{formData.notes}</p>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-2 border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">Valor Total do Evento</h4>
                      <p className="text-sm text-muted-foreground">
                        Inclui espaço, serviços{includeAccommodation && selectedRooms.length > 0 && " e acomodações"}
                      </p>
                    </div>
                    <span className="text-4xl font-bold text-green-500">
                      R$ {calculateTotal().toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar por Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-accent/20">
          <div className="flex items-center justify-between">
            {step < 5 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                >
                  {step > 1 ? "Voltar" : "Cancelar"}
                </Button>
                <div className="flex items-center gap-3">
                  {step < 4 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && !selectedType) ||
                        (step === 2 && (!formData.name || !formData.date || !formData.guests || !formData.contactName || !formData.contactPhone || !formData.contactEmail)) ||
                        (step === 3 && !selectedSpace)
                      }
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Criar Evento
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Button variant="outline" onClick={handleClose}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                    setTimeout(() => onOpenChange(true), 350);
                  }}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  <PartyPopper className="w-4 h-4 mr-2" />
                  Criar Novo Evento
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
