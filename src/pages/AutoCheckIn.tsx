import { useState } from "react";
import { NewAutoCheckInModal } from "@/components/autocheckin/NewAutoCheckInModal";
import { AutoCheckInSettingsModal } from "@/components/autocheckin/AutoCheckInSettingsModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QRCode } from "@/components/ui/qr-code";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Clock,
  Users,
  Key,
  Mail,
  MessageSquare,
  Scan,
  Camera,
  FileText,
  Shield,
  Wifi,
  DoorOpen,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Send,
  Download,
  Settings,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Plus,
  ArrowRight,
  AlertCircle,
  Timer,
  MapPin,
  Star,
  Sparkles,
  Link2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const checkInStats = {
  totalToday: 24,
  completed: 18,
  pending: 4,
  inProgress: 2,
  averageTime: "2.3 min",
  selfCheckInRate: 75,
};

const pendingCheckIns = [
  {
    id: 1,
    guestName: "Carlos Silva",
    roomNumber: "301",
    roomType: "Suite Master",
    checkInTime: "14:00",
    status: "pending",
    qrSent: true,
    documentsVerified: false,
    email: "carlos@email.com",
    phone: "+55 11 99999-0001",
    nights: 3,
  },
  {
    id: 2,
    guestName: "Ana Rodrigues",
    roomNumber: "205",
    roomType: "Standard",
    checkInTime: "15:00",
    status: "documents_pending",
    qrSent: true,
    documentsVerified: false,
    email: "ana@email.com",
    phone: "+55 21 99999-0002",
    nights: 2,
  },
  {
    id: 3,
    guestName: "Roberto Costa",
    roomNumber: "401",
    roomType: "Deluxe",
    checkInTime: "16:00",
    status: "in_progress",
    qrSent: true,
    documentsVerified: true,
    email: "roberto@email.com",
    phone: "+55 31 99999-0003",
    nights: 5,
  },
  {
    id: 4,
    guestName: "Julia Mendes",
    roomNumber: "102",
    roomType: "Standard",
    checkInTime: "14:30",
    status: "completed",
    qrSent: true,
    documentsVerified: true,
    email: "julia@email.com",
    phone: "+55 41 99999-0004",
    nights: 1,
  },
];

const completedCheckIns = [
  { id: 1, guestName: "Pedro Santos", room: "501", time: "10:15", method: "self" },
  { id: 2, guestName: "Mariana Lima", room: "302", time: "11:30", method: "assisted" },
  { id: 3, guestName: "Fernando Alves", room: "203", time: "12:45", method: "self" },
  { id: 4, guestName: "Camila Souza", room: "404", time: "13:00", method: "self" },
  { id: 5, guestName: "Lucas Oliveira", room: "101", time: "13:20", method: "self" },
];

const checkInSteps = [
  { step: 1, name: "QR Code Enviado", icon: QrCode, description: "Link de check-in enviado" },
  { step: 2, name: "Documentos", icon: FileText, description: "Upload e verificação de documentos" },
  { step: 3, name: "Formulário", icon: Smartphone, description: "Dados adicionais preenchidos" },
  { step: 4, name: "Assinatura", icon: Shield, description: "Termos assinados digitalmente" },
  { step: 5, name: "Chave Digital", icon: Key, description: "Acesso ao quarto liberado" },
];

