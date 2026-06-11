import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useGuestAuth } from "@/contexts/GuestAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Calendar,
  BedDouble,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Layers,
  Clock,
  MapPin,
  Phone,
  Mail,
  Utensils,
  Sparkles,
  Car,
  Wifi,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  Gift,
  FileText,
  FileSignature,
  Download,
  ClipboardCheck,
  QrCode,
  Key,
  Smartphone,
  Thermometer,
  Lightbulb,
  Volume2,
  Tv,
  Wind,
  Lock,
  DoorOpen,
  ChevronRight,
  Send,
  Bot,
  ShoppingBag,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  PartyPopper,
  Map,
  Camera,
  Heart,
  Award,
  TrendingUp,
  Crown,
  Zap,
  Shield,
  Globe,
  Sun,
  Moon,
  Palette,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Check,
  Play,
  Pause,
  Music,
  Image,
  RefreshCw,
  Navigation,
  Plane,
  Hotel,
  Building2,
  Ticket,
  Receipt,
  Wallet,
  History,
  CalendarDays,
  Users,
  Baby,
  PawPrint,
  Briefcase,
  Luggage,
  Umbrella,
  Info,
  HelpCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Fingerprint,
  Scan,
  Timer,
  Loader2,
  Search,
  CreditCard as CreditCardIcon,
  Printer,
  Copy
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

// Types
interface ServiceRequest {
  id: string;
  type: string;
  category: "housekeeping" | "maintenance" | "roomservice" | "concierge" | "transport";
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "normal" | "high";
  createdAt: string;
  estimatedTime?: string;
  staff?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "promo";
  read: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: "guest" | "bot" | "staff";
  message: string;
  timestamp: string;
}

interface RoomControl {
  id: string;
  name: string;
  icon: any;
  type: "toggle" | "slider" | "select";
  value: any;
  min?: number;
  max?: number;
  options?: string[];
}

interface Experience {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  rating: number;
  duration: string;
  description: string;
  available: boolean;
}

interface LoyaltyReward {
  id: string;
  name: string;
  points: number;
  category: string;
  image?: string;
  description: string;
}

const notifications: Notification[] = [
  { id: "1", title: "Bem-vindo!", message: "Aproveite sua estadia no Uni|Stays. Seu quarto está pronto!", type: "success", read: false, createdAt: "2024-12-20 14:00" },
  { id: "2", title: "Spa - 20% OFF", message: "Aproveite nosso spa com 20% de desconto para hóspedes!", type: "promo", read: false, createdAt: "2024-12-20 10:00" },
  { id: "3", title: "Evento Especial", message: "Jantar de gala hoje às 20h no terraço. Não perca!", type: "info", read: true, createdAt: "2024-12-19 16:00" },
  { id: "4", title: "Late Checkout Aprovado", message: "Seu late checkout até 14h foi aprovado!", type: "success", read: true, createdAt: "2024-12-19 12:00" },
];

const chatMessages: ChatMessage[] = [
  { id: "1", sender: "bot", message: "Olá! Sou o assistente virtual do Uni|Stays. Como posso ajudá-lo?", timestamp: "10:00" },
  { id: "2", sender: "guest", message: "Gostaria de reservar uma mesa no restaurante para hoje à noite", timestamp: "10:01" },
  { id: "3", sender: "bot", message: "Claro! Para quantas pessoas e em qual horário você prefere?", timestamp: "10:01" },
  { id: "4", sender: "guest", message: "2 pessoas às 20h", timestamp: "10:02" },
  { id: "5", sender: "bot", message: "Perfeito! Reservei uma mesa para 2 pessoas às 20h no Restaurante La Vie. Você receberá uma confirmação por email. Posso ajudar com mais alguma coisa?", timestamp: "10:03" },
];

const experiences: Experience[] = [
  { id: "1", name: "Degustação de Vinhos", category: "Gastronomia", image: "🍷", price: 180, rating: 4.9, duration: "2h", description: "Experiência exclusiva com sommelier", available: true },
  { id: "2", name: "Spa Day Completo", category: "Bem-estar", image: "🧘", price: 350, rating: 4.8, duration: "4h", description: "Massagem, sauna e tratamentos", available: true },
  { id: "3", name: "City Tour Privativo", category: "Passeio", image: "🚐", price: 250, rating: 4.7, duration: "3h", description: "Conheça os pontos turísticos", available: true },
  { id: "4", name: "Aula de Culinária", category: "Gastronomia", image: "👨‍🍳", price: 200, rating: 4.9, duration: "2h", description: "Aprenda com nosso chef", available: false },
  { id: "5", name: "Passeio de Barco", category: "Aventura", image: "⛵", price: 400, rating: 4.8, duration: "5h", description: "Explore a costa e ilhas", available: true },
  { id: "6", name: "Yoga ao Nascer do Sol", category: "Bem-estar", image: "🌅", price: 80, rating: 4.9, duration: "1h", description: "Na praia do hotel", available: true },
];

const loyaltyRewards: LoyaltyReward[] = [
  { id: "1", name: "Upgrade de Quarto", points: 5000, category: "Hospedagem", description: "Upgrade para categoria superior" },
  { id: "2", name: "Spa 50% OFF", points: 3000, category: "Bem-estar", description: "Desconto em qualquer tratamento" },
  { id: "3", name: "Noite Grátis", points: 15000, category: "Hospedagem", description: "Diária cortesia" },
  { id: "4", name: "Jantar para 2", points: 8000, category: "Gastronomia", description: "Menu degustação completo" },
  { id: "5", name: "Transfer VIP", points: 4000, category: "Transporte", description: "Limusine aeroporto-hotel" },
  { id: "6", name: "Early Check-in", points: 2000, category: "Hospedagem", description: "Check-in a partir das 10h" },
];

const quickServices = [
  { icon: Utensils, label: "Room Service", color: "from-orange-500 to-red-500", category: "roomservice" },
  { icon: Sparkles, label: "Spa & Wellness", color: "from-purple-500 to-pink-500", category: "spa" },
  { icon: Car, label: "Transfer", color: "from-blue-500 to-cyan-500", category: "transport" },
  { icon: Coffee, label: "Café da Manhã", color: "from-amber-500 to-yellow-500", category: "breakfast" },
  { icon: Key, label: "Chave Digital", color: "from-emerald-500 to-teal-500", category: "key" },
  { icon: Dumbbell, label: "Academia", color: "from-rose-500 to-pink-500", category: "gym" },
  { icon: Waves, label: "Piscina", color: "from-sky-500 to-blue-500", category: "pool" },
  { icon: PartyPopper, label: "Eventos", color: "from-violet-500 to-purple-500", category: "events" },
];

const roomControls: RoomControl[] = [
  { id: "1", name: "Ar Condicionado", icon: Thermometer, type: "slider", value: 22, min: 16, max: 30 },
  { id: "2", name: "Iluminação", icon: Lightbulb, type: "slider", value: 80, min: 0, max: 100 },
  { id: "3", name: "TV", icon: Tv, type: "toggle", value: false },
  { id: "4", name: "Cortinas", icon: Sun, type: "toggle", value: true },
  { id: "5", name: "Não Perturbe", icon: DoorOpen, type: "toggle", value: false },
  { id: "6", name: "Música Ambiente", icon: Music, type: "toggle", value: false },
];

const menuItems = [
  { icon: Layers, label: "Início", id: "home" },
  { icon: Thermometer, label: "Controle do Quarto", id: "roomcontrol" },
  { icon: Calendar, label: "Minhas Reservas", id: "reservations" },
  { icon: MessageSquare, label: "Solicitações", id: "requests" },
  { icon: Bot, label: "Assistente IA", id: "chat" },
  { icon: ShoppingBag, label: "Experiências", id: "experiences" },
  { icon: UtensilsCrossed, label: "Restaurantes", id: "restaurants" },
  { icon: Gift, label: "Fidelidade", id: "loyalty" },
  { icon: CreditCard, label: "Minha Conta", id: "account" },
  { icon: Bell, label: "Notificações", id: "notifications" },
  { icon: Settings, label: "Configurações", id: "settings" },
];

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const defaultPortalPreferences = {
  roomTemp: 22,
  pillow: "Padrão",
  newspaper: false,
  floor: "Baixo",
  view: "Interna",
};

function normalizeGuestPreferences(raw: unknown): typeof defaultPortalPreferences {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      roomTemp: typeof o.roomTemp === "number" ? o.roomTemp : defaultPortalPreferences.roomTemp,
      pillow: typeof o.pillow === "string" ? o.pillow : defaultPortalPreferences.pillow,
      newspaper: typeof o.newspaper === "boolean" ? o.newspaper : defaultPortalPreferences.newspaper,
      floor: typeof o.floor === "string" ? o.floor : defaultPortalPreferences.floor,
      view: typeof o.view === "string" ? o.view : defaultPortalPreferences.view,
    };
  }
  return { ...defaultPortalPreferences };
}

const mapBackendStatus = (status: string | null | undefined): "upcoming" | "active" | "completed" | "cancelled" => {
  if (!status) return 'upcoming';
  switch (status) {
    case 'checked_in':
      return 'active';
    case 'checked_out':
      return 'completed';
    case 'confirmed':
    case 'pending':
      return 'upcoming';
    case 'cancelled':
    case 'no_show':
      return 'cancelled';
    default:
      return 'upcoming';
  }
};

