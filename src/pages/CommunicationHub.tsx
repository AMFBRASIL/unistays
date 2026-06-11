import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Clock,
  CheckCheck,
  Check,
  Image,
  Paperclip,
  Smile,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Bell,
  Settings,
  Plus,
  Bot,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  guest: {
    name: string;
    room: string;
    avatar?: string;
  };
  channel: "whatsapp" | "email" | "sms" | "chat";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "pending" | "resolved";
  priority: "high" | "medium" | "low";
}

interface Message {
  id: string;
  content: string;
  sender: "guest" | "hotel" | "bot";
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

const conversations: Conversation[] = [
  {
    id: "1",
    guest: { name: "Carlos Mendes", room: "Suite 501" },
    channel: "whatsapp",
    lastMessage: "Olá, gostaria de solicitar um late checkout amanhã",
    lastMessageTime: "14:32",
    unreadCount: 2,
    status: "pending",
    priority: "high"
  },
  {
    id: "2",
    guest: { name: "Ana Silva", room: "Quarto 305" },
    channel: "email",
    lastMessage: "Confirmação da reserva recebida. Obrigada!",
    lastMessageTime: "13:45",
    unreadCount: 0,
    status: "resolved",
    priority: "low"
  },
  {
    id: "3",
    guest: { name: "Roberto Santos", room: "Suite 402" },
    channel: "chat",
    lastMessage: "O ar condicionado do quarto não está funcionando",
    lastMessageTime: "12:20",
    unreadCount: 1,
    status: "active",
    priority: "high"
  },
  {
    id: "4",
    guest: { name: "Marina Costa", room: "Quarto 210" },
    channel: "sms",
    lastMessage: "Reserva confirmada para 20/12",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    status: "resolved",
    priority: "medium"
  },
];

const messages: Message[] = [
  { id: "1", content: "Olá, boa tarde!", sender: "guest", timestamp: "14:30", status: "read" },
  { id: "2", content: "Boa tarde! Como posso ajudá-lo?", sender: "hotel", timestamp: "14:31", status: "read" },
  { id: "3", content: "Gostaria de solicitar um late checkout amanhã, é possível?", sender: "guest", timestamp: "14:32", status: "read" },
  { id: "4", content: "Claro! Vou verificar a disponibilidade para o seu quarto. Um momento, por favor.", sender: "hotel", timestamp: "14:33", status: "delivered" },
];

const quickReplies = [
  "Bom dia! Como posso ajudá-lo?",
  "Obrigado pelo contato!",
  "Vou verificar isso para você.",
  "Sua solicitação foi registrada.",
  "Está disponível, confirmo?",
];

const channelConfig = {
  whatsapp: { icon: MessageCircle, color: "from-green-500 to-emerald-500", label: "WhatsApp" },
  email: { icon: Mail, color: "from-blue-500 to-cyan-500", label: "Email" },
  sms: { icon: Phone, color: "from-purple-500 to-pink-500", label: "SMS" },
  chat: { icon: MessageSquare, color: "from-amber-500 to-orange-500", label: "Chat" },
};

export default function CommunicationHub() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversation = conversations.find(c => c.id === selectedConversation);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const pendingConversations = conversations.filter(c => c.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hub de Comunicação</h1>
              <p className="text-muted-foreground">Central unificada de mensagens com hóspedes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Bot className="w-4 h-4" />
              Respostas Automáticas
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Zap className="w-4 h-4" />
              Broadcast
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Não Lidas</p>
                  <p className="text-2xl font-bold text-red-500">{totalUnread}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-500">{pendingConversations}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolvidas Hoje</p>
                  <p className="text-2xl font-bold text-emerald-500">24</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCheck className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold text-blue-500">8 min</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conversas</CardTitle>
                <Button variant="ghost" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[480px]">
                <div className="divide-y divide-border">
                  {conversations.map((conversation) => {
                    const channel = channelConfig[conversation.channel];
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={cn(
                          "w-full p-4 text-left hover:bg-accent/50 transition-colors",
                          selectedConversation === conversation.id && "bg-accent"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.guest.avatar} />
                              <AvatarFallback className={cn("bg-gradient-to-br text-white", channel.color)}>
                                {conversation.guest.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center",
                              channel.color
                            )}>
                              <channel.icon className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">{conversation.guest.name}</span>
                              <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">{conversation.guest.room}</p>
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={cn(
                          "bg-gradient-to-br text-white",
                          channelConfig[activeConversation.channel].color
                        )}>
                          {activeConversation.guest.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{activeConversation.guest.name}</h3>
                        <p className="text-sm text-muted-foreground">{activeConversation.guest.room} • {channelConfig[activeConversation.channel].label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        activeConversation.status === "pending" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        activeConversation.status === "active" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        activeConversation.status === "resolved" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {activeConversation.status === "pending" ? "Pendente" : activeConversation.status === "active" ? "Ativo" : "Resolvido"}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.sender === "hotel" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              message.sender === "hotel"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : message.sender === "bot"
                                ? "bg-purple-500/10 text-purple-500 rounded-bl-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={cn(
                              "flex items-center justify-end gap-1 mt-1",
                              message.sender === "hotel" ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              <span className="text-xs">{message.timestamp}</span>
                              {message.sender === "hotel" && (
                                message.status === "read" ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-border">
                  <ScrollArea className="w-full">
                    <div className="flex items-center gap-2">
                      {quickReplies.map((reply, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => setMessageInput(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button className="gap-2">
                      <Send className="w-4 h-4" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                  <p className="text-muted-foreground">Escolha uma conversa da lista para começar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