export default function AutoCheckIn() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<typeof pendingCheckIns[0] | null>(null);
  const [isNewCheckInOpen, setIsNewCheckInOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      documents_pending: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
    };
    const labels = {
      pending: "Aguardando",
      documents_pending: "Docs Pendentes",
      in_progress: "Em Progresso",
      completed: "Concluído",
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleSendQR = (guestName: string) => {
    toast({
      title: "QR Code Enviado",
      description: `Link de check-in enviado para ${guestName}`,
    });
  };

  const handleResendQR = (guestName: string) => {
    toast({
      title: "QR Code Reenviado",
      description: `Novo link de check-in enviado para ${guestName}`,
    });
  };

  const getCurrentStep = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "documents_pending": return 2;
      case "in_progress": return 3;
      case "completed": return 5;
      default: return 1;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20">
                <QrCode className="w-6 h-6 text-emerald-500" />
              </div>
              Auto Check-in Digital
            </h1>
            <p className="text-muted-foreground mt-1">
              Check-in automatizado via QR Code e chave digital
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90"
              onClick={() => setIsNewCheckInOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Check-in
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.totalToday}</p>
                <p className="text-xs text-muted-foreground">Check-ins Hoje</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Timer className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Progresso</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Smartphone className="w-4 h-4 text-cyan-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.selfCheckInRate}%</p>
                <p className="text-xs text-muted-foreground">Self Check-in</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <Timer className="w-4 h-4 text-rose-500" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{checkInStats.averageTime}</p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check-in List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Check-ins do Dia</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar hóspede..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48 bg-background/50"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-background/50 border border-white/10 mb-4">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Pendentes ({pendingCheckIns.filter(c => c.status !== 'completed').length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Concluídos ({completedCheckIns.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {pendingCheckIns.filter(c => c.status !== 'completed').map((checkIn) => (
                          <div
                            key={checkIn.id}
                            onClick={() => setSelectedGuest(checkIn)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedGuest?.id === checkIn.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-background/50 border-white/10 hover:border-primary/20'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-semibold text-white">
                                  {checkIn.guestName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h4 className="font-medium">{checkIn.guestName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {checkIn.roomType} • Quarto {checkIn.roomNumber}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(checkIn.status)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {checkIn.checkInTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {checkIn.nights} noites
                              </span>
                              {checkIn.qrSent && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                                  <QrCode className="w-3 h-3 mr-1" />
                                  QR Enviado
                                </Badge>
                              )}
                            </div>

                            {/* Progress Steps */}
                            <div className="flex items-center gap-2">
                              {checkInSteps.slice(0, 4).map((step, index) => (
                                <div key={step.step} className="flex items-center">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getCurrentStep(checkIn.status) >= step.step
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-muted text-muted-foreground'
                                      }`}
                                  >
                                    {getCurrentStep(checkIn.status) >= step.step ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      step.step
                                    )}
                                  </div>
                                  {index < 3 && (
                                    <div
                                      className={`w-8 h-0.5 ${getCurrentStep(checkIn.status) > step.step
                                        ? 'bg-emerald-500'
                                        : 'bg-muted'
                                        }`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleResendQR(checkIn.guestName); }}>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Reenviar QR
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                WhatsApp
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 ml-auto">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Enviar Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Key className="w-4 h-4 mr-2" />
                                    Gerar Chave Manual
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Cancelar Check-in
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="completed">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {completedCheckIns.map((checkIn) => (
                          <div
                            key={checkIn.id}
                            className="p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{checkIn.guestName}</h4>
                                  <p className="text-sm text-muted-foreground">Quarto {checkIn.room}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{checkIn.time}</p>
                                <Badge variant="outline" className={checkIn.method === 'self' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}>
                                  {checkIn.method === 'self' ? 'Self Check-in' : 'Assistido'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Preview & Details */}
          <div className="space-y-4">
            {/* QR Code Generator */}
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-500" />
                  QR Code de Check-in
                </CardTitle>
                <CardDescription>
                  {selectedGuest ? `Para ${selectedGuest.guestName}` : 'Selecione um hóspede'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl mb-4">
                  <QRCode
                    value={selectedGuest ? `https://hotel.com/checkin/${selectedGuest.id}` : 'https://hotel.com/checkin'}
                    size={180}
                  />
                </div>
                {selectedGuest && (
                  <>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Escaneie para acessar o check-in digital
                    </p>
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Check-in Flow */}
            <Card className="bg-card/50 backdrop-blur-xl border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Fluxo de Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkInSteps.map((step, index) => (
                    <div key={step.step} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedGuest && getCurrentStep(selectedGuest.status) >= step.step
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                        }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      {selectedGuest && getCurrentStep(selectedGuest.status) >= step.step && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Ações Rápidas</h4>
                    <p className="text-xs text-muted-foreground">Automações de check-in</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar QR para Todos Pendentes
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Lembrete WhatsApp em Massa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Liberar Todas as Chaves Digitais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      <NewAutoCheckInModal
        open={isNewCheckInOpen}
        onOpenChange={setIsNewCheckInOpen}
      />

      <AutoCheckInSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </DashboardLayout >
  );
}
