import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Bot, 
  Settings, 
  Zap, 
  Clock, 
  CheckCircle2,
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Plus,
  Trash2,
  Edit2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GuestChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultResponses = [
  {
    id: 1,
    trigger: "horário check-in",
    response: "O check-in é a partir das 14h e o check-out até às 12h. Precisa de horário diferenciado? Consulte disponibilidade!",
    category: "operacional"
  },
  {
    id: 2,
    trigger: "estacionamento",
    response: "Sim! Oferecemos estacionamento gratuito para hóspedes. Basta informar a placa do veículo no check-in.",
    category: "serviços"
  },
  {
    id: 3,
    trigger: "café da manhã",
    response: "Nosso café da manhã é servido das 6h30 às 10h no restaurante do lobby. Está incluso na sua reserva!",
    category: "serviços"
  },
  {
    id: 4,
    trigger: "wi-fi",
    response: "O Wi-Fi é gratuito em todas as áreas. Rede: HOTEL_GUEST | Senha: disponível na recepção ou no cartão do quarto.",
    category: "operacional"
  },
  {
    id: 5,
    trigger: "cancelamento",
    response: "Cancelamentos podem ser feitos até 48h antes do check-in sem cobrança. Após esse prazo, será cobrada a primeira diária.",
    category: "políticas"
  }
];

const chatHistory = [
  { role: "guest", message: "Olá, qual horário do check-in?", time: "14:32" },
  { role: "bot", message: "O check-in é a partir das 14h e o check-out até às 12h. Precisa de horário diferenciado? Consulte disponibilidade!", time: "14:32" },
  { role: "guest", message: "Tem estacionamento?", time: "14:33" },
  { role: "bot", message: "Sim! Oferecemos estacionamento gratuito para hóspedes. Basta informar a placa do veículo no check-in.", time: "14:33" },
];

export default function GuestChatbotModal({ open, onOpenChange }: GuestChatbotModalProps) {
  const { toast } = useToast();
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [responses, setResponses] = useState(defaultResponses);
  const [testMessage, setTestMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const handleTestMessage = () => {
    if (!testMessage.trim()) return;
    
    const match = responses.find(r => 
      testMessage.toLowerCase().includes(r.trigger.toLowerCase())
    );
    
    if (match) {
      setAiResponse(match.response);
    } else {
      setAiResponse("Não encontrei uma resposta automática para essa pergunta. Um atendente humano será notificado.");
    }
  };

  const stats = {
    totalMessages: 1247,
    autoResolved: 892,
    avgResponseTime: "< 3s",
    satisfaction: 94
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-slate-900 border-white/10">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">Chatbot para Hóspedes</DialogTitle>
              <p className="text-sm text-slate-400">Responda dúvidas automaticamente via WhatsApp</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Status e Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <MessageCircle className="h-4 w-4" />
                    Mensagens (7d)
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Auto-resolvidas
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{Math.round((stats.autoResolved / stats.totalMessages) * 100)}%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    Tempo Resposta
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{stats.avgResponseTime}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Sparkles className="h-4 w-4" />
                    Satisfação
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{stats.satisfaction}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Toggle do Chatbot */}
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${chatbotEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <div>
                      <p className="font-medium text-white">Chatbot Ativo</p>
                      <p className="text-sm text-slate-400">Respostas automáticas 24/7</p>
                    </div>
                  </div>
                  <Switch checked={chatbotEnabled} onCheckedChange={setChatbotEnabled} />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="responses" className="space-y-4">
              <TabsList className="bg-slate-800/50 border border-white/10">
                <TabsTrigger value="responses" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Respostas
                </TabsTrigger>
                <TabsTrigger value="test" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  <Zap className="h-4 w-4 mr-2" />
                  Testar
                </TabsTrigger>
                <TabsTrigger value="channels" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
                  <Globe className="h-4 w-4 mr-2" />
                  Canais
                </TabsTrigger>
              </TabsList>

              <TabsContent value="responses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-400">Configure respostas automáticas para perguntas frequentes</p>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Resposta
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {responses.map((response) => (
                    <Card key={response.id} className="bg-slate-800/30 border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                                {response.category}
                              </Badge>
                              <span className="text-sm text-slate-400">Gatilho:</span>
                              <code className="text-sm bg-slate-700/50 px-2 py-0.5 rounded text-amber-400">
                                {response.trigger}
                              </code>
                            </div>
                            <p className="text-sm text-slate-300">{response.response}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <Card className="bg-slate-800/30 border-white/5">
                  <CardContent className="p-4 space-y-4">
                    <Label className="text-slate-300">Simular mensagem do hóspede</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                        placeholder="Digite uma pergunta para testar..."
                        className="bg-slate-700/50 border-white/10 text-white"
                      />
                      <Button onClick={handleTestMessage} className="bg-emerald-600 hover:bg-emerald-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {aiResponse && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-400">Resposta do Bot</span>
                        </div>
                        <p className="text-slate-300">{aiResponse}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chat History Preview */}
                <Card className="bg-slate-800/30 border-white/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-400 mb-3">Histórico recente de conversas</p>
                    <div className="space-y-3">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'guest' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'guest' 
                              ? 'bg-slate-700/50 text-slate-200' 
                              : 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/20'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="channels" className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { name: "WhatsApp", icon: Phone, connected: true, messages: 856 },
                    { name: "E-mail", icon: Mail, connected: true, messages: 312 },
                    { name: "Website Chat", icon: Globe, connected: false, messages: 0 }
                  ].map((channel) => (
                    <Card key={channel.name} className="bg-slate-800/30 border-white/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              channel.connected ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                            }`}>
                              <channel.icon className={`h-5 w-5 ${channel.connected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <p className="font-medium text-white">{channel.name}</p>
                              <p className="text-sm text-slate-400">
                                {channel.connected ? `${channel.messages} mensagens processadas` : 'Não conectado'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant={channel.connected ? "outline" : "default"}
                            size="sm"
                            className={channel.connected 
                              ? "border-white/10 text-slate-300" 
                              : "bg-emerald-600 hover:bg-emerald-700"
                            }
                          >
                            {channel.connected ? 'Configurar' : 'Conectar'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
