import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Video,
  Monitor,
  Phone,
  MapPin,
  Users,
  Star,
  Shield,
  Zap,
  Globe,
  Copy,
  Printer,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, label: "Data", icon: CalendarDays },
  { id: 2, label: "Horário", icon: Clock },
  { id: 3, label: "Dados", icon: User },
  { id: 4, label: "Confirmação", icon: CheckCircle2 },
];

const demoTypes = [
  {
    id: "video",
    label: "Videoconferência",
    description: "Google Meet ou Zoom",
    icon: Video,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "screen",
    label: "Compartilhamento de Tela",
    description: "Acesso remoto guiado",
    icon: Monitor,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "phone",
    label: "Ligação Telefônica",
    description: "Chamada com suporte visual",
    icon: Phone,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "presencial",
    label: "Presencial",
    description: "Visita ao nosso escritório",
    icon: MapPin,
    color: "from-amber-500 to-orange-500",
  },
];

const timeSlots = [
  { time: "09:00", period: "Manhã" },
  { time: "09:30", period: "Manhã" },
  { time: "10:00", period: "Manhã" },
  { time: "10:30", period: "Manhã" },
  { time: "11:00", period: "Manhã" },
  { time: "11:30", period: "Manhã" },
  { time: "14:00", period: "Tarde" },
  { time: "14:30", period: "Tarde" },
  { time: "15:00", period: "Tarde" },
  { time: "15:30", period: "Tarde" },
  { time: "16:00", period: "Tarde" },
  { time: "16:30", period: "Tarde" },
  { time: "17:00", period: "Tarde" },
];

const hotelSizes = [
  { value: "small", label: "Até 30 quartos" },
  { value: "medium", label: "31 a 100 quartos" },
  { value: "large", label: "101 a 300 quartos" },
  { value: "xlarge", label: "Mais de 300 quartos" },
  { value: "chain", label: "Rede hoteleira" },
];

const interests = [
  "PMS Completo",
  "Channel Manager",
  "Motor de Reservas",
  "Revenue Management",
  "Gestão Financeira",
  "Governança",
  "CRM & Fidelidade",
  "Automação",
];

const tips: Record<number, { title: string; text: string }> = {
  1: {
    title: "Escolha a melhor data",
    text: "Selecione uma data em dias úteis para melhor disponibilidade. Recomendamos agendar com pelo menos 2 dias de antecedência.",
  },
  2: {
    title: "Horários disponíveis",
    text: "Os horários em verde são os mais recomendados com menor ocupação. A demo dura aproximadamente 30 minutos.",
  },
  3: {
    title: "Seus dados",
    text: "Quanto mais informações você fornecer, mais personalizada será a demonstração para as necessidades do seu hotel.",
  },
  4: {
    title: "Tudo pronto!",
    text: "Revise as informações e confirme seu agendamento. Você receberá um email de confirmação com o link da reunião.",
  },
};

// Simulate some unavailable slots
const unavailableSlots = ["09:00", "11:00", "14:30"];

