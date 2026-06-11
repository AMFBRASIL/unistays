import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  Clock,
  UtensilsCrossed,
  Wifi,
  Car,
  Flower2,
  Dumbbell,
  MapPin,
  Phone,
  Coffee,
  Waves,
  X,
} from "lucide-react";

interface ConciergeMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ConciergeAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestName?: string;
}

const quickQuestions = [
  { icon: UtensilsCrossed, text: "Horários do restaurante" },
  { icon: Wifi, text: "Senha do Wi-Fi" },
  { icon: Flower2, text: "Agendar spa" },
  { icon: Car, text: "Solicitar transfer" },
  { icon: Coffee, text: "Pedir room service" },
  { icon: Dumbbell, text: "Horário da academia" },
];

const mockResponses: Record<string, string> = {
  "horários do restaurante": "🍽️ **Restaurante Panorama**\n\n• **Café da manhã:** 6h30 às 10h30\n• **Almoço:** 12h às 15h\n• **Jantar:** 19h às 23h\n\n**Especialidade do dia:** Menu Degustação com 5 pratos harmonizados.\n\n💡 *Dica: Reserve sua mesa pelo app ou comigo para garantir o melhor lugar!*",
  
  "senha do wi-fi": "📶 **Conexão Wi-Fi**\n\n**Rede:** UniStays_Guest\n**Senha:** BemVindo2024\n\n• Velocidade: 300 Mbps\n• Suporte a streaming 4K\n• Dispositivos ilimitados\n\n💡 *Caso tenha problemas de conexão, me avise que aciono o suporte técnico.*",
  
  "agendar spa": "🧘 **Spa & Wellness Center**\n\n**Horário:** 8h às 21h\n\n**Tratamentos populares:**\n• Massagem Relaxante (60min) - R$ 280\n• Day Spa Completo - R$ 450\n• Banho de Ofurô - R$ 180\n\n**Horários disponíveis hoje:**\n• 14h, 16h, 18h\n\n📅 Posso agendar para você agora! Qual horário prefere?",
  
  "solicitar transfer": "🚗 **Serviço de Transfer**\n\n**Opções disponíveis:**\n• Sedan Executivo - R$ 120\n• Van (até 6 pessoas) - R$ 180\n• SUV Premium - R$ 200\n\n**Destinos frequentes:**\n• Aeroporto: 40 min\n• Centro: 15 min\n• Shopping: 10 min\n\n📍 Para qual destino e horário você precisa?",
  
  "pedir room service": "🛎️ **Room Service 24h**\n\n**Menu disponível agora:**\n\n**Lanches rápidos:**\n• Club Sandwich - R$ 42\n• Hambúrguer Artesanal - R$ 55\n\n**Pratos principais:**\n• Salmão Grelhado - R$ 78\n• Risoto de Funghi - R$ 65\n\n**Bebidas:**\n• Sucos naturais - R$ 18\n• Vinhos - a partir de R$ 95\n\n🍽️ O que gostaria de pedir?",
  
  "horário da academia": "💪 **Academia & Fitness**\n\n**Horário:** 6h às 22h\n\n**Equipamentos:**\n• Esteiras e bikes\n• Musculação completa\n• Área de alongamento\n• Sala de yoga\n\n**Aulas coletivas hoje:**\n• 7h - Yoga\n• 9h - Funcional\n• 18h - Spinning\n\n🏋️ Toalhas e água disponíveis no local!",
  
  "piscina": "🏊 **Área de Piscinas**\n\n**Piscina Principal:**\n• Horário: 7h às 22h\n• Temperatura: 28°C\n• Bar aquático disponível\n\n**Piscina Aquecida (coberta):**\n• Horário: 6h às 23h\n• Temperatura: 32°C\n\n🌅 *Dica: O pôr do sol da piscina rooftop é imperdível!*",
  
  "café da manhã": "☕ **Café da Manhã Buffet**\n\n**Horário:** 6h30 às 10h30\n**Local:** Restaurante Panorama - Térreo\n\n**Destaques:**\n• Frutas frescas e sucos naturais\n• Estação de ovos ao vivo\n• Pães artesanais\n• Tapiocas personalizadas\n• Frios e queijos especiais\n\n🥐 *Café incluído na sua diária!*",
  
  "checkout": "📋 **Informações de Check-out**\n\n**Horário padrão:** até 12h\n\n**Opções disponíveis:**\n• Late check-out 14h - R$ 100\n• Late check-out 16h - R$ 180\n• Day use até 18h - R$ 280\n\n💼 Podemos guardar sua bagagem gratuitamente após o check-out.\n\n❓ Deseja solicitar late check-out?",
  
  "estacionamento": "🚗 **Estacionamento**\n\n**Valet parking:** R$ 50/dia\n**Autoatendimento:** R$ 35/dia\n\n**Horário:** 24 horas\n**Vagas:** Cobertas e com segurança\n\n✅ *Para hóspedes, o manobrista está incluído!*",
};

export function ConciergeAIModal({ open, onOpenChange, guestName }: ConciergeAIModalProps) {
  const [messages, setMessages] = useState<ConciergeMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá${guestName ? `, ${guestName}` : ""}! 👋\n\nSou a **Assistente UniStays**, sua concierge virtual 24 horas.\n\nComo posso ajudá-lo(a) hoje? Posso responder sobre restaurantes, spa, room service, transfer e muito mais!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset messages when modal opens
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Olá${guestName ? `, ${guestName}` : ""}! 👋\n\nSou a **Assistente UniStays**, sua concierge virtual 24 horas.\n\nComo posso ajudá-lo(a) hoje? Posso responder sobre restaurantes, spa, room service, transfer e muito mais!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, guestName]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ConciergeMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerText = messageText.toLowerCase();
      let response = "Entendi sua solicitação! 😊\n\nVou verificar isso para você. Enquanto processo a informação, posso ajudar com algo mais?\n\n💡 *Esta é uma demonstração. Em produção, as respostas serão geradas com IA em tempo real.*";
      
      // Check for matching responses
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerText.includes(key) || key.split(" ").some(word => lowerText.includes(word))) {
          response = value;
          break;
        }
      }

      const aiMessage: ConciergeMessage = {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 bg-gradient-to-r from-primary/20 via-accent/20 to-transparent flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Assistente UniStays
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                    Online 24h
                  </Badge>
                  <span className="text-white/50 text-sm">• Concierge IA</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white/10 border border-white/10 text-white rounded-bl-md"
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content.split('\n').map((line, i) => {
                      // Bold text
                      let formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                      // Italic text
                      formattedLine = formattedLine.replace(/\*(.+?)\*/g, '<em class="opacity-80">$1</em>');
                      
                      return (
                        <p 
                          key={i} 
                          className={cn(
                            "mb-1 last:mb-0",
                            line.startsWith('•') && "ml-2"
                          )}
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })}
                  </div>
                  <p className={cn(
                    "text-xs mt-2",
                    message.role === "user" ? "text-white/60 text-right" : "text-white/40"
                  )}>
                    {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analisando sua solicitação...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex-shrink-0">
            <p className="text-xs text-white/40 mb-3">Perguntas frequentes:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-auto py-2.5 px-3 text-left bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => handleSend(q.text)}
                >
                  <q.icon className="w-4 h-4 shrink-0 text-primary" />
                  <span className="text-xs truncate">{q.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-3 h-3 text-primary/60" />
            <p className="text-xs text-white/40">
              Assistente IA UniStays • Atendimento inteligente 24h
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}