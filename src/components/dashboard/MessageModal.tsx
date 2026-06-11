import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Send,
  User,
  BedDouble,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Users,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Channel = "whatsapp" | "email" | "sms";

const guests = [
  { id: "G001", name: "Carlos Mendes", room: "Suite Master 501", phone: "(11) 98765-4321", email: "carlos@email.com", status: "in_house" },
  { id: "G002", name: "Ana Paula Silva", room: "Quarto Luxo 305", phone: "(11) 91234-5678", email: "ana@email.com", status: "in_house" },
  { id: "G003", name: "Roberto Almeida", room: "Apartamento 202", phone: "(21) 99876-5432", email: "roberto@email.com", status: "arriving" },
  { id: "G004", name: "Maria Santos", room: "Quarto Standard 102", phone: "(31) 98765-1234", email: "maria@email.com", status: "in_house" },
];

const messageTemplates = [
  { id: "T001", name: "Boas-vindas", message: "Olá {nome}! Seja bem-vindo ao nosso hotel. Estamos felizes em recebê-lo! 🎉" },
  { id: "T002", name: "Check-out Reminder", message: "Olá {nome}, lembramos que seu check-out é amanhã às 12h. Precisa de auxílio com a bagagem?" },
  { id: "T003", name: "Avaliação", message: "Olá {nome}! Como está sendo sua experiência conosco? Adoraríamos saber sua opinião. ⭐" },
  { id: "T004", name: "Promoção", message: "Olá {nome}! Temos uma oferta especial para você: 20% de desconto em sua próxima reserva! 🎁" },
];

const recentConversations = [
  { id: "C001", guest: "Carlos Mendes", lastMessage: "Obrigado pela informação!", time: "10:30", unread: 0, channel: "whatsapp" },
  { id: "C002", guest: "Ana Paula Silva", lastMessage: "Podem enviar toalhas extras?", time: "09:45", unread: 2, channel: "whatsapp" },
  { id: "C003", guest: "Roberto Almeida", lastMessage: "Confirmação de reserva", time: "Ontem", unread: 0, channel: "email" },
];

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export function MessageModal({ open, onOpenChange }: MessageModalProps) {
  const [activeTab, setActiveTab] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const filteredGuests = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleGuest = (id: string) => {
    setSelectedGuests((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const applyTemplate = (template: typeof messageTemplates[0]) => {
    setSelectedTemplate(template.id);
    setMessage(template.message);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newFile: AttachedFile = { file, type };
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newFile.preview = reader.result as string;
          setAttachedFiles((prev) => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) => [...prev, newFile]);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    setIsSending(true);
    
    // Simulate sending (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSending(false);
    setShowSuccess(true);
    
    // Show success for 2 seconds then close
    setTimeout(() => {
      setShowSuccess(false);
      setMessage("");
      setSelectedGuests([]);
      setSelectedTemplate(null);
      setAttachedFiles([]);
      onOpenChange(false);
    }, 2000);
  };

  const resetModal = () => {
    setIsSending(false);
    setShowSuccess(false);
    setMessage("");
    setSelectedGuests([]);
    setSelectedTemplate(null);
    setAttachedFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!isSending && !showSuccess) {
        if (!open) resetModal();
        onOpenChange(open);
      }
    }}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Processing/Success Overlay */}
        {(isSending || showSuccess) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg">
            {isSending ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Enviando mensagem...</h3>
                  <p className="text-muted-foreground mt-1">
                    Aguarde enquanto processamos o envio para {selectedGuests.length} destinatário(s)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-600">Mensagem enviada!</h3>
                  <p className="text-muted-foreground mt-1">
                    Sua mensagem foi enviada com sucesso via {channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'E-mail' : 'SMS'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Header */}
        <DialogHeader className="p-0 flex-shrink-0">
          <div className="relative bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 p-6 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Central de Mensagens</DialogTitle>
                <DialogDescription className="text-white/80 mt-1">Comunique-se com seus hóspedes de forma rápida</DialogDescription>
              </div>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-4 mt-4">
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70">Hóspedes Ativos</p>
                <p className="text-lg font-bold text-white">{guests.filter(g => g.status === 'in_house').length}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <p className="text-xs text-white/70">Não Lidas</p>
                <p className="text-lg font-bold text-white">{recentConversations.reduce((acc, c) => acc + c.unread, 0)}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Panel - Conversations/Guests */}
          <div className="w-80 border-r border-border flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 py-2">
                <TabsTrigger value="new" className="data-[state=active]:bg-primary/10">
                  <Plus className="w-4 h-4 mr-1" />
                  Nova
                </TabsTrigger>
                <TabsTrigger value="conversations" className="data-[state=active]:bg-primary/10">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Conversas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="flex-1 mt-0">
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar hóspede..."
                      className="pl-9 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-2 pb-4">
                    {filteredGuests.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => toggleGuest(guest.id)}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all",
                          selectedGuests.includes(guest.id)
                            ? "border-blue-500 bg-blue-500/5"
                            : "border-border hover:border-blue-500/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                            {guest.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{guest.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{guest.room}</p>
                          </div>
                          {selectedGuests.includes(guest.id) && (
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="conversations" className="flex-1 mt-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-1 p-2">
                    {recentConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                              {conv.guest.split(' ').map(n => n[0]).join('')}
                            </div>
                            {conv.channel === 'whatsapp' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Phone className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{conv.guest}</p>
                              <span className="text-xs text-muted-foreground">{conv.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unread > 0 && (
                            <Badge className="bg-blue-500 text-white">{conv.unread}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Message Composer */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="p-6 pb-24 space-y-6">
                {/* Selected Recipients */}
                {selectedGuests.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Destinatários ({selectedGuests.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuests.map((id) => {
                        const guest = guests.find((g) => g.id === id);
                        return guest ? (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {guest.name}
                            <button
                              onClick={() => toggleGuest(id)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Channel Selection */}
                <div>
                  <Label className="mb-3 block">Canal de Envio</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "whatsapp", label: "WhatsApp", icon: Phone, color: "from-green-500 to-emerald-500" },
                      { id: "email", label: "E-mail", icon: Mail, color: "from-blue-500 to-cyan-500" },
                      { id: "sms", label: "SMS", icon: MessageCircle, color: "from-purple-500 to-pink-500" },
                    ].map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => setChannel(ch.id as Channel)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                          channel === ch.id
                            ? "border-blue-500 bg-blue-500/5"
                            : "border-border hover:border-blue-500/50"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br mx-auto mb-2 flex items-center justify-center", ch.color)}>
                          <ch.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-medium">{ch.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Templates */}
                <div>
                  <Label className="mb-3 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Templates Rápidos
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {messageTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          selectedTemplate === template.id
                            ? "border-amber-500 bg-amber-500/5"
                            : "border-border hover:border-amber-500/50"
                        )}
                      >
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{template.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <Label className="mb-3 block">Mensagem</Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[150px] resize-none pr-12"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e, 'document')}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="hidden"
                        multiple
                      />
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileUpload(e, 'image')}
                        accept="image/*"
                        className="hidden"
                        multiple
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => imageInputRef.current?.click()}
                        type="button"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Attached Files */}
                {attachedFiles.length > 0 && (
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Anexos ({attachedFiles.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          {file.preview ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="text-sm truncate max-w-[120px]">{file.file.name}</span>
                              <button
                                onClick={() => removeFile(index)}
                                className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-background">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending || showSuccess}>
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={selectedGuests.length === 0 || !message.trim() || isSending || showSuccess}
                className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isSending ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