export function ScheduleDemoModal({ open, onOpenChange }: ScheduleDemoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("video");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    hotelSize: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState("");

  const progress = (currentStep / steps.length) * 100;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedDate && !!selectedType;
      case 2:
        return !!selectedTime;
      case 3:
        return !!formData.name && !!formData.email && !!formData.phone && !!formData.company;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    const proto = `AGD-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setProtocol(proto);
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Agendamento confirmado com sucesso!");
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedType("video");
    setSelectedInterests([]);
    setFormData({ name: "", email: "", phone: "", company: "", hotelSize: "", role: "", message: "" });
    setSubmitted(false);
    setProtocol("");
  };

  const handleClose = (val: boolean) => {
    if (!val) resetModal();
    onOpenChange(val);
  };

  const selectedTypeInfo = demoTypes.find((t) => t.id === selectedType);

  // ──── Success Screen ────
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
            <p className="text-emerald-100">Protocolo: {protocol}</p>
          </div>
          <div className="p-8">
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border">
                <div className="text-xs text-slate-500 mb-1">Data e Horário</div>
                <div className="font-semibold text-slate-900">
                  {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                <div className="text-sm text-slate-600">às {selectedTime}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <div className="text-xs text-slate-500 mb-1">Formato</div>
                <div className="font-semibold text-slate-900">{selectedTypeInfo?.label}</div>
                <div className="text-sm text-slate-600">{selectedTypeInfo?.description}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <div className="text-xs text-slate-500 mb-1">Contato</div>
                <div className="font-semibold text-slate-900">{formData.name}</div>
                <div className="text-sm text-slate-600">{formData.email}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border">
                <div className="text-xs text-slate-500 mb-1">Empresa</div>
                <div className="font-semibold text-slate-900">{formData.company}</div>
                <div className="text-sm text-slate-600">{formData.phone}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(protocol)}>
                <Copy className="w-4 h-4 mr-1.5" /> Copiar Protocolo
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" /> Imprimir
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => { resetModal(); }}
              >
                Novo Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden max-h-[90vh]">
        <div className="flex h-[80vh]">
          {/* ──── Sidebar ──── */}
          <div className="hidden md:flex w-72 flex-col bg-gradient-to-b from-blue-600 via-indigo-600 to-violet-700 text-white relative overflow-hidden flex-shrink-0">
            {/* Hero image */}
            <div className="h-36 relative">
              <img src="/pwa-512x512.svg" alt="Scheduling" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600" />
              <div className="absolute bottom-4 left-5 right-5">
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  <CalendarDays className="w-3 h-3 mr-1" /> Agendar Demo
                </Badge>
                <h3 className="font-bold text-lg leading-tight">Demonstração Personalizada</h3>
              </div>
            </div>

            {/* Progress */}
            <div className="px-5 py-4">
              <div className="flex justify-between text-xs text-blue-200 mb-1.5">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="px-5 space-y-1 flex-1">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isDone = step.id < currentStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                      isActive && "bg-white/20 shadow-lg",
                      isDone && "opacity-80 hover:bg-white/10 cursor-pointer",
                      !isActive && !isDone && "opacity-40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
                        isActive && "bg-white text-blue-600",
                        isDone && "bg-white/30 text-white",
                        !isActive && !isDone && "bg-white/10 text-white/60"
                      )}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{step.label}</div>
                      <div className="text-[10px] text-blue-200">
                        Etapa {step.id} de {steps.length}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="m-4 p-3 rounded-xl bg-white/10 border border-white/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-xs font-semibold text-yellow-200">{tips[currentStep]?.title}</span>
              </div>
              <p className="text-[11px] text-blue-100 leading-relaxed">{tips[currentStep]?.text}</p>
            </div>
          </div>

          {/* ──── Content ──── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile header */}
            <div className="md:hidden p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="font-bold">Agendar Demo — Etapa {currentStep}/{steps.length}</h3>
              <div className="h-1 bg-white/20 rounded-full mt-2">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 md:p-8">
                {/* ──── Step 1: Data & Tipo ──── */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Escolha a Data</h2>
                      <p className="text-slate-500">Selecione a data e o formato da demonstração</p>
                    </div>

                    {/* Demo Type */}
                    <div>
                      <Label className="text-slate-700 font-semibold mb-3 block">Formato da Demo</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {demoTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              selectedType === type.id
                                ? "border-blue-500 bg-blue-50 shadow-md"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2", type.color)}>
                              <type.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="font-semibold text-sm text-slate-900">{type.label}</div>
                            <div className="text-xs text-slate-500">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calendar */}
                    <div>
                      <Label className="text-slate-700 font-semibold mb-3 block">Data Desejada</Label>
                      <div className="border rounded-xl p-2 bg-white shadow-sm inline-block">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const day = date.getDay();
                            return day === 0 || day === 6 || date < new Date();
                          }}
                          locale={ptBR}
                          className="pointer-events-auto"
                        />
                      </div>
                      {selectedDate && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ──── Step 2: Horário ──── */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Escolha o Horário</h2>
                      <p className="text-slate-500">
                        Horários disponíveis para{" "}
                        {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" /> Disponível
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500" /> Selecionado
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-300" /> Indisponível
                      </span>
                    </div>

                    {["Manhã", "Tarde"].map((period) => (
                      <div key={period}>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" /> {period}
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeSlots
                            .filter((s) => s.period === period)
                            .map((slot) => {
                              const unavailable = unavailableSlots.includes(slot.time);
                              const isSelected = selectedTime === slot.time;
                              return (
                                <button
                                  key={slot.time}
                                  disabled={unavailable}
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={cn(
                                    "py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all",
                                    unavailable && "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
                                    isSelected && "bg-blue-600 border-blue-600 text-white shadow-lg scale-105",
                                    !unavailable && !isSelected && "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                  )}
                                >
                                  {slot.time}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}

                    {selectedTime && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {selectedDate && format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                            </div>
                            <div className="text-sm text-slate-500">Duração estimada: 30 minutos</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ──── Step 3: Dados ──── */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Seus Dados</h2>
                      <p className="text-slate-500">Preencha suas informações para personalizar a demo</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Nome completo *</Label>
                        <Input
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Email *</Label>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Telefone *</Label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Hotel / Empresa *</Label>
                        <Input
                          placeholder="Nome do hotel"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Tamanho do Hotel</Label>
                        <Select value={formData.hotelSize} onValueChange={(v) => setFormData({ ...formData, hotelSize: v })}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotelSizes.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Seu cargo</Label>
                        <Input
                          placeholder="Ex: Gerente Geral"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Interests */}
                    <div>
                      <Label className="text-slate-700 font-semibold mb-3 block">Áreas de Interesse</Label>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                              selectedInterests.includes(interest)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                            )}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">Observações adicionais</Label>
                      <Textarea
                        placeholder="Conte-nos mais sobre suas necessidades..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* ──── Step 4: Confirmação ──── */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirmar Agendamento</h2>
                      <p className="text-slate-500">Revise todas as informações antes de confirmar</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CalendarDays className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-slate-900">Data & Horário</span>
                        </div>
                        <div className="text-sm text-slate-700">
                          {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                        <div className="text-lg font-bold text-blue-600">{selectedTime}</div>
                        <div className="text-xs text-slate-500 mt-1">Duração: ~30 minutos</div>
                      </div>

                      <div className="p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                        <div className="flex items-center gap-2 mb-3">
                          {selectedTypeInfo && <selectedTypeInfo.icon className="w-5 h-5 text-violet-600" />}
                          <span className="font-semibold text-slate-900">Formato</span>
                        </div>
                        <div className="font-bold text-slate-900">{selectedTypeInfo?.label}</div>
                        <div className="text-sm text-slate-500">{selectedTypeInfo?.description}</div>
                      </div>

                      <div className="p-5 rounded-xl bg-slate-50 border sm:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-slate-600" />
                          <span className="font-semibold text-slate-900">Dados do Contato</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-500">Nome:</span> <span className="font-medium">{formData.name}</span></div>
                          <div><span className="text-slate-500">Email:</span> <span className="font-medium">{formData.email}</span></div>
                          <div><span className="text-slate-500">Telefone:</span> <span className="font-medium">{formData.phone}</span></div>
                          <div><span className="text-slate-500">Empresa:</span> <span className="font-medium">{formData.company}</span></div>
                          {formData.role && <div><span className="text-slate-500">Cargo:</span> <span className="font-medium">{formData.role}</span></div>}
                          {formData.hotelSize && (
                            <div>
                              <span className="text-slate-500">Tamanho:</span>{" "}
                              <span className="font-medium">{hotelSizes.find(s => s.value === formData.hotelSize)?.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedInterests.length > 0 && (
                      <div>
                        <Label className="text-slate-700 font-semibold mb-2 block">Áreas de Interesse</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedInterests.map((i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-700 border-blue-200">{i}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.message && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <Label className="text-amber-800 font-semibold text-xs block mb-1">Observações</Label>
                        <p className="text-sm text-amber-700">{formData.message}</p>
                      </div>
                    )}

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
                      <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div className="text-sm text-emerald-700">
                        <span className="font-semibold">Email de confirmação</span> será enviado para{" "}
                        <span className="font-medium">{formData.email}</span> com o link da reunião e detalhes.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* ──── Footer ──── */}
            <div className="border-t p-4 flex items-center justify-between bg-white">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
              </Button>
              <div className="flex items-center gap-1.5">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      s.id === currentStep ? "bg-blue-600 w-6" : s.id < currentStep ? "bg-blue-400" : "bg-slate-300"
                    )}
                  />
                ))}
              </div>
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Próximo <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  {isSubmitting ? "Confirmando..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirmar
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
