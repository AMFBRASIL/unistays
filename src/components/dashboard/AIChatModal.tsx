import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, TrendingUp, CalendarCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickQuestions = [
  { icon: Wallet, text: "Como foi meu faturamento hoje?" },
  { icon: CalendarCheck, text: "Quantas reservas tenho para amanhã?" },
  { icon: TrendingUp, text: "Qual a taxa de ocupação desta semana?" },
  { icon: Lightbulb, text: "Sugestões para aumentar o RevPAR" },
];

const mockResponses: Record<string, string> = {
  "como foi meu faturamento hoje?": "📊 **Faturamento de Hoje**\n\nSeu faturamento até agora foi de **R$ 12.450,00**, um aumento de 15% em relação ao mesmo dia da semana passada.\n\n• **Check-ins realizados:** 8\n• **Check-outs:** 5\n• **Vendas PDV:** R$ 890,00\n• **Receita de hospedagem:** R$ 11.560,00\n\n💡 *Dica: Os quartos Premium tiveram maior demanda hoje. Considere ajustar os preços para o fim de semana.*",
  "quantas reservas tenho para amanhã?": "📅 **Reservas para Amanhã**\n\nVocê tem **12 reservas** confirmadas para check-in amanhã:\n\n• **8 quartos Standard** (6 ocupados)\n• **3 quartos Premium** (todos ocupados)\n• **1 Suíte Master**\n\n⚠️ *Atenção: 2 hóspedes solicitaram early check-in às 10h.*\n\n**Taxa de ocupação prevista:** 87%",
  "qual a taxa de ocupação desta semana?": "📈 **Taxa de Ocupação - Esta Semana**\n\n**Média geral:** 82%\n\n| Dia | Ocupação |\n|-----|----------|\n| Segunda | 75% |\n| Terça | 78% |\n| Quarta | 85% |\n| Quinta | 88% |\n| Sexta | 92% |\n| Sábado | 95% |\n| Domingo | 72% |\n\n📊 *Comparado com a semana anterior, houve um aumento de 8% na ocupação média.*",
  "sugestões para aumentar o revpar": "💡 **Sugestões para Aumentar o RevPAR**\n\n1. **Ajuste dinâmico de preços**\n   - Aumente 15% nos finais de semana de alta demanda\n   - Ofereça desconto de 10% para reservas com 7+ dias de antecedência\n\n2. **Pacotes e upselling**\n   - Crie pacotes com café da manhã (+R$ 45/diária)\n   - Ofereça upgrade de quarto por R$ 50 adicional\n\n3. **Otimize canais de venda**\n   - Reduza comissões priorizando reservas diretas\n   - Incentive retorno com programa de fidelidade\n\n📊 *Implementando essas ações, estimamos aumento de 18% no RevPAR em 30 dias.*",
};

export function AIChatModal({ open, onOpenChange }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou o assistente de IA do HotelFlow. Posso ajudá-lo com informações sobre faturamento, reservas, ocupação e sugestões para otimizar sua operação. Como posso ajudar?",
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

    // Simulate AI response
    setTimeout(() => {
      const lowerText = messageText.toLowerCase();
      let response = "Entendi sua pergunta! No momento estou processando as informações do seu hotel. Em breve terei uma resposta completa para você.\n\n💡 *Esta é uma demonstração do chat com IA. Em produção, as respostas serão geradas em tempo real com dados reais do seu sistema.*";
      
      for (const [key, value] of Object.entries(mockResponses)) {
        if (lowerText.includes(key) || key.includes(lowerText.slice(0, 20))) {
          response = value;
          break;
        }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 via-accent/10 to-transparent flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Assistente IA HotelFlow
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pergunte sobre faturamento, reservas, ocupação e mais
              </p>
            </div>
          </div>
        </DialogHeader>

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
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/50 border border-border rounded-bl-md"
                  )}
                >
                  <div className={cn(
                    "text-sm whitespace-pre-wrap",
                    message.role === "assistant" && "prose prose-sm dark:prose-invert max-w-none"
                  )}>
                    {message.content.split('\n').map((line, i) => {
                      // Bold text
                      let formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                      // Italic text
                      formattedLine = formattedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
                      
                      return (
                        <p 
                          key={i} 
                          className={cn(
                            "mb-1 last:mb-0",
                            line.startsWith('•') && "ml-2",
                            line.startsWith('|') && "font-mono text-xs"
                          )}
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })}
                  </div>
                  <p className={cn(
                    "text-xs mt-2 opacity-60",
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analisando dados...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-3">Perguntas frequentes:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-auto py-2 px-3 text-left"
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
        <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="gap-2 bg-gradient-primary hover:opacity-90"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by HotelFlow AI • Respostas baseadas nos dados do seu hotel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
