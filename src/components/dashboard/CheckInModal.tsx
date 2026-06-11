import { useState, useRef, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  UserCheck,
  Search,
  Calendar,
  BedDouble,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Fingerprint,
  Camera,
  FileText,
  Key,
  Sparkles,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Upload,
  X,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReservation?: any; // Allow passing reservation data
}

type Step = 1 | 2 | 3 | 4;

// Initial state for pending check-ins (will be replaced by API call)
const initialPendingCheckIns: any[] = [];

export function CheckInModal({ open, onOpenChange, initialReservation }: CheckInModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [observations, setObservations] = useState("");
  const [roomReady, setRoomReady] = useState(true);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullReservation, setFullReservation] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [pendingCheckIns, setPendingCheckIns] = useState<any[]>(initialPendingCheckIns);

  useEffect(() => {
    // Load pending check-ins (reservations starting today)
    const loadCheckIns = async () => {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');

      const response = await api.getReservations({
        checkInStart: formattedDate,
        checkInEnd: formattedDate,
        status: 'confirmed'
      });

      if (response.success && response.data?.reservations) {
        console.log('CheckInModal - API reservations:', response.data.reservations);
        // Map API response to component structure
        const mappedReservations = response.data.reservations.map((r: any) => ({
          id: r.id.toString(),
          guest: r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : (r.guestName || "Hóspede"),
          room: r.unit?.number || "N/A",
          roomType: r.unit?.roomType?.name || r.unit?.type || "Standard",
          checkIn: format(new Date(r.checkIn), 'dd/MM/yyyy'),
          checkOut: format(new Date(r.checkOut), 'dd/MM/yyyy'),
          guests: r.guests || 1,
          status: r.status,
          total: r.totalValue || 0,
          paid: r.paidValue || 0,
          preCheckinDone: false // Add logic if available
        }));
        console.log('CheckInModal - Mapped reservations:', mappedReservations);
        setPendingCheckIns(mappedReservations);
      }
    };

    if (open) {
      loadCheckIns();
    }
  }, [open]);

  useEffect(() => {
    api.getPaymentMethods().then((res) => {
      if (res.success && res.data) {
        setPaymentMethods(
          Array.isArray(res.data) ? res.data : (res.data as any).paymentMethods || []
        );
      }
    });
  }, []);

  useEffect(() => {
    if (selectedReservation?.id) {
      const reservationId = Number(selectedReservation.id);

      // Validate that we have a valid numeric ID
      if (isNaN(reservationId) || reservationId <= 0) {
        console.error('Invalid reservation ID:', selectedReservation.id, selectedReservation);
        return;
      }

      api.getReservationById(reservationId).then((res) => {
        if (res.success && res.data?.reservation) {
          setFullReservation(res.data.reservation);
          if (res.data.reservation.paymentMethod) {
            setSelectedPaymentMethod(res.data.reservation.paymentMethod);
          }
        }
      });
    }
  }, [selectedReservation]);

  // Effect to handle initialReservation
  useEffect(() => {
    if (open && initialReservation) {
      console.log('CheckInModal - initialReservation:', initialReservation);
      setSelectedReservation(initialReservation);
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialReservation]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
      setDocumentVerified(true);
    }
  };

  const removeDocument = () => {
    setUploadedDocument(null);
    setDocumentPreview(null);
    setDocumentVerified(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredCheckIns = pendingCheckIns.filter(
    (r) =>
      r.guest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleComplete = async () => {
    if (!selectedReservation) return;

    try {
      // 1. Update payment method if it was selected/changed
      if (selectedPaymentMethod) {
        await api.updateReservation(Number(selectedReservation.id), {
          paymentMethod: selectedPaymentMethod
        });
      }

      // 2. Perform Check-in
      const response = await api.checkInReservation(Number(selectedReservation.id));

      if (response.success) {
        toast.success("Check-in realizado com sucesso!");
        onOpenChange(false);
        setStep(1);
        setSelectedReservation(null);
      } else {
        toast.error("Erro ao realizar check-in: " + response.error?.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar check-in");
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedReservation(null);
    setSearchTerm("");
    setDocumentVerified(false);
    setPaymentConfirmed(false);
    setObservations("");
    setRoomReady(true);
    setUploadedDocument(null);
    setDocumentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetModal();
    }}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-0 flex-shrink-0">
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Check-in de Hóspede</DialogTitle>
                <DialogDescription className="text-white/80 mt-1">Realize o check-in de forma rápida e eficiente</DialogDescription>
              </div>
            </div>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                      step >= s
                        ? "bg-white text-emerald-600"
                        : "bg-white/20 text-white/60"
                    )}
                  >
                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={cn(
                        "w-12 h-1 mx-1 rounded-full transition-all",
                        step > s ? "bg-white" : "bg-white/20"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 pb-24">
            {/* Step 1: Select Reservation */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Selecionar Reserva</h3>
                  <p className="text-muted-foreground">Busque pela reserva ou selecione da lista de check-ins pendentes</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou quarto..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Check-ins de Hoje ({filteredCheckIns.length})</h4>
                  {filteredCheckIns.map((reservation) => (
                    <div
                      key={reservation.id}
                      onClick={() => setSelectedReservation(reservation)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedReservation?.id === reservation.id
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "border-border hover:border-emerald-500/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                            {reservation.guest.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{reservation.guest}</h4>
                              {reservation.preCheckinDone && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Pré Check-in
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{reservation.room}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {reservation.checkIn} - {reservation.checkOut}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {reservation.guests} hóspedes
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">#{reservation.id}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              reservation.status === "confirmed"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}
                          >
                            {reservation.status === "confirmed" ? "Confirmado" : "Pagamento Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Guest Verification */}
            {step === 2 && selectedReservation && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Fingerprint className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Verificação do Hóspede</h3>
                  <p className="text-muted-foreground">Confirme a identidade e dados do hóspede</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Guest Info */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/10 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Dados do Hóspede
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                        <p className="font-medium">{selectedReservation.guest}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Documento</Label>
                          <p className="font-medium">{selectedReservation.document || "Não informado"}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">RG</Label>
                          <p className="font-medium">{selectedReservation.rg || "Não informado"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {selectedReservation.email || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Telefone</Label>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {selectedReservation.phone || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Guests */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border border-indigo-500/10 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Acompanhantes
                    </h4>
                    {fullReservation?.accompanyingGuests && fullReservation.accompanyingGuests.length > 0 ? (
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-3">
                          {fullReservation.accompanyingGuests.map((guest: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/50">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {guest.name ? guest.name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{guest.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {guest.document || guest.cpf || "Sem documento"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Nenhum acompanhante registrado
                      </div>
                    )}
                  </div>

                  {/* Document Verification */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Verificação de Documentos
                    </h4>
                    <div className="space-y-4">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                        className="hidden"
                      />

                      {/* Upload Area */}
                      {!uploadedDocument ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 rounded-lg border-2 border-dashed border-purple-500/30 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                        >
                          <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                          <p className="font-medium text-purple-600">Clique para enviar documento</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Aceita imagens (JPG, PNG) ou PDF
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                          <div className="flex items-start gap-3">
                            {documentPreview ? (
                              <img
                                src={documentPreview}
                                alt="Documento"
                                className="w-20 h-20 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <FileImage className="w-8 h-8 text-purple-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{uploadedDocument.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedDocument.size / 1024).toFixed(1)} KB
                              </p>
                              <Badge variant="outline" className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Documento enviado
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={removeDocument}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            documentVerified ? "bg-emerald-500/10" : "bg-amber-500/10"
                          )}>
                            {documentVerified ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Documento Verificado</p>
                            <p className="text-xs text-muted-foreground">
                              {documentVerified ? "Verificação concluída" : "Aguardando verificação"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={documentVerified}
                          onCheckedChange={setDocumentVerified}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-600/5 border border-slate-500/10">
                  <h4 className="font-semibold flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Endereço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Cidade/UF</Label>
                      <p className="font-medium">{selectedReservation.address || "Não informado"}</p>
                    </div>
                    <div className="hidden md:block">
                      <Label className="text-xs text-muted-foreground">País</Label>
                      <p className="font-medium">Brasil</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Room & Payment */}
            {step === 3 && selectedReservation && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Quarto & Pagamento</h3>
                  <p className="text-muted-foreground">Confirme o quarto e situação financeira</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Room Info */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/10 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-amber-500" />
                      Informações do Quarto
                    </h4>
                    <div className="p-4 rounded-lg bg-background">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <BedDouble className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">{fullReservation?.unit?.name || selectedReservation.room}</h5>
                          <p className="text-sm text-muted-foreground">{fullReservation?.unit?.type || selectedReservation.roomType || "Acomodação Standard"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div>
                          <Label className="text-xs text-muted-foreground">Número do Quarto</Label>
                          <p className="font-semibold text-amber-600">{fullReservation?.unit?.number || selectedReservation.room}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nome do Quarto</Label>
                          <p className="font-medium">{fullReservation?.unit?.name || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          roomReady ? "bg-emerald-500/10" : "bg-amber-500/10"
                        )}>
                          {roomReady ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Quarto Pronto</p>
                          <p className="text-xs text-muted-foreground">
                            {roomReady ? "Liberado para check-in" : "Em preparação"}
                          </p>
                        </div>
                      </div>
                      <Switch checked={roomReady} onCheckedChange={setRoomReady} />
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      Situação Financeira
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                        <span className="text-muted-foreground">Valor Total</span>
                        <span className="font-bold text-lg">R$ {selectedReservation.total.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-background">
                        <span className="text-muted-foreground">Valor Pago</span>
                        <span className="font-semibold text-emerald-500">
                          R$ {(selectedReservation.paid || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <span className="text-amber-600 font-medium">Saldo Pendente</span>
                        <span className="font-bold text-amber-600">
                          R$ {Math.max(0, (selectedReservation.total || 0) - (selectedReservation.paid || 0)).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Forma de Pagamento no Check-in</Label>
                      <Select
                        value={selectedPaymentMethod}
                        onValueChange={(value) => {
                          setSelectedPaymentMethod(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method: any) => (
                            <SelectItem key={method.id} value={method.name}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          paymentConfirmed ? "bg-emerald-500/10" : "bg-amber-500/10"
                        )}>
                          {paymentConfirmed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Pagamento Confirmado</p>
                          <p className="text-xs text-muted-foreground">
                            {paymentConfirmed ? "Valor quitado" : "Pendente de cobrança"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={paymentConfirmed}
                        onCheckedChange={setPaymentConfirmed}
                      />
                    </div>
                  </div>
                </div>

                {/* Observations */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-500/5 to-slate-600/5 border border-slate-500/10">
                  <Label className="font-semibold">Observações do Check-in</Label>
                  <Textarea
                    placeholder="Adicione observações relevantes sobre o check-in..."
                    className="mt-2"
                    rows={3}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && selectedReservation && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Check-in Pronto!</h3>
                  <p className="text-muted-foreground">Confirme os dados e finalize o check-in</p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                      <User className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Hóspede</p>
                      <p className="font-semibold truncate">{selectedReservation.guest}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                      <BedDouble className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                      <p className="text-xs text-muted-foreground">Quarto</p>
                      <p className="font-semibold truncate">{fullReservation?.unit?.number || selectedReservation.room}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-semibold">{selectedReservation.checkOut}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                      <CreditCard className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="font-semibold">R$ {selectedReservation.total.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Documento verificado</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Quarto pronto para entrada</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {paymentConfirmed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{paymentConfirmed ? "Pagamento confirmado" : "Pagamento pendente registrado"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Key className="w-6 h-6 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Chave/Cartão do Quarto</p>
                      <p className="text-sm text-amber-600 dark:text-amber-300">
                        Entregue a chave/cartão ao hóspede após confirmar o check-in
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-background">
          <Button
            variant="outline"
            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !selectedReservation}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Continuar
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Check-in
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