export default function GuestPortal() {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const [roomSettings, setRoomSettings] = useState(roomControls);
  const [checkinStep, setCheckinStep] = useState(1);
  const [showDigitalKey, setShowDigitalKey] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [notificationsList, setNotificationsList] = useState(notifications);

  const { guestUser, logout, isAuthenticated, isLoading: isLoadingAuth, refreshGuestUser } = useGuestAuth();

  // Data State
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [digitalKeyReservationId, setDigitalKeyReservationId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [checkinFormData, setCheckinFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: ""
  });

  // Service Requests State
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    category: "",
    type: "",
    description: "",
    priority: "normal"
  });

  const [checkinReservationId, setCheckinReservationId] = useState<number | null>(null);
  const [checkinNotes, setCheckinNotes] = useState("");
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({
    name: "",
    phone: "",
    nationality: "",
    documentNumber: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const checkinDocInputRef = useRef<HTMLInputElement>(null);
  const checkinSelfieInputRef = useRef<HTMLInputElement>(null);
  const checkinSignedContractInputRef = useRef<HTMLInputElement>(null);
  const [checkinDocumentFullUrl, setCheckinDocumentFullUrl] = useState("");
  const [checkinSelfieFullUrl, setCheckinSelfieFullUrl] = useState("");
  const [checkinSignedContractFullUrl, setCheckinSignedContractFullUrl] = useState("");
  const [checkinSignedContractIsPdf, setCheckinSignedContractIsPdf] = useState(false);
  const [uploadingCheckinDocument, setUploadingCheckinDocument] = useState(false);
  const [uploadingCheckinSelfie, setUploadingCheckinSelfie] = useState(false);
  const [uploadingCheckinSignedContract, setUploadingCheckinSignedContract] = useState(false);

  type WebCheckinPixPayload = {
    configured?: boolean;
    reason?: string;
    provider?: "efi" | "static";
    txid?: string;
    amount?: number;
    brCode?: string;
    qrCodeDataUrl?: string;
    reservationNumber?: string | null;
    merchantName?: string;
    pixKeyMasked?: string;
  };
  const [webCheckinPixPayload, setWebCheckinPixPayload] = useState<WebCheckinPixPayload | null>(null);
  const [webCheckinPixLoading, setWebCheckinPixLoading] = useState(false);
  const [pixPaymentDeclared, setPixPaymentDeclared] = useState(false);
  const [checkinPaymentModalOpen, setCheckinPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (guestUser) {
      setCheckinFormData({
        name: guestUser.name || `${guestUser.firstName} ${guestUser.lastName}`,
        email: guestUser.email || "",
        phone: guestUser.phone || "",
        cpf: guestUser.documentNumber || ""
      });
    }
  }, [guestUser]);

  const handleCheckinChange = (field: string, value: string) => {
    setCheckinFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
      fetchRequests();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const refetchTabs = ["reservations", "requests", "checkin", "account", "settings"];
    if (refetchTabs.includes(activeTab)) {
      fetchReservations();
      if (activeTab === "requests") fetchRequests();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab !== "checkin" || myReservations.length === 0) return;
    const hasManualSelection =
      checkinReservationId != null &&
      myReservations.some(
        (r) => Number(r.id) === checkinReservationId && r.status === "upcoming" && !r.webCheckInCompleted
      );
    if (hasManualSelection) return;

    const forCheckin = myReservations.find((r) => r.status === "upcoming" && !r.webCheckInCompleted);
    setCheckinReservationId(forCheckin ? Number(forCheckin.id) : null);
  }, [activeTab, myReservations, checkinReservationId]);

  useEffect(() => {
    if (activeTab === "checkin") {
      setCheckinStep(1);
      setCheckinNotes("");
      setCheckinDocumentFullUrl("");
      setCheckinSelfieFullUrl("");
      setCheckinSignedContractFullUrl("");
      setCheckinSignedContractIsPdf(false);
      setWebCheckinPixPayload(null);
      setPixPaymentDeclared(false);
      setCheckinPaymentModalOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "checkin" || checkinStep !== 3 || !checkinReservationId) {
      return;
    }
    let cancelled = false;
    setWebCheckinPixLoading(true);
    void api
      .getGuestWebCheckinPix(checkinReservationId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data && typeof res.data === "object") {
          setWebCheckinPixPayload(res.data as WebCheckinPixPayload);
        } else {
          setWebCheckinPixPayload(null);
        }
      })
      .catch(() => {
        if (!cancelled) setWebCheckinPixPayload(null);
      })
      .finally(() => {
        if (!cancelled) setWebCheckinPixLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, checkinStep, checkinReservationId]);

  const MAX_CHECKIN_IMAGE_BYTES = 10 * 1024 * 1024;

  const handleWebCheckinImageSelected = async (
    file: File | undefined,
    kind: "document" | "selfie" | "signed_contract"
  ) => {
    if (!file) return;
    if (file.size > MAX_CHECKIN_IMAGE_BYTES) {
      toast.error("Arquivo muito grande. Máximo 10 MB.");
      return;
    }
    const setLoading =
      kind === "document"
        ? setUploadingCheckinDocument
        : kind === "selfie"
          ? setUploadingCheckinSelfie
          : setUploadingCheckinSignedContract;
    setLoading(true);
    try {
      const res = await api.guestUploadWebCheckinImage(file, {
        kind,
        reservationId: checkinReservationId,
      });
      if (res.success && res.data && typeof res.data === "object" && "fullUrl" in res.data) {
        const fullUrl = String((res.data as { fullUrl: string }).fullUrl);
        if (kind === "document") setCheckinDocumentFullUrl(fullUrl);
        else if (kind === "selfie") setCheckinSelfieFullUrl(fullUrl);
        else {
          setCheckinSignedContractFullUrl(fullUrl);
          setCheckinSignedContractIsPdf(file.type === "application/pdf");
        }
        toast.success(
          kind === "document"
            ? "Documento enviado."
            : kind === "selfie"
              ? "Selfie enviada."
              : "Contrato assinado enviado."
        );
      } else {
        toast.error(res.error?.message || "Falha no envio do arquivo.");
      }
    } catch {
      toast.error("Falha no envio do arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.getGuestServiceRequests();
      if (response.success && response.data && Array.isArray((response.data as { requests?: unknown[] }).requests)) {
        setMyRequests((response.data as { requests: ServiceRequest[] }).requests);
      } else {
        setMyRequests([]);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
      setMyRequests([]);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequestData.category || !newRequestData.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const response = await api.createGuestServiceRequest({
        category: newRequestData.category,
        description: newRequestData.description,
        priority: newRequestData.priority,
        type: newRequestData.type || "Solicitação Geral"
      });

      if (response.success) {
        toast.success("Solicitação criada com sucesso!");
        setShowNewRequestModal(false);
        setNewRequestData({ category: "", type: "", description: "", priority: "normal" });
        fetchRequests();
      } else {
        toast.error(response.error?.message || "Erro ao processar solicitação");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar solicitação");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const resResponse = await api.getGuestReservations();
      if (resResponse.success && resResponse.data && Array.isArray((resResponse.data as { reservations?: unknown[] }).reservations)) {
        const list = (resResponse.data as { reservations: Record<string, unknown>[] }).reservations;
        setMyReservations(list.map((r) => {
          const checkIn = r.checkIn as string;
          const checkOut = r.checkOut as string;
          const nightsFromApi = r.nights as number | undefined;
          const nights =
            typeof nightsFromApi === "number" && nightsFromApi > 0
              ? nightsFromApi
              : Math.max(
                  1,
                  Math.ceil(
                    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
                  )
                );
          const total = Number(r.total ?? 0);
          const paid = Number(r.paid ?? 0);
          const extrasTotal = Number((r as { extrasTotal?: number }).extrasTotal ?? 0);
          const balanceRaw = (r as { balance?: number }).balance;
          const balance =
            balanceRaw != null && !Number.isNaN(Number(balanceRaw))
              ? Number(balanceRaw)
              : Math.max(0, total - paid);
          return {
            id: String(r.id),
            checkIn,
            checkOut,
            room: (r.room as string) || "Quarto não atribuído",
            roomType: (r.roomType as string) || "Standard",
            roomNumber: (r.roomNumber as string) ?? (r.unitNumber as string) ?? "---",
            floor: (r.floor as number) ?? 0,
            status: mapBackendStatus(r.status as string),
            total,
            paid,
            balance,
            extrasTotal,
            items: Array.isArray((r as { items?: unknown[] }).items)
              ? ((r as { items: { name: string; totalPrice: number; quantity?: number; type?: string }[] }).items)
              : [],
            webCheckInCompleted: Boolean((r as { webCheckInCompleted?: boolean }).webCheckInCompleted),
            baseRate: r.baseRate,
            taxes: r.taxes,
            fees: r.fees,
            discount: r.discount,
            guests: Number(r.guests ?? 0),
            adults: Number(r.adults ?? 0),
            children: Number(r.children ?? 0),
            nights,
            services: (r.services as string[]) || [],
            qrCode: (r.confirmationCode as string) || (r.reservationNumber as string) || String(r.id),
            propertyName: r.propertyName as string | undefined,
            reservationNumber: r.reservationNumber as string | undefined,
            confirmationCode: r.confirmationCode as string | undefined,
          };
        }));
      } else {
        setMyReservations([]);
        if (!resResponse.success) {
          console.error("Failed to fetch reservations: API returned success=false", resResponse.error);
        }
      }
    } catch (e) {
      console.error("Failed to load reservations", e);
      setMyReservations([]);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const tierRaw = (guestUser?.tier || "bronze").toString();
  const loyaltyTierLabel = tierRaw.charAt(0).toUpperCase() + tierRaw.slice(1).toLowerCase();
  const nextTierMap: Record<string, { name: string; points: number }> = {
    bronze: { name: "Prata", points: 5000 },
    silver: { name: "Ouro", points: 15000 },
    gold: { name: "Platina", points: 30000 },
    platinum: { name: "Platina", points: 50000 },
  };
  const nextTierInfo = nextTierMap[tierRaw.toLowerCase()] || { name: "Prata", points: 5000 };

  const guest = guestUser ? {
    name: guestUser.name || `${guestUser.firstName} ${guestUser.lastName}`,
    email: guestUser.email,
    phone: guestUser.phone || "",
    cpf: guestUser.documentNumber || "",
    nationality: guestUser.nationality || "Brasileiro",
    loyaltyTier: loyaltyTierLabel,
    loyaltyPoints: Number(guestUser.loyaltyPoints ?? 0),
    nextTier: nextTierInfo.name,
    nextTierPoints: nextTierInfo.points,
    totalStays: Number(guestUser.totalStays ?? 0),
    memberSince: guestUser.memberSince ? new Date(guestUser.memberSince).getFullYear().toString() : new Date().getFullYear().toString(),
    avatar: guestUser.avatar || "",
    preferences: normalizeGuestPreferences(guestUser.preferences)
  } : {
    // Fallback/Mock for type safety if needed (shouldn't render if !auth due to route protection)
    name: "", email: "", phone: "", cpf: "", nationality: "", loyaltyTier: "", loyaltyPoints: 0, nextTier: "", nextTierPoints: 0, totalStays: 0, memberSince: "", avatar: "", preferences: normalizeGuestPreferences(null)
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This block should ideally be handled by a router redirect if not authenticated.
    // For now, returning null or a simple message if not authenticated and not loading.
    // The instruction was to remove the *inline Login UI return*, implying this component
    // should not render the login form itself.
    return null;
  }

  const activeReservation = myReservations.find(r => r.status === "active");
  const upcomingReservation = myReservations.find(r => r.status === "upcoming");
  const financeReservation =
    activeReservation ?? upcomingReservation ?? (myReservations.length > 0 ? myReservations[0] : null);
  const digitalKeyReservation =
    myReservations.find((r) => Number(r.id) === digitalKeyReservationId) ?? financeReservation;
  const unreadNotifications = notificationsList.filter(n => !n.read).length;
  const loyaltyProgress = Math.min(
    100,
    guest.nextTierPoints > 0 ? (guest.loyaltyPoints / guest.nextTierPoints) * 100 : 0
  );

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "guest",
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        message: "Entendi! Estou processando sua solicitação. Em breve você receberá uma confirmação.",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleRoomControlChange = (id: string, value: any) => {
    setRoomSettings(prev => prev.map(control =>
      control.id === id ? { ...control, value } : control
    ));
    toast.success("Configuração atualizada!");
  };

  const markNotificationAsRead = (id: string) => {
    setNotificationsList(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "in_progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "upcoming": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "housekeeping": return Sparkles;
      case "maintenance": return Settings;
      case "roomservice": return Utensils;
      case "concierge": return MessageSquare;
      case "transport": return Car;
      case "other": return HelpCircle;
      default: return HelpCircle;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle2;
      case "warning": return AlertTriangle;
      case "promo": return Gift;
      default: return Info;
    }
  };

  const selectedCheckinReservation = myReservations.find((r) => Number(r.id) === checkinReservationId);
  const selectedCheckinReservationCode =
    selectedCheckinReservation?.reservationNumber ||
    selectedCheckinReservation?.confirmationCode ||
    (selectedCheckinReservation?.id != null ? String(selectedCheckinReservation.id) : null);
  const getReservationCode = (reservation: {
    reservationNumber?: string;
    confirmationCode?: string;
    id?: number;
  }) => reservation.reservationNumber || reservation.confirmationCode || (reservation.id != null ? String(reservation.id) : "-");

  const handlePrintReservation = (reservation: any) => {
    if (!reservation) return;

    const reservationCode = getReservationCode(reservation);
    const checkIn = reservation.checkIn ? new Date(reservation.checkIn).toLocaleDateString("pt-BR") : "-";
    const checkOut = reservation.checkOut ? new Date(reservation.checkOut).toLocaleDateString("pt-BR") : "-";
    const balance = Number(reservation.balance ?? Math.max(0, Number(reservation.total || 0) - Number(reservation.paid || 0)));
    const statusLabel =
      reservation.status === "active"
        ? "Hospedado"
        : reservation.status === "upcoming"
          ? "Confirmada"
          : reservation.status === "completed"
            ? "Concluída"
            : reservation.status === "cancelled"
              ? "Cancelada"
              : "Em aberto";

    const popup = window.open("", "_blank", "width=960,height=800");
    if (!popup) {
      toast.error("Não foi possível abrir a janela de impressão.");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Ficha de Reserva #${reservationCode}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 24px; font-weight: 700; margin: 0; }
            .subtitle { font-size: 13px; color: #475569; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
            .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
            .value { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
            .section-title { font-size: 16px; font-weight: 700; margin: 18px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 4px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            td:last-child { text-align: right; font-weight: 600; }
            .footer { margin-top: 20px; font-size: 11px; color: #64748b; text-align: center; }
            @media print { body { margin: 12mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Uni|Stays - Ficha de Reserva</h1>
            <div class="subtitle">Código da reserva: #${reservationCode} • Status: ${statusLabel}</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="label">Acomodação</div>
              <div class="value">${reservation.roomType || "-"}</div>
              <div class="label">Quarto</div>
              <div class="value">${reservation.roomNumber || "-"}</div>
              <div class="label">Andar</div>
              <div class="value">${reservation.floor ? `${reservation.floor}º` : "-"}</div>
            </div>
            <div class="card">
              <div class="label">Período</div>
              <div class="value">${checkIn} até ${checkOut}</div>
              <div class="label">Noites</div>
              <div class="value">${reservation.nights || 0}</div>
              <div class="label">Hóspedes</div>
              <div class="value">${reservation.adults || 0} adulto(s) / ${reservation.children || 0} criança(s)</div>
            </div>
          </div>

          <div class="section-title">Resumo Financeiro</div>
          <table>
            <tr><td>Diária base</td><td>${formatCurrency(Number(reservation.baseRate || 0))}</td></tr>
            <tr><td>Taxas e impostos</td><td>${formatCurrency(Number(reservation.taxes || 0))}</td></tr>
            <tr><td>Taxas de serviço</td><td>${formatCurrency(Number(reservation.fees || 0))}</td></tr>
            <tr><td>Descontos</td><td>- ${formatCurrency(Number(reservation.discount || 0))}</td></tr>
            <tr><td>Total da reserva</td><td>${formatCurrency(Number(reservation.total || 0))}</td></tr>
            <tr><td>Total pago</td><td>${formatCurrency(Number(reservation.paid || 0))}</td></tr>
            <tr><td>Saldo pendente</td><td>${formatCurrency(balance)}</td></tr>
          </table>

          <div class="footer">
            Documento gerado em ${new Date().toLocaleString("pt-BR")} • Uni|Stays
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Layers className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-xl tracking-tight">
                    Uni<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">|</span>Stays
                  </h1>
                  <p className="text-xs text-muted-foreground">Portal do Hóspede</p>
                </div>
              </div>
            </div>

            {/* Active Stay Quick Info */}
            {activeReservation && (
              <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Quarto {activeReservation.roomNumber}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{activeReservation.nights} noites</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium shadow-lg">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveTab("chat")}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-medium">{guest.name}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">{guest.loyaltyTier}</span>
                  </div>
                </div>
                <Avatar className="ring-2 ring-amber-400/50 ring-offset-2">
                  <AvatarImage src={guest.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-semibold">
                    {guest.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={cn(
            "hidden lg:block w-72 shrink-0 space-y-4 sticky top-24 h-fit",
            sidebarCollapsed && "lg:hidden"
          )}>
            {/* Profile Card */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-20" />
              </div>
              <CardContent className="pt-0 -mt-10 relative">
                <div className="flex flex-col items-center">
                  <Avatar className="w-20 h-20 border-4 border-white dark:border-slate-900 shadow-xl">
                    <AvatarImage src={guest.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-2xl font-bold">
                      {guest.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-bold text-lg mt-3">{guest.name}</h2>
                  <Badge className="mt-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 shadow-lg shadow-amber-500/25">
                    <Crown className="w-3 h-3 mr-1" />
                    {guest.loyaltyTier} Member
                  </Badge>
                </div>

                {/* Loyalty Progress */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{guest.loyaltyPoints.toLocaleString()} pts</span>
                    <span className="text-xs text-muted-foreground">{guest.nextTier}</span>
                  </div>
                  <Progress value={loyaltyProgress} className="h-2 bg-amber-500/20" />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {(guest.nextTierPoints - guest.loyaltyPoints).toLocaleString()} pts para {guest.nextTier}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xl font-bold text-blue-500">{guest.totalStays}</p>
                    <p className="text-xs text-muted-foreground">Estadias</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xl font-bold text-emerald-500">{guest.memberSince}</p>
                    <p className="text-xs text-muted-foreground">Membro desde</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
              <CardContent className="p-2">
                <ScrollArea className="h-[400px]">
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          activeTab === item.id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.id === "notifications" && unreadNotifications > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white text-[10px] h-5 px-1.5">
                            {unreadNotifications}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </nav>
                </ScrollArea>

                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Sair da Conta</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* HOME TAB */}
            {activeTab === "home" && (
              <>
                {/* Welcome Banner */}
                <Card className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden border-0 shadow-2xl shadow-blue-500/20">
                  <CardContent className="p-6 md:p-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <Badge className="bg-white/20 text-white border-0 mb-4">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {activeReservation ? "Estadia Ativa" : "Bem-vindo de volta!"}
                          </Badge>
                          <h2 className="text-2xl md:text-3xl font-bold mb-2">
                            Olá, {guest.name.split(' ')[0]}! 👋
                          </h2>
                          {activeReservation ? (
                            <p className="text-blue-100 mb-4 text-lg">
                              Aproveite sua estadia no {activeReservation.roomType}
                            </p>
                          ) : (
                            <p className="text-blue-100 mb-4">
                              Que bom ter você de volta. Planeje sua próxima estadia!
                            </p>
                          )}
                        </div>

                        {activeReservation && (
                          <div className="text-right bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <p className="text-sm text-blue-100">Quarto</p>
                            <p className="text-4xl font-bold">{activeReservation.roomNumber}</p>
                            <p className="text-sm text-blue-100">{activeReservation.floor}º Andar</p>
                          </div>
                        )}
                      </div>

                      {activeReservation && (
                        <div className="mt-6 flex flex-wrap items-center gap-4 md:gap-8">
                          <div>
                            <p className="text-sm text-blue-100">Check-in</p>
                            <p className="font-semibold">{new Date(activeReservation.checkIn).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="hidden md:block w-24 h-px bg-white/30 rounded-full" />
                          <div>
                            <p className="text-sm text-blue-100">Check-out</p>
                            <p className="font-semibold">{new Date(activeReservation.checkOut).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="hidden md:block w-24 h-px bg-white/30 rounded-full" />
                          <div>
                            <p className="text-sm text-blue-100">Hóspedes</p>
                            <p className="font-semibold">{activeReservation.adults} adulto(s){activeReservation.children > 0 && `, ${activeReservation.children} criança(s)`}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => setActiveTab("digitalkey")}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Chave Digital
                        </Button>
                        <Button
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => setActiveTab("requests")}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Solicitação
                        </Button>
                        <Button
                          className="bg-white text-blue-600 hover:bg-blue-50"
                          onClick={() => setActiveTab("chat")}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          Assistente IA
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Services Grid */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Serviços Rápidos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {quickServices.map((service) => (
                      <button
                        key={service.label}
                        className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-center group"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg",
                          service.color
                        )}>
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-medium text-sm">{service.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Requests */}
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">Solicitações Recentes</CardTitle>
                        <CardDescription>Acompanhe suas solicitações</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("requests")}>
                        Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {myRequests.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhuma solicitação ainda. Abra uma na aba &quot;Solicitações&quot;.
                          </p>
                        ) : (
                          myRequests.slice(0, 3).map((request) => (
                            <div key={request.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                request.status === "completed" && "bg-emerald-500/10",
                                request.status === "in_progress" && "bg-blue-500/10",
                                request.status === "pending" && "bg-amber-500/10"
                              )}>
                                {request.status === "completed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : request.status === "in_progress" ? (
                                  <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                                ) : (
                                  <Clock className="w-5 h-5 text-amber-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{request.type}</p>
                                <p className="text-sm text-muted-foreground truncate">{request.description}</p>
                              </div>
                              <Badge variant="outline" className={getStatusColor(request.status)}>
                                {request.status === "completed" ? "Concluído" : request.status === "in_progress" ? "Em Andamento" : "Pendente"}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-lg">Recomendados para Você</CardTitle>
                        <CardDescription>Experiências personalizadas</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("experiences")}>
                        Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {experiences.slice(0, 3).map((exp) => (
                          <div key={exp.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                              {exp.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{exp.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  {exp.rating}
                                </span>
                                <span>•</span>
                                <span>{exp.duration}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600">{formatCurrency(exp.price)}</p>
                              <p className="text-xs text-muted-foreground">por pessoa</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Reservations Preview */}
                {myReservations.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
                    <CardHeader>
                      <CardTitle>Suas Reservas</CardTitle>
                      <CardDescription>Resumo rápido das reservas mais recentes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {myReservations.slice(0, 3).map((reservation) => (
                        <div key={`home-res-${reservation.id}`} className="rounded-xl border p-4 bg-slate-50/80 dark:bg-slate-800/40">
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base">{reservation.roomType}</h3>
                                <Badge variant="outline" className={getStatusColor(reservation.status)}>
                                  {reservation.status === "active" ? "Ativa" :
                                    reservation.status === "upcoming" ? "Próxima" :
                                      reservation.status === "completed" ? "Concluída" : "Cancelada"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{reservation.room}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Código da reserva: <span className="font-semibold text-foreground">#{getReservationCode(reservation)}</span>
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(reservation.checkIn).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {reservation.guests} hóspedes
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(reservation.total)}</p>
                              <div className="mt-2 flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Ver detalhes
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                  onClick={() => {
                                    setCheckinReservationId(Number(reservation.id));
                                    setCheckinStep(1);
                                    setCheckinPaymentModalOpen(false);
                                    setActiveTab("checkin");
                                  }}
                                >
                                  <ClipboardCheck className="w-4 h-4 mr-2" />
                                  Fazer Web Check-in
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* WEB CHECK-IN TAB */}
            {activeTab === "checkin" && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Web Check-in</CardTitle>
                      <CardDescription>Complete seu check-in online e agilize sua chegada</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {myReservations.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-sm text-amber-900 dark:text-amber-100">
                      Nenhuma reserva vinculada à sua conta. Entre com o código da reserva ou cadastre-se com o e-mail da reserva.
                    </div>
                  )}
                  {myReservations.length > 0 && !checkinReservationId && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-800 p-4 text-sm text-blue-900 dark:text-blue-100">
                      Não há reserva <strong>confirmada/pendente</strong> elegível para web check-in, ou o check-in online já foi concluído para sua próxima estadia.
                    </div>
                  )}
                  {checkinReservationId != null && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-3 text-sm text-muted-foreground">
                      Reserva {selectedCheckinReservationCode ? `#${selectedCheckinReservationCode}` : `#${checkinReservationId}`}
                      {selectedCheckinReservation?.propertyName
                        ? ` · ${selectedCheckinReservation.propertyName}`
                        : ""}
                    </div>
                  )}
                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                          checkinStep >= step
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        )}>
                          {checkinStep > step ? <Check className="w-5 h-5" /> : step}
                        </div>
                        {step < 4 && (
                          <div className={cn(
                            "hidden sm:block w-16 md:w-24 h-1 mx-2 rounded-full transition-all",
                            checkinStep > step ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-sm text-muted-foreground mb-6">
                    <span className="font-medium">{["Dados Pessoais", "Documentos", "Preferências", "Confirmação"][checkinStep - 1]}</span>
                  </div>

                  {/* Step Content */}
                  {checkinStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Nome Completo</label>
                          <Input
                            value={checkinFormData.name}
                            onChange={(e) => handleCheckinChange('name', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            value={checkinFormData.email}
                            onChange={(e) => handleCheckinChange('email', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Telefone</label>
                          <Input
                            value={checkinFormData.phone}
                            onChange={(e) => handleCheckinChange('phone', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">CPF</label>
                          <Input
                            value={checkinFormData.cpf}
                            onChange={(e) => handleCheckinChange('cpf', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {checkinStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Envie fotos nítidas (e PDF do contrato, se preferir). Os arquivos são gravados na nuvem ou no
                        servidor do hotel, conforme a configuração de armazenamento ativa no sistema.
                      </p>
                      <input
                        ref={checkinDocInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          void handleWebCheckinImageSelected(f, "document");
                        }}
                      />
                      <input
                        ref={checkinSelfieInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          void handleWebCheckinImageSelected(f, "selfie");
                        }}
                      />
                      <input
                        ref={checkinSignedContractInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          void handleWebCheckinImageSelected(f, "signed_contract");
                        }}
                      />
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center space-y-3">
                        <Camera className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="font-medium">Foto do documento</p>
                        <p className="text-sm text-muted-foreground">RG, CNH ou passaporte (frente legível)</p>
                        {checkinDocumentFullUrl ? (
                          <div className="space-y-2">
                            <img
                              src={checkinDocumentFullUrl}
                              alt="Documento"
                              className="max-h-48 mx-auto rounded-lg border object-contain bg-slate-100 dark:bg-slate-800"
                            />
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Enviado</Badge>
                          </div>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingCheckinDocument}
                          onClick={() => checkinDocInputRef.current?.click()}
                        >
                          {uploadingCheckinDocument ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              {checkinDocumentFullUrl ? "Trocar foto" : "Escolher / tirar foto"}
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center space-y-3">
                        <User className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="font-medium">Selfie de verificação</p>
                        <p className="text-sm text-muted-foreground">Rosto visível, sem óculos escuros ou boné</p>
                        {checkinSelfieFullUrl ? (
                          <div className="space-y-2">
                            <img
                              src={checkinSelfieFullUrl}
                              alt="Selfie"
                              className="max-h-48 mx-auto rounded-lg border object-contain bg-slate-100 dark:bg-slate-800"
                            />
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Enviado</Badge>
                          </div>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingCheckinSelfie}
                          onClick={() => checkinSelfieInputRef.current?.click()}
                        >
                          {uploadingCheckinSelfie ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              {checkinSelfieFullUrl ? "Trocar selfie" : "Escolher / tirar selfie"}
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center space-y-3">
                        <FileSignature className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="font-medium">Contrato assinado</p>
                        <p className="text-sm text-muted-foreground">
                          Foto do contrato assinado ou arquivo PDF (todas as páginas legíveis)
                        </p>
                        {checkinSignedContractFullUrl ? (
                          <div className="space-y-2">
                            {checkinSignedContractIsPdf ? (
                              <div className="rounded-lg border bg-slate-100 dark:bg-slate-800 p-4 text-sm">
                                <p className="font-medium text-foreground mb-2">PDF enviado</p>
                                <a
                                  href={checkinSignedContractFullUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Abrir contrato (PDF)
                                </a>
                              </div>
                            ) : (
                              <img
                                src={checkinSignedContractFullUrl}
                                alt="Contrato assinado"
                                className="max-h-48 mx-auto rounded-lg border object-contain bg-slate-100 dark:bg-slate-800"
                              />
                            )}
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">Enviado</Badge>
                          </div>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingCheckinSignedContract}
                          onClick={() => checkinSignedContractInputRef.current?.click()}
                        >
                          {uploadingCheckinSignedContract ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-2" />
                              {checkinSignedContractFullUrl ? "Trocar arquivo" : "Enviar foto ou PDF"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {checkinStep === 3 && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-cyan-200/70 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/60 dark:from-cyan-950/35 dark:via-slate-900 dark:to-teal-950/25 p-5 sm:p-6 space-y-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-lg tracking-tight">Pagamento da reserva</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                              Etapa opcional. Saldo pendente pode ser quitado com PIX (Efí ou chave cadastrada no hotel).
                            </p>
                          </div>
                        </div>
                        {webCheckinPixLoading && (
                          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl bg-white/50 dark:bg-slate-800/40 border border-dashed border-cyan-200/60 dark:border-cyan-900/50">
                            <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
                            <p className="text-sm text-muted-foreground">Preparando opções de pagamento...</p>
                          </div>
                        )}
                        {!webCheckinPixLoading &&
                          webCheckinPixPayload?.configured === false &&
                          webCheckinPixPayload.reason === "NO_BALANCE" && (
                            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-900/50 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                              Não há saldo pendente nesta reserva — nada a pagar nesta etapa.
                            </div>
                          )}
                        {!webCheckinPixLoading &&
                          webCheckinPixPayload?.configured === false &&
                          webCheckinPixPayload.reason === "NO_PIX_METHOD" && (
                            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/25 dark:border-amber-900/50 p-4 text-sm text-amber-900 dark:text-amber-100">
                              PIX não está disponível no sistema no momento. Em caso de pendência, pague na recepção.
                            </div>
                          )}
                        {!webCheckinPixLoading &&
                          webCheckinPixPayload?.configured === true &&
                          webCheckinPixPayload.brCode && (
                            <>
                              <div className="rounded-xl bg-white/70 dark:bg-slate-800/60 border border-cyan-100 dark:border-cyan-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Valor a pagar
                                  </p>
                                  <p className="text-3xl sm:text-4xl font-bold tabular-nums bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                                    {formatCurrency(Number(webCheckinPixPayload.amount ?? 0))}
                                  </p>
                                  {webCheckinPixPayload.reservationNumber ? (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Ref. {webCheckinPixPayload.reservationNumber}
                                    </p>
                                  ) : null}
                                </div>
                                {webCheckinPixPayload.provider === "efi" ? (
                                  <Badge className="w-fit bg-cyan-600 hover:bg-cyan-600 text-white border-0">
                                    PIX dinâmico · Efí
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="w-fit">
                                    PIX estático
                                  </Badge>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="lg"
                                className="w-full min-h-[3.5rem] text-base font-semibold rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-700 text-white shadow-xl shadow-cyan-500/20 border-0 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                onClick={() => setCheckinPaymentModalOpen(true)}
                              >
                                <QrCode className="w-6 h-6 mr-2 shrink-0" />
                                Efetuar pagamento
                              </Button>
                              <p className="text-xs text-center text-muted-foreground px-2">
                                Abre o QR Code e o código copia e cola em uma janela dedicada.
                              </p>
                              <div className="flex items-start gap-3 pt-3 border-t border-cyan-200/50 dark:border-cyan-900/40">
                                <Checkbox
                                  id="webcheckin-pix-declared"
                                  checked={pixPaymentDeclared}
                                  onCheckedChange={(c) => setPixPaymentDeclared(c === true)}
                                  className="mt-0.5"
                                />
                                <label
                                  htmlFor="webcheckin-pix-declared"
                                  className="text-sm leading-snug cursor-pointer"
                                >
                                  Declaro que realizei o pagamento (ou vou realizar em seguida) via PIX e autorizo a
                                  recepção a conferir o crédito.
                                </label>
                              </div>
                            </>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Thermometer className="w-5 h-5 text-blue-500" />
                            <span>Temperatura do Quarto</span>
                          </div>
                          <span className="font-semibold">{guest.preferences.roomTemp}°C</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <BedDouble className="w-5 h-5 text-purple-500" />
                            <span>Tipo de Travesseiro</span>
                          </div>
                          <span className="font-semibold">{guest.preferences.pillow}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                            <span>Preferência de Andar</span>
                          </div>
                          <span className="font-semibold">{guest.preferences.floor}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-cyan-500" />
                            <span>Vista Preferida</span>
                          </div>
                          <span className="font-semibold">{guest.preferences.view}</span>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Observações ou pedidos especiais..."
                        className="mt-4"
                        value={checkinNotes}
                        onChange={(e) => setCheckinNotes(e.target.value)}
                      />
                    </div>
                  )}

                  {checkinStep === 4 && (
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Check-in Concluído!</h3>
                        <p className="text-muted-foreground">Sua chave digital está pronta para uso</p>
                      </div>
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => setActiveTab("digitalkey")}>
                        <Key className="w-4 h-4 mr-2" />
                        Acessar Chave Digital
                      </Button>
                    </div>
                  )}

                  {checkinStep < 4 && (
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCheckinStep(Math.max(1, checkinStep - 1))}
                        disabled={checkinStep === 1 || isSubmittingCheckin}
                      >
                        Voltar
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        disabled={
                          isSubmittingCheckin ||
                          uploadingCheckinDocument ||
                          uploadingCheckinSelfie ||
                          uploadingCheckinSignedContract ||
                          (checkinStep === 2 &&
                            (!checkinDocumentFullUrl ||
                              !checkinSelfieFullUrl ||
                              !checkinSignedContractFullUrl)) ||
                          (checkinStep === 3 && (!checkinReservationId || myReservations.length === 0))
                        }
                        onClick={async () => {
                          if (checkinStep === 3) {
                            if (!checkinReservationId) {
                              toast.error("Nenhuma reserva disponível para web check-in.");
                              return;
                            }
                            if (
                              !checkinDocumentFullUrl ||
                              !checkinSelfieFullUrl ||
                              !checkinSignedContractFullUrl
                            ) {
                              toast.error(
                                "Envie a foto do documento, a selfie e o contrato assinado antes de confirmar."
                              );
                              return;
                            }
                            setIsSubmittingCheckin(true);
                            try {
                              const res = await api.guestSubmitWebCheckin({
                                reservationId: checkinReservationId,
                                fullName: checkinFormData.name,
                                phone: checkinFormData.phone,
                                documentNumber: checkinFormData.cpf,
                                email: checkinFormData.email,
                                specialRequests: checkinNotes.trim() || undefined,
                                documentPhotoUrl: checkinDocumentFullUrl,
                                selfiePhotoUrl: checkinSelfieFullUrl,
                                signedContractPhotoUrl: checkinSignedContractFullUrl,
                                pixPaymentDeclared:
                                  webCheckinPixPayload?.configured === true ? pixPaymentDeclared : false,
                                pixGatewayTxid:
                                  webCheckinPixPayload?.provider === "efi" && webCheckinPixPayload?.txid
                                    ? webCheckinPixPayload.txid
                                    : undefined,
                                pixGatewayProvider: webCheckinPixPayload?.provider,
                              });
                              if (res.success) {
                                toast.success("Web check-in registrado com sucesso!");
                                await fetchReservations();
                                await refreshGuestUser();
                                setCheckinStep(4);
                              } else {
                                toast.error(res.error?.message || "Não foi possível concluir o check-in.");
                              }
                            } catch {
                              toast.error("Não foi possível concluir o check-in.");
                            } finally {
                              setIsSubmittingCheckin(false);
                            }
                            return;
                          }
                          if (checkinStep === 2) {
                            if (
                              !checkinDocumentFullUrl ||
                              !checkinSelfieFullUrl ||
                              !checkinSignedContractFullUrl
                            ) {
                              toast.error(
                                "Envie a foto do documento, a selfie e o contrato assinado para continuar."
                              );
                              return;
                            }
                            setCheckinStep(3);
                            return;
                          }
                          setCheckinStep(checkinStep + 1);
                        }}
                      >
                        {checkinStep === 3 ? (
                          isSubmittingCheckin ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              Confirmar check-in
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                          )
                        ) : (
                          <>
                            Próximo
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                <Dialog open={checkinPaymentModalOpen} onOpenChange={setCheckinPaymentModalOpen}>
                  <DialogContent
                    className={cn(
                      "max-w-[calc(100vw-1rem)] sm:max-w-xl md:max-w-2xl gap-0 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl",
                      "max-h-[min(92vh,920px)] flex flex-col"
                    )}
                  >
                    {webCheckinPixPayload?.configured === true && webCheckinPixPayload.brCode ? (
                      <>
                        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 px-6 pt-7 pb-14 text-white shrink-0">
                          <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_20%_0%,white,transparent_55%)]" />
                          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                          <DialogHeader className="relative space-y-1.5 text-left">
                            <DialogTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                <QrCode className="h-6 w-6" />
                              </span>
                              Pagamento PIX
                            </DialogTitle>
                            <DialogDescription className="text-cyan-50/95 text-sm sm:text-base">
                              Escaneie o QR Code no app do banco ou copie o código abaixo (PIX copia e cola).
                            </DialogDescription>
                          </DialogHeader>
                          <div className="relative mt-5 flex flex-wrap items-end gap-2">
                            <span className="text-sm font-medium text-cyan-100/90">Valor</span>
                            <span className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
                              {formatCurrency(Number(webCheckinPixPayload.amount ?? 0))}
                            </span>
                          </div>
                          {webCheckinPixPayload.reservationNumber ? (
                            <p className="relative mt-2 text-sm text-cyan-100/80">
                              Reserva {webCheckinPixPayload.reservationNumber}
                            </p>
                          ) : null}
                        </div>

                        <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 pb-6 pt-0 -mt-8 space-y-5">
                          <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl p-5 sm:p-6 flex flex-col items-center">
                            {webCheckinPixPayload.qrCodeDataUrl ? (
                              <img
                                src={webCheckinPixPayload.qrCodeDataUrl}
                                alt="QR Code PIX"
                                className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-4 border-slate-100 dark:border-slate-800 bg-white shadow-inner"
                              />
                            ) : null}
                            <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm leading-relaxed">
                              Abra o app do seu banco, escolha <strong>PIX</strong> e aponte a câmera para o QR ou use{" "}
                              <strong>PIX copia e cola</strong>.
                            </p>
                          </div>

                          {webCheckinPixPayload.provider === "efi" && webCheckinPixPayload.txid ? (
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-900/80 px-4 py-3 text-xs">
                              <span className="font-semibold text-foreground">ID da cobrança (Efí): </span>
                              <span className="font-mono break-all text-muted-foreground">
                                {webCheckinPixPayload.txid}
                              </span>
                            </div>
                          ) : null}

                          {webCheckinPixPayload.pixKeyMasked ? (
                            <p className="text-xs text-muted-foreground text-center">
                              Chave (referência): {webCheckinPixPayload.pixKeyMasked}
                            </p>
                          ) : null}

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Código copia e cola
                            </Label>
                            <ScrollArea className="h-[100px] w-full rounded-xl border bg-slate-50 dark:bg-slate-900/50">
                              <p className="p-3 text-[11px] sm:text-xs font-mono break-all leading-relaxed pr-6">
                                {webCheckinPixPayload.brCode}
                              </p>
                            </ScrollArea>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <Button
                              type="button"
                              size="lg"
                              className="h-12 sm:h-14 text-base rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-lg"
                              onClick={() => {
                                const code = webCheckinPixPayload.brCode || "";
                                void navigator.clipboard
                                  .writeText(code)
                                  .then(() => toast.success("Código PIX copiado!"))
                                  .catch(() => toast.error("Não foi possível copiar."));
                              }}
                            >
                              <Copy className="w-5 h-5 mr-2 shrink-0" />
                              Copiar código PIX
                            </Button>
                            <Button
                              type="button"
                              size="lg"
                              variant="outline"
                              className="h-12 sm:h-14 text-base rounded-xl border-2"
                              onClick={() => setCheckinPaymentModalOpen(false)}
                            >
                              Fechar janela
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-10 text-center space-y-3">
                        <p className="text-muted-foreground">Não foi possível carregar o PIX. Tente fechar e abrir de novo.</p>
                        <Button variant="outline" onClick={() => setCheckinPaymentModalOpen(false)}>
                          Fechar
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                </CardContent>
              </Card>
            )}

            {/* DIGITAL KEY TAB */}
            {activeTab === "digitalkey" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />

                    <div className="relative z-10 text-center">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-6">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Chave Ativa
                      </Badge>

                      <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                        <Key className="w-16 h-16 text-white" />
                      </div>

                      <h2 className="text-4xl font-bold mb-2">
                        {digitalKeyReservation?.roomNumber || "---"}
                      </h2>
                      <p className="text-slate-400 mb-2">{digitalKeyReservation?.roomType || "Sem reserva ativa"}</p>
                      <p className="text-xs text-slate-500 mb-6">
                        Reserva #{getReservationCode(digitalKeyReservation || {})}
                      </p>

                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-xl"
                        onClick={() => {
                          setShowDigitalKey(true);
                          toast.success("Porta desbloqueada!");
                        }}
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        Desbloquear Porta
                      </Button>

                      <p className="text-xs text-slate-500 mt-4">
                        Aproxime o celular do leitor da porta
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Acessos Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { name: "Quarto Principal", icon: BedDouble, status: "active" },
                        { name: "Academia", icon: Dumbbell, status: "active" },
                        { name: "Piscina", icon: Waves, status: "active" },
                        { name: "Spa (Reservado)", icon: Sparkles, status: "scheduled" },
                        { name: "Estacionamento", icon: Car, status: "active" },
                      ].map((access, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              access.status === "active" ? "bg-emerald-500/10" : "bg-amber-500/10"
                            )}>
                              <access.icon className={cn(
                                "w-5 h-5",
                                access.status === "active" ? "text-emerald-500" : "text-amber-500"
                              )} />
                            </div>
                            <span className="font-medium">{access.name}</span>
                          </div>
                          <Badge variant="outline" className={cn(
                            access.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          )}>
                            {access.status === "active" ? "Liberado" : "Agendado"}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">QR Code da Chave</CardTitle>
                      <CardDescription>Use para acessar áreas comuns</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="w-40 h-40 mx-auto bg-white p-4 rounded-xl shadow-lg">
                        <div className="w-full h-full bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:20%_20%] rounded" />
                      </div>
                      <Button variant="outline" className="mt-4">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar com acompanhante
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ROOM CONTROL TAB */}
            {activeTab === "roomcontrol" && (
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <Thermometer className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>Controle do Quarto</CardTitle>
                          <CardDescription>Quarto {activeReservation?.roomNumber || "---"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <Wifi className="w-3 h-3 mr-1" />
                        Conectado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roomSettings.map((control) => (
                        <Card key={control.id} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                  <control.icon className="w-5 h-5 text-cyan-500" />
                                </div>
                                <span className="font-medium">{control.name}</span>
                              </div>
                              {control.type === "toggle" && (
                                <Switch
                                  checked={control.value}
                                  onCheckedChange={(checked) => handleRoomControlChange(control.id, checked)}
                                />
                              )}
                            </div>
                            {control.type === "slider" && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{control.min}{control.name.includes("Temp") ? "°C" : "%"}</span>
                                  <span className="font-semibold text-lg">{control.value}{control.name.includes("Temp") ? "°C" : "%"}</span>
                                  <span className="text-muted-foreground">{control.max}{control.name.includes("Temp") ? "°C" : "%"}</span>
                                </div>
                                <input
                                  type="range"
                                  min={control.min}
                                  max={control.max}
                                  value={control.value}
                                  onChange={(e) => handleRoomControlChange(control.id, parseInt(e.target.value))}
                                  className="w-full accent-cyan-500"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Scenes */}
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Cenas Rápidas</CardTitle>
                    <CardDescription>Configure o ambiente com um toque</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: "Acordar", icon: Sun, color: "from-amber-500 to-yellow-500" },
                        { name: "Relaxar", icon: Moon, color: "from-indigo-500 to-purple-500" },
                        { name: "Trabalho", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
                        { name: "Dormir", icon: BedDouble, color: "from-slate-600 to-slate-700" },
                      ].map((scene) => (
                        <button
                          key={scene.name}
                          className="p-6 rounded-2xl bg-gradient-to-br border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all text-center group"
                          onClick={() => toast.success(`Cena "${scene.name}" ativada!`)}
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                            scene.color
                          )}>
                            <scene.icon className="w-7 h-7 text-white" />
                          </div>
                          <p className="font-medium">{scene.name}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* RESERVATIONS TAB */}
            {activeTab === "reservations" && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Minhas Reservas</CardTitle>
                      <CardDescription>Histórico completo de suas estadias</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Reserva
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myReservations.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhuma reserva encontrada.</p>
                      </div>
                    ) : (
                      myReservations.map((reservation) => (
                        <Card key={reservation.id} className={cn(
                          "border-l-4 transition-all hover:shadow-lg",
                          reservation.status === "active" && "border-l-emerald-500",
                          reservation.status === "upcoming" && "border-l-blue-500",
                          reservation.status === "completed" && "border-l-slate-400",
                          reservation.status === "cancelled" && "border-l-red-500"
                        )}>
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg",
                                  reservation.status === "active" && "bg-gradient-to-br from-emerald-500 to-teal-600",
                                  reservation.status === "upcoming" && "bg-gradient-to-br from-blue-500 to-indigo-600",
                                  reservation.status === "completed" && "bg-gradient-to-br from-slate-400 to-slate-500",
                                  reservation.status === "cancelled" && "bg-gradient-to-br from-red-500 to-rose-600"
                                )}>
                                  {reservation.roomNumber}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{reservation.roomType}</h3>
                                    <Badge variant="outline" className={getStatusColor(reservation.status)}>
                                      {reservation.status === "active" ? "Ativa" :
                                        reservation.status === "upcoming" ? "Próxima" :
                                          reservation.status === "completed" ? "Concluída" : "Cancelada"}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{reservation.room}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Código da reserva: <span className="font-semibold text-foreground">#{getReservationCode(reservation)}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(reservation.checkIn).toLocaleDateString('pt-BR')} - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-4 h-4" />
                                      {reservation.guests} hóspedes
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {reservation.nights} noites
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{formatCurrency(reservation.total)}</p>
                                {reservation.services.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2 justify-end">
                                    {reservation.services.slice(0, 2).map((service, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                    {reservation.services.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{reservation.services.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Detalhes
                              </Button>
                              {reservation.status === "completed" && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Comprovante
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Star className="w-4 h-4 mr-2" />
                                    Avaliar
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCheckinReservationId(Number(reservation.id));
                                  setCheckinStep(1);
                                  setCheckinPaymentModalOpen(false);
                                  setActiveTab("checkin");
                                }}
                              >
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                Web Check-in
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setDigitalKeyReservationId(Number(reservation.id));
                                  setActiveTab("digitalkey");
                                }}
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Chave Digital
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* REQUESTS TAB */}
            {activeTab === "requests" && (
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Solicitações de Serviço</CardTitle>
                        <CardDescription>Gerencie suas solicitações</CardDescription>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600" onClick={() => setShowNewRequestModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Solicitação
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myRequests.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Nenhuma solicitação encontrada.</p>
                        </div>
                      ) : (
                        myRequests.map((request) => {
                          const Icon = getCategoryIcon(request.category);
                          const resInfo = (request as { reservationInfo?: string | null }).reservationInfo;
                          return (
                            <Card key={String(request.id)} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className={cn(
                                      "w-12 h-12 rounded-xl flex items-center justify-center",
                                      request.status === "completed" && "bg-emerald-500/10",
                                      request.status === "in_progress" && "bg-blue-500/10",
                                      request.status === "pending" && "bg-amber-500/10",
                                      request.status === "cancelled" && "bg-red-500/10"
                                    )}>
                                      <Icon className={cn(
                                        "w-6 h-6",
                                        request.status === "completed" && "text-emerald-500",
                                        request.status === "in_progress" && "text-blue-500",
                                        request.status === "pending" && "text-amber-500",
                                        request.status === "cancelled" && "text-red-500"
                                      )} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{request.type}</h3>
                                        <Badge variant="outline" className={getStatusColor(request.status)}>
                                          {request.status === "completed" ? "Concluído" :
                                            request.status === "in_progress" ? "Em Andamento" :
                                              request.status === "cancelled" ? "Cancelado" : "Pendente"}
                                        </Badge>
                                        {request.priority === "high" && (
                                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                                            Urgente
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground">{request.description}</p>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {request.createdAt}
                                        </span>
                                        {resInfo && (
                                          <span className="flex items-center gap-1">
                                            <BedDouble className="w-4 h-4" />
                                            {resInfo}
                                          </span>
                                        )}
                                        {request.estimatedTime && (
                                          <span className="flex items-center gap-1">
                                            <Timer className="w-4 h-4" />
                                            Est. {request.estimatedTime}
                                          </span>
                                        )}
                                        {request.staff && (
                                          <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {request.staff}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI CHAT TAB */}
            {activeTab === "chat" && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-[calc(100vh-200px)] flex flex-col">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Assistente Virtual</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Online - Resposta instantânea
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                          "flex gap-3",
                          msg.sender === "guest" && "flex-row-reverse"
                        )}>
                          <Avatar className="w-8 h-8">
                            {msg.sender === "bot" ? (
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {guest.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-3",
                            msg.sender === "guest"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-md"
                              : "bg-slate-100 dark:bg-slate-800 rounded-tl-md"
                          )}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              msg.sender === "guest" ? "text-blue-100" : "text-muted-foreground"
                            )}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-600"
                      onClick={handleSendMessage}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {["Room Service", "Reservar Restaurante", "Pedir Transfer", "Falar com Recepção"].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setChatMessage(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* EXPERIENCES TAB */}
            {activeTab === "experiences" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Experiências</h2>
                    <p className="text-muted-foreground">Descubra atividades exclusivas</p>
                  </div>
                  <div className="flex gap-2">
                    {["Todas", "Gastronomia", "Bem-estar", "Aventura"].map((cat) => (
                      <Button key={cat} variant="outline" size="sm">
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experiences.map((exp) => (
                    <Card key={exp.id} className={cn(
                      "overflow-hidden hover:shadow-xl transition-all group",
                      !exp.available && "opacity-60"
                    )}>
                      <div className="h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                        {exp.image}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{exp.category}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-medium">{exp.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{exp.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(exp.price)}</p>
                            <p className="text-xs text-muted-foreground">{exp.duration} • por pessoa</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-600"
                            disabled={!exp.available}
                          >
                            {exp.available ? "Reservar" : "Indisponível"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* RESTAURANTS TAB */}
            {activeTab === "restaurants" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Restaurantes & Bares</h2>
                  <p className="text-muted-foreground">Gastronomia de excelência</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "La Vie Restaurant", type: "Fine Dining", hours: "19h - 23h", cuisine: "Francesa", rating: 4.9, image: "🍷" },
                    { name: "Ocean Grill", type: "Casual", hours: "12h - 22h", cuisine: "Frutos do Mar", rating: 4.8, image: "🦞" },
                    { name: "Sakura Sushi", type: "À la carte", hours: "18h - 23h", cuisine: "Japonesa", rating: 4.9, image: "🍣" },
                    { name: "Rooftop Bar", type: "Bar & Lounge", hours: "17h - 02h", cuisine: "Drinks & Petiscos", rating: 4.7, image: "🍸" },
                  ].map((restaurant) => (
                    <Card key={restaurant.name} className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-5xl">
                        {restaurant.image}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{restaurant.type}</Badge>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {restaurant.hours}
                          </span>
                          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600">
                            Reservar Mesa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* LOYALTY TAB */}
            {activeTab === "loyalty" && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white overflow-hidden border-0">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Crown className="w-10 h-10" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold">{guest.loyaltyTier} Member</h2>
                          <p className="text-amber-100">Membro desde {guest.memberSince}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                          <p className="text-3xl font-bold">{guest.loyaltyPoints.toLocaleString()}</p>
                          <p className="text-amber-100">Pontos</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                          <p className="text-3xl font-bold">{guest.totalStays}</p>
                          <p className="text-amber-100">Estadias</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                          <p className="text-3xl font-bold">{guest.nextTier}</p>
                          <p className="text-amber-100">Próximo Nível</p>
                        </div>
                      </div>

                      <div className="bg-white/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span>{guest.loyaltyPoints.toLocaleString()} pts</span>
                          <span>{guest.nextTierPoints.toLocaleString()} pts</span>
                        </div>
                        <Progress value={loyaltyProgress} className="h-3 bg-white/30" />
                        <p className="text-center text-sm mt-2 text-amber-100">
                          Faltam {(guest.nextTierPoints - guest.loyaltyPoints).toLocaleString()} pontos para {guest.nextTier}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Recompensas Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loyaltyRewards.map((reward) => (
                      <Card key={reward.id} className="hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary">{reward.category}</Badge>
                            <span className="font-bold text-amber-600">{reward.points.toLocaleString()} pts</span>
                          </div>
                          <h4 className="font-semibold mb-1">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                          <Button
                            className="w-full"
                            variant={guest.loyaltyPoints >= reward.points ? "default" : "outline"}
                            disabled={guest.loyaltyPoints < reward.points}
                          >
                            {guest.loyaltyPoints >= reward.points ? "Resgatar" : "Pontos Insuficientes"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Conta Corrente</CardTitle>
                    <CardDescription>Resumo financeiro da reserva (dados do sistema)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!financeReservation && (
                      <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma reserva para exibir.</p>
                    )}
                    {financeReservation && (
                      <>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-sm">
                          <p className="text-muted-foreground">
                            Reserva #{financeReservation.id}
                            {financeReservation.propertyName ? ` · ${financeReservation.propertyName}` : ""}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground">Hospedagem (total - extras)</span>
                            <span className="font-semibold">
                              {formatCurrency(
                                Math.max(0, Number(financeReservation.total) - Number(financeReservation.extrasTotal || 0))
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground">Extras / itens</span>
                            <span className="font-semibold">{formatCurrency(Number(financeReservation.extrasTotal || 0))}</span>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Total da reserva</span>
                            <span className="text-xl font-bold">{formatCurrency(Number(financeReservation.total))}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600">
                            <span>Pago</span>
                            <span className="font-medium">{formatCurrency(Number(financeReservation.paid))}</span>
                          </div>
                          <div className="flex items-center justify-between text-amber-600 font-medium">
                            <span>Saldo / pendente</span>
                            <span>{formatCurrency(Number(financeReservation.balance ?? Math.max(0, financeReservation.total - financeReservation.paid)))}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" variant="secondary" disabled>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pagamento no hotel
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedReservation(financeReservation);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Itens e lançamentos</CardTitle>
                    <CardDescription>Extras vinculados à reserva</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {!financeReservation || !financeReservation.items?.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Sem itens extras lançados nesta reserva.</p>
                      ) : (
                        financeReservation.items.map(
                          (
                            it: { name: string; totalPrice: number; quantity?: number; type?: string },
                            i: number
                          ) => (
                            <div
                              key={`${it.name}-${i}`}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-500/10">
                                  <Receipt className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                  <p className="font-medium">{it.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {it.quantity != null ? `Qtd: ${it.quantity}` : "Item"}
                                    {it.type ? ` · ${it.type}` : ""}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold">{formatCurrency(Number(it.totalPrice || 0))}</span>
                            </div>
                          )
                        )
                      )}
                      {financeReservation && Number(financeReservation.paid) > 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
                              <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-medium">Pagamentos registrados</p>
                              <p className="text-sm text-muted-foreground">Total pago na reserva</p>
                            </div>
                          </div>
                          <span className="font-semibold text-emerald-600">
                            +{formatCurrency(Number(financeReservation.paid))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Notificações</CardTitle>
                      <CardDescription>{unreadNotifications} não lidas</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Marcar todas como lidas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationsList.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer",
                            notification.read
                              ? "bg-slate-50 dark:bg-slate-800/30"
                              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          )}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            notification.type === "success" && "bg-emerald-500/10",
                            notification.type === "warning" && "bg-amber-500/10",
                            notification.type === "promo" && "bg-purple-500/10",
                            notification.type === "info" && "bg-blue-500/10"
                          )}>
                            <Icon className={cn(
                              "w-5 h-5",
                              notification.type === "success" && "text-emerald-500",
                              notification.type === "warning" && "text-amber-500",
                              notification.type === "promo" && "text-purple-500",
                              notification.type === "info" && "text-blue-500"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{notification.title}</h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.createdAt}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>Gerencie seus dados (salvos no cadastro do hóspede)</CardDescription>
                      </div>
                      <Button
                        variant={editingProfile ? "default" : "outline"}
                        size="sm"
                        disabled={isSavingProfile}
                        onClick={async () => {
                          if (!editingProfile) {
                            setProfileEditForm({
                              name: guest.name,
                              phone: guest.phone,
                              nationality: guest.nationality,
                              documentNumber: guest.cpf,
                            });
                            setEditingProfile(true);
                            return;
                          }
                          setIsSavingProfile(true);
                          try {
                            const parts = profileEditForm.name.trim().split(/\s+/);
                            const firstName = parts[0] || guestUser?.firstName || "";
                            const lastName =
                              parts.length > 1 ? parts.slice(1).join(" ") : guestUser?.lastName || "-";
                            const res = await api.updateGuestMe({
                              firstName,
                              lastName,
                              phone: profileEditForm.phone?.trim() || null,
                              documentNumber: profileEditForm.documentNumber?.trim() || null,
                              nationality: profileEditForm.nationality?.trim() || null,
                            });
                            if (res.success) {
                              toast.success("Perfil atualizado.");
                              setEditingProfile(false);
                              await refreshGuestUser();
                            } else {
                              toast.error(res.error?.message || "Erro ao salvar perfil.");
                            }
                          } catch {
                            toast.error("Erro ao salvar perfil.");
                          } finally {
                            setIsSavingProfile(false);
                          }
                        }}
                      >
                        {editingProfile ? (
                          isSavingProfile ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Salvar
                            </>
                          )
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nome Completo</label>
                        <Input
                          value={editingProfile ? profileEditForm.name : guest.name}
                          onChange={(e) =>
                            editingProfile && setProfileEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                          readOnly={!editingProfile}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input value={guest.email} readOnly className="mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">O e-mail não pode ser alterado aqui.</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Telefone</label>
                        <Input
                          value={editingProfile ? profileEditForm.phone : guest.phone}
                          onChange={(e) =>
                            editingProfile && setProfileEditForm((f) => ({ ...f, phone: e.target.value }))
                          }
                          readOnly={!editingProfile}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Documento (CPF / doc.)</label>
                        <Input
                          value={editingProfile ? profileEditForm.documentNumber : guest.cpf}
                          onChange={(e) =>
                            editingProfile &&
                            setProfileEditForm((f) => ({ ...f, documentNumber: e.target.value }))
                          }
                          readOnly={!editingProfile}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Nacionalidade</label>
                        <Input
                          value={editingProfile ? profileEditForm.nationality : guest.nationality}
                          onChange={(e) =>
                            editingProfile &&
                            setProfileEditForm((f) => ({ ...f, nationality: e.target.value }))
                          }
                          readOnly={!editingProfile}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Preferências</CardTitle>
                    <CardDescription>Personalize sua experiência</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Notificações Push</p>
                          <p className="text-sm text-muted-foreground">Receba atualizações em tempo real</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Email Marketing</p>
                          <p className="text-sm text-muted-foreground">Ofertas e promoções exclusivas</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Modo Escuro</p>
                          <p className="text-sm text-muted-foreground">Alterar tema da interface</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="font-medium">Idioma</p>
                          <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Alterar</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="text-red-600">Sair da Conta</CardTitle>
                    <CardDescription>Encerrar sessão neste dispositivo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Reservation Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-6xl p-0 overflow-hidden border-0 rounded-2xl">
          {selectedReservation && (
            <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] max-h-[90vh]">
              <div className="relative hidden md:flex flex-col justify-between p-6 text-white overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"
                  alt="Reserva"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-800/80 to-blue-700/70" />
                <div className="relative z-10">
                  <Badge className="bg-white/20 text-white border-white/20 mb-4">Detalhes da Reserva</Badge>
                  <h3 className="text-2xl font-bold leading-tight">Acompanhe sua estadia em etapas</h3>
                  <p className="text-white/85 text-sm mt-2">Informacoes completas da reserva selecionada.</p>
                </div>
                <div className="relative z-10 space-y-2">
                  {["Resumo", "Acomodacao", "Financeiro"].map((step, i) => (
                    <div key={step} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white text-slate-900 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto p-5 sm:p-7 bg-background">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    Reserva #{getReservationCode(selectedReservation)}
                    <Badge className={cn(
                      "ml-2 text-sm font-medium",
                      selectedReservation.status === "active" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      selectedReservation.status === "upcoming" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                      selectedReservation.status === "completed" && "bg-slate-500/10 text-slate-600 border-slate-500/20",
                      selectedReservation.status === "cancelled" && "bg-red-500/10 text-red-600 border-red-500/20"
                    )}>
                      {selectedReservation.status === "active" && "Hospedado"}
                      {selectedReservation.status === "upcoming" && "Confirmada"}
                      {selectedReservation.status === "completed" && "Concluida"}
                      {selectedReservation.status === "cancelled" && "Cancelada"}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Detalhes robustos da sua reserva, incluindo codigo, acomodacao e financeiro.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                      <h4 className="font-medium flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Datas
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Check-in</p>
                          <p className="font-semibold">{new Date(selectedReservation.checkIn).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase">Check-out</p>
                          <p className="font-semibold">{new Date(selectedReservation.checkOut).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-blue-600">{selectedReservation.nights} noites de estadia</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                      <h4 className="font-medium flex items-center gap-2 text-slate-500">
                        <BedDouble className="w-4 h-4" />
                        Acomodacao
                      </h4>
                      <div>
                        <p className="text-lg font-bold">{selectedReservation.roomNumber}</p>
                        <p className="text-sm text-muted-foreground">{selectedReservation.roomType}</p>
                      </div>
                      <div className="flex gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-sm">
                          <Layers className="w-3 h-3 text-muted-foreground" />
                          {selectedReservation.floor}o Andar
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {selectedReservation.adults} Adt, {selectedReservation.children} Crian
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Itens Inclusos e Servicos
                    </h4>
                    {selectedReservation.services && selectedReservation.services.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedReservation.services.map((service: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-sm font-medium">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Nenhum item adicional listado.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4 text-blue-500" />
                      Resumo Financeiro
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Diaria Base</span>
                        <span>{formatCurrency(selectedReservation.baseRate)}</span>
                      </div>
                      {selectedReservation.taxes > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Taxas e Impostos</span>
                          <span>{formatCurrency(selectedReservation.taxes)}</span>
                        </div>
                      )}
                      {selectedReservation.fees > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Taxas de Servico</span>
                          <span>{formatCurrency(selectedReservation.fees)}</span>
                        </div>
                      )}
                      {selectedReservation.discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-emerald-600">
                          <span className="flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            Descontos
                          </span>
                          <span>- {formatCurrency(selectedReservation.discount)}</span>
                        </div>
                      )}

                      <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-muted-foreground">Valor Total</span>
                        <span className="font-bold text-lg">{formatCurrency(selectedReservation.total)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Valor Pago
                        </span>
                        <span className="font-medium">{formatCurrency(selectedReservation.paid)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => handlePrintReservation(selectedReservation)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  {selectedReservation.status === "active" && (
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      <CreditCardIcon className="w-4 h-4 mr-2" />
                      Pagar Pendencias
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setShowDetailsModal(false)} className="w-full sm:w-auto">
                    Fechar
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showNewRequestModal} onOpenChange={setShowNewRequestModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-0 shadow-2xl">
          <div className="flex flex-col h-full md:max-h-[85vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shrink-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Nova Solicitação
              </DialogTitle>
              <DialogDescription className="text-blue-100 mt-1">
                Como podemos tornar sua estadia ainda melhor? Selecione uma categoria abaixo.
              </DialogDescription>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                {/* Category Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Selecione a Categoria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "housekeeping", label: "Limpeza", icon: Sparkles, color: "from-cyan-500 to-blue-500", desc: "Arrumação, toalhas, amenidades" },
                      { id: "maintenance", label: "Manutenção", icon: Settings, color: "from-slate-500 to-gray-600", desc: "Reparos, ar-condicionado, TV" },
                      { id: "roomservice", label: "Room Service", icon: Utensils, color: "from-orange-500 to-red-500", desc: "Refeições e bebidas no quarto" },
                      { id: "concierge", label: "Concierge", icon: Crown, color: "from-purple-500 to-indigo-500", desc: "Reservas, dicas, transporte" },
                      { id: "transport", label: "Transporte", icon: Car, color: "from-emerald-500 to-green-600", desc: "Transfer, táxi, valet" },
                      { id: "other", label: "Outros", icon: HelpCircle, color: "from-amber-500 to-yellow-600", desc: "Outros pedidos gerais" },
                    ].map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setNewRequestData({ ...newRequestData, category: cat.id })}
                        className={cn(
                          "cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-200 group hover:shadow-lg",
                          newRequestData.category === cat.id
                            ? "border-blue-500 bg-white dark:bg-slate-900 shadow-blue-500/20 shadow-xl scale-[1.02]"
                            : "border-transparent bg-white dark:bg-slate-900/50 hover:border-blue-500/30"
                        )}
                      >
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br",
                          cat.color
                        )} />

                        <div className="p-4 flex flex-col items-center text-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform group-hover:scale-110 duration-300",
                            cat.color
                          )}>
                            <cat.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className={cn(
                              "font-bold transition-colors",
                              newRequestData.category === cat.id ? "text-blue-600" : "text-slate-700 dark:text-slate-200"
                            )}>
                              {cat.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {cat.desc}
                            </p>
                          </div>

                          {newRequestData.category === cat.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md animate-in zoom-in">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Form */}
                <div className={cn(
                  "space-y-6 transition-all duration-500 ease-in-out",
                  newRequestData.category ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4 pointer-events-none grayscale"
                )}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-base">Assunto</Label>
                      <Input
                        id="type"
                        placeholder="Ex: Solicitação de toalhas extras"
                        className="h-11 bg-white dark:bg-slate-900"
                        value={newRequestData.type}
                        onChange={(e) => setNewRequestData({ ...newRequestData, type: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-base">Prioridade</Label>
                      <Select
                        value={newRequestData.priority}
                        onValueChange={(value) => setNewRequestData({ ...newRequestData, priority: value })}
                      >
                        <SelectTrigger id="priority" className="h-11 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Baixa
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              Normal
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Alta (Urgente)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Detalhes da Solicitação</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva detalhadamente o que você precisa para podermos ajudar melhor..."
                      className="min-h-[120px] resize-none bg-white dark:bg-slate-900 text-base"
                      value={newRequestData.description}
                      onChange={(e) => setNewRequestData({ ...newRequestData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <Button variant="ghost" onClick={() => setShowNewRequestModal(false)} size="lg">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={isSubmittingRequest || !newRequestData.category}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 px-8"
              >
                {isSubmittingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}