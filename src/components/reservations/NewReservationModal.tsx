import { useState, useEffect, useRef, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useDateLocale } from "@/contexts/SystemSettingsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuickGuestModal } from "./QuickGuestModal";
import { AccompanyingGuestsModal } from "./AccompanyingGuestsModal";
import { NewGuestModal } from "@/components/guests/NewGuestModal";
import { GuestHistoryModal } from "@/components/guests/GuesttHistoryModal";
import { ReservationSummaryModal } from "./ReservationSummaryModal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { resolveUnitOperationalStatus } from "@/lib/unitOperationalStatus";
import SplitPaymentModal from "@/components/monetization/SplitPaymentModal";
import { toast } from "sonner";
import {
  User,
  CalendarDays,
  BedDouble,
  CreditCard,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Baby,
  Clock,
  Tag,
  Percent,
  DollarSign,
  Receipt,
  Plane,
  Car,
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  X,
  Cake,
  Globe,
  IdCard,
  Heart,
  Briefcase,
  Home,
  Wifi,
  Tv,
  Wind,
  Coffee,
  ShowerHead,
  Accessibility,
  MessageSquare,
  Ban,
  CalendarClock,
  Split,
  Banknote,
  QrCode,
  Landmark,
  ReceiptText,
  Send,
  Printer,
  FileCheck,
  Copy,
  AlertTriangle,
  Star,
  Search,
  PlusCircle,
  History,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  Pencil,
  Hotel,
  Building,
  TreePine,
  CalendarRange,
  Link,
  Store,
  Loader2,
  Wrench,
  ShieldAlert,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type StayType = "daily" | "weekly" | "monthly" | "longstay";

interface ReservationData {
  id?: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCPF: string;
  guestBirthdate: string;
  guestNationality: string;
  guestDocumentType: string;
  guestAddress: string;
  guestCity: string;
  guestState: string;
  guestZipCode: string;
  guestCountry: string;
  guestCompany: string;
  guestOccupation: string;
  guestNotes: string;
  guestEmergencyName: string;
  guestEmergencyPhone: string;
  guestLoyaltyTier: string;
  guestTotalStays: number;
  isReturningGuest: boolean;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  adults: string;
  children: string;
  infants: string;
  purposeOfStay: string;
  specialOccasion: string;
  bookingSource: string;
  propertyType: PropertyType;
  stayType: StayType;
  category: string;
  roomId: string;
  selectedRooms: string[];
  rateType: string;
  ratePlan: string;
  bedConfiguration: string;
  floorPreference: string;
  viewPreference: string;
  smokingPreference: string;
  accessibilityNeeds: boolean;
  accessibilityNotes: string;
  breakfast: boolean;
  parking: boolean;
  airportTransfer: boolean;
  airportTransferType: string;
  latecheckout: boolean;
  earlyCheckin: boolean;
  minibar: boolean;
  roomService: boolean;
  spa: boolean;
  gym: boolean;
  laundry: boolean;
  wifi: boolean;
  petFriendly: boolean;
  petDetails: string;
  selectedExtras: Array<{ id?: number; extraId?: number; name: string; price?: number; quantity?: number; [key: string]: unknown }>;
  specialRequests: string;
  internalNotes: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  paidAmount: number;
  depositAmount: number;
  depositDueDate: string;
  depositPaid: boolean;
  discount: number;
  discountType: string;
  discountReason: string;
  taxIncluded: boolean;
  taxAmount: number;
  installments: string;
  billingName: string;
  billingDocument: string;
  billingAddress: string;
  requiresInvoice: boolean;
  paymentNotes: string;
  // Credit card specific fields
  transactionReceipt: string;
  cardBrand: string;
  transactionId: string;
  authorizationCode: string;
  terminalId: string;
  // Split payment details
  splitPaymentDetails: {
    enabled: boolean;
    splits: Array<{
      guestName: string;
      amount: number;
      method: string;
      status: string;
    }>;
  };
  isAgency: boolean;
  agencyName: string;
  agencyContact: string;
  agencyEmail: string;
  agencyCommission: string;
  bookingChannel: string;
  channelId: number | null;
  externalId: string;
  voucherNumber: string;
  isNetRate: boolean;
  netRateValue: number;
  agencyNotes: string;
  operatorName: string;
  sendEmailConfirmation: boolean;
  sendWhatsAppConfirmation: boolean;
  sendSMSConfirmation: boolean;
  printConfirmation: boolean;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  marketingOptIn: boolean;
  confirmationNotes: string;
  reservationStatus: string;
  channel: string;
  accompanyingGuests?: any[];
}

interface NewReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ReservationData>;
  mode?: "create" | "edit";
  onSave?: (data: ReservationData) => void;
}

type TabId = "info" | "availability" | "apartment" | "payments" | "agency" | "confirmation";

interface Tab {
  id: TabId;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const tabs: Tab[] = [
  { id: "info", label: "Hóspede", description: "Dados pessoais", icon: <User className="h-5 w-5" />, color: "from-blue-500 to-blue-600" },
  { id: "availability", label: "Datas", description: "Período e ocupação", icon: <CalendarDays className="h-5 w-5" />, color: "from-emerald-500 to-emerald-600" },
  { id: "apartment", label: "Unidade", description: "Propriedade e UH", icon: <BedDouble className="h-5 w-5" />, color: "from-violet-500 to-violet-600" },
  { id: "payments", label: "Pagamento", description: "Valores e formas", icon: <CreditCard className="h-5 w-5" />, color: "from-amber-500 to-amber-600" },
  { id: "agency", label: "Canal", description: "OTA e agências", icon: <Building2 className="h-5 w-5" />, color: "from-rose-500 to-rose-600" },
  { id: "confirmation", label: "Confirmar", description: "Resumo final", icon: <CheckCircle2 className="h-5 w-5" />, color: "from-green-500 to-green-600" },
];

const propertyTypeConfig = {
  hotel: { label: "Hotel", icon: Hotel, color: "blue", description: "Quartos tradicionais com serviços hoteleiros" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building2, color: "violet", description: "Apartamentos com estrutura hoteleira" },
  loft: { label: "Loft", icon: Building, color: "amber", description: "Unidades compactas e modernas" },
  temporada: { label: "Temporada", icon: TreePine, color: "emerald", description: "Imóveis para aluguel de temporada" },
};

const stayTypeConfig = {
  daily: { label: "Diária", description: "Reserva por noite", icon: CalendarDays, multiplier: 1, minNights: 1, color: "blue" },
  weekly: { label: "Semanal", description: "7 noites mínimo", icon: CalendarRange, multiplier: 0.85, minNights: 7, color: "emerald" },
  monthly: { label: "Mensal", description: "30 noites mínimo", icon: CalendarRange, multiplier: 0.70, minNights: 30, color: "violet" },
  longstay: { label: "Long Stay", description: "Contrato 90+ dias", icon: CalendarRange, multiplier: 0.55, minNights: 90, color: "amber" },
};

const roomCategoriesByProperty: Record<PropertyType, { id: string; name: string; dailyPrice: number; weeklyPrice: number; monthlyPrice: number; longstayPrice: number; maxGuests: number }[]> = {
  hotel: [
    { id: "standard-basic", name: "Standard Basic", dailyPrice: 180, weeklyPrice: 1070, monthlyPrice: 3780, longstayPrice: 2970, maxGuests: 2 },
    { id: "standard-master", name: "Standard Master", dailyPrice: 220, weeklyPrice: 1310, monthlyPrice: 4620, longstayPrice: 3630, maxGuests: 3 },
    { id: "luxo", name: "Luxo", dailyPrice: 350, weeklyPrice: 2080, monthlyPrice: 7350, longstayPrice: 5775, maxGuests: 4 },
    { id: "suite", name: "Suíte Premium", dailyPrice: 500, weeklyPrice: 2975, monthlyPrice: 10500, longstayPrice: 8250, maxGuests: 4 },
  ],
  "apart-hotel": [
    { id: "studio", name: "Studio", dailyPrice: 250, weeklyPrice: 1488, monthlyPrice: 5250, longstayPrice: 4125, maxGuests: 2 },
    { id: "1quarto", name: "1 Quarto", dailyPrice: 350, weeklyPrice: 2080, monthlyPrice: 7350, longstayPrice: 5775, maxGuests: 3 },
    { id: "2quartos", name: "2 Quartos", dailyPrice: 480, weeklyPrice: 2856, monthlyPrice: 10080, longstayPrice: 7920, maxGuests: 5 },
    { id: "cobertura", name: "Cobertura", dailyPrice: 750, weeklyPrice: 4463, monthlyPrice: 15750, longstayPrice: 12375, maxGuests: 6 },
  ],
  loft: [
    { id: "loft-compact", name: "Loft Compact", dailyPrice: 200, weeklyPrice: 1190, monthlyPrice: 4200, longstayPrice: 3300, maxGuests: 2 },
    { id: "loft-standard", name: "Loft Standard", dailyPrice: 280, weeklyPrice: 1666, monthlyPrice: 5880, longstayPrice: 4620, maxGuests: 3 },
    { id: "loft-premium", name: "Loft Premium", dailyPrice: 400, weeklyPrice: 2380, monthlyPrice: 8400, longstayPrice: 6600, maxGuests: 4 },
  ],
  temporada: [
    { id: "casa-praia", name: "Casa de Praia", dailyPrice: 450, weeklyPrice: 2677, monthlyPrice: 9450, longstayPrice: 7425, maxGuests: 6 },
    { id: "chacara", name: "Chácara", dailyPrice: 600, weeklyPrice: 3570, monthlyPrice: 12600, longstayPrice: 9900, maxGuests: 10 },
    { id: "sitio", name: "Sítio", dailyPrice: 800, weeklyPrice: 4760, monthlyPrice: 16800, longstayPrice: 13200, maxGuests: 15 },
    { id: "apartamento-temporada", name: "Apartamento", dailyPrice: 300, weeklyPrice: 1785, monthlyPrice: 6300, longstayPrice: 4950, maxGuests: 4 },
  ],
};

interface RoomData {
  id: string;
  number: string;
  category: string;
  floor: number;
  view: string;
  beds: string;
  amenities: string[];
  connectedTo?: string[];
}

const availableRoomsByProperty: Record<PropertyType, RoomData[]> = {
  hotel: [
    { id: "r201", number: "201", category: "standard-basic", floor: 2, view: "jardim", beds: "1 casal", amenities: ["wifi", "tv", "ar"], connectedTo: ["r202"] },
    { id: "r202", number: "202", category: "standard-basic", floor: 2, view: "rua", beds: "2 solteiro", amenities: ["wifi", "tv", "ar"], connectedTo: ["r201", "r203"] },
    { id: "r203", number: "203", category: "standard-master", floor: 2, view: "piscina", beds: "1 king", amenities: ["wifi", "tv", "ar", "cofre"], connectedTo: ["r202"] },
    { id: "r301", number: "301", category: "luxo", floor: 3, view: "panorâmico", beds: "1 king", amenities: ["wifi", "tv", "ar", "cofre", "varanda"], connectedTo: ["r302"] },
    { id: "r302", number: "302", category: "suite", floor: 3, view: "panorâmico", beds: "1 king + sofá", amenities: ["wifi", "tv", "ar", "cofre", "varanda", "jacuzzi"], connectedTo: ["r301"] },
  ],
  "apart-hotel": [
    { id: "ah101", number: "101", category: "studio", floor: 1, view: "cidade", beds: "1 casal", amenities: ["wifi", "cozinha", "ar"], connectedTo: ["ah102"] },
    { id: "ah102", number: "102", category: "1quarto", floor: 1, view: "jardim", beds: "1 queen", amenities: ["wifi", "cozinha", "ar", "lavanderia"], connectedTo: ["ah101"] },
    { id: "ah201", number: "201", category: "2quartos", floor: 2, view: "mar", beds: "1 queen + 2 solteiro", amenities: ["wifi", "cozinha", "ar", "lavanderia", "varanda"] },
    { id: "ah301", number: "Cobertura", category: "cobertura", floor: 3, view: "360°", beds: "2 suítes", amenities: ["wifi", "cozinha", "ar", "lavanderia", "varanda", "churrasqueira"] },
  ],
  loft: [
    { id: "lf01", number: "Loft 01", category: "loft-compact", floor: 1, view: "interno", beds: "1 casal", amenities: ["wifi", "kitchenette"], connectedTo: ["lf02"] },
    { id: "lf02", number: "Loft 02", category: "loft-standard", floor: 1, view: "rua", beds: "1 queen", amenities: ["wifi", "cozinha", "ar"], connectedTo: ["lf01", "lf03"] },
    { id: "lf03", number: "Loft 03", category: "loft-premium", floor: 2, view: "cidade", beds: "1 king", amenities: ["wifi", "cozinha", "ar", "varanda"], connectedTo: ["lf02"] },
  ],
  temporada: [
    { id: "cp01", number: "Casa Praia 01", category: "casa-praia", floor: 0, view: "mar", beds: "3 quartos", amenities: ["wifi", "cozinha", "ar", "churrasqueira", "piscina"] },
    { id: "ch01", number: "Chácara Sol", category: "chacara", floor: 0, view: "natureza", beds: "4 quartos", amenities: ["wifi", "cozinha", "piscina", "churrasqueira", "campo"] },
    { id: "st01", number: "Sítio Recanto", category: "sitio", floor: 0, view: "montanha", beds: "5 quartos", amenities: ["wifi", "cozinha", "lago", "trilhas", "animais"] },
    { id: "ap01", number: "Apto Temporada", category: "apartamento-temporada", floor: 5, view: "mar", beds: "2 quartos", amenities: ["wifi", "cozinha", "ar", "varanda"] },
  ],
};

const ratePlans = [
  { id: "standard", name: "Tarifa Padrão", description: "Cancelamento até 48h" },
  { id: "flexible", name: "Tarifa Flexível", description: "Cancelamento gratuito", modifier: 1.15 },
  { id: "nonrefundable", name: "Não Reembolsável", description: "Sem cancelamento", modifier: 0.9 },
  { id: "longstay", name: "Longa Estadia", description: "7+ noites", modifier: 0.85 },
  { id: "lastminute", name: "Última Hora", description: "Reserva no dia", modifier: 0.8 },
  { id: "corporate", name: "Corporativo", description: "Empresas parceiras", modifier: 0.88 },
];

// Mock guest database for autocomplete
const existingGuests = [
  { id: "g1", name: "Maria Santos", email: "maria.santos@email.com", phone: "(11) 99876-5432", cpf: "123.456.789-00", birthdate: "1985-03-15", nationality: "Brasileiro", address: "Av. Paulista, 1578 - Apto 102", city: "São Paulo", state: "SP", zipCode: "01310-200", country: "Brasil", company: "Tech Solutions Ltda", occupation: "Gerente de TI", emergencyName: "José Santos", emergencyPhone: "(11) 98765-4321", notes: "Prefere quartos nos andares superiores. Alergia a amendoim.", totalStays: 5, loyaltyTier: "gold" },
  { id: "g2", name: "Carlos Silva", email: "carlos.silva@empresa.com", phone: "(21) 98765-4321", cpf: "987.654.321-00", birthdate: "1990-07-22", nationality: "Brasileiro", address: "Rua Visconde de Pirajá, 250", city: "Rio de Janeiro", state: "RJ", zipCode: "22410-000", country: "Brasil", company: "Silva & Associados", occupation: "Advogado", emergencyName: "Ana Silva", emergencyPhone: "(21) 99876-5432", notes: "Viaja frequentemente a trabalho.", totalStays: 3, loyaltyTier: "silver" },
  { id: "g3", name: "Ana Paula Oliveira", email: "ana.oliveira@gmail.com", phone: "(31) 97654-3210", cpf: "456.789.123-00", birthdate: "1978-11-08", nationality: "Brasileiro", address: "Rua da Bahia, 1200", city: "Belo Horizonte", state: "MG", zipCode: "30160-011", country: "Brasil", company: "", occupation: "Médica", emergencyName: "Pedro Oliveira", emergencyPhone: "(31) 98888-7777", notes: "VIP - Tratamento diferenciado. Vegetariana.", totalStays: 8, loyaltyTier: "platinum" },
  { id: "g4", name: "Roberto Costa", email: "roberto.costa@hotmail.com", phone: "(41) 96543-2109", cpf: "789.123.456-00", birthdate: "1995-02-28", nationality: "Brasileiro", address: "Av. Batel, 1500", city: "Curitiba", state: "PR", zipCode: "80420-090", country: "Brasil", company: "Startup XYZ", occupation: "Desenvolvedor", emergencyName: "Maria Costa", emergencyPhone: "(41) 97777-6666", notes: "", totalStays: 2, loyaltyTier: "bronze" },
  { id: "g5", name: "Fernanda Lima", email: "fernanda.lima@outlook.com", phone: "(51) 95432-1098", cpf: "321.654.987-00", birthdate: "1982-06-10", nationality: "Brasileiro", address: "Rua dos Andradas, 800", city: "Porto Alegre", state: "RS", zipCode: "90020-015", country: "Brasil", company: "Lima Consultoria", occupation: "Consultora", emergencyName: "Ricardo Lima", emergencyPhone: "(51) 96666-5555", notes: "Cliente fidelidade máxima. Sempre solicita late checkout.", totalStays: 12, loyaltyTier: "platinum" },
  { id: "g6", name: "João Pedro Martins", email: "joao.martins@email.com", phone: "(61) 94321-0987", cpf: "654.987.321-00", birthdate: "2000-01-05", nationality: "Brasileiro", address: "SQN 308 Bloco A", city: "Brasília", state: "DF", zipCode: "70747-010", country: "Brasil", company: "", occupation: "Estudante", emergencyName: "Paulo Martins", emergencyPhone: "(61) 95555-4444", notes: "Primeira estadia.", totalStays: 1, loyaltyTier: "bronze" },
  { id: "g7", name: "Mariana Ferreira", email: "mariana.f@gmail.com", phone: "(71) 93210-9876", cpf: "147.258.369-00", birthdate: "1988-09-20", nationality: "Brasileiro", address: "Av. Oceânica, 2500", city: "Salvador", state: "BA", zipCode: "40170-010", country: "Brasil", company: "Ferreira & Co", occupation: "Empresária", emergencyName: "Clara Ferreira", emergencyPhone: "(71) 94444-3333", notes: "Prefere vista para o mar.", totalStays: 6, loyaltyTier: "gold" },
  { id: "g8", name: "Lucas Almeida", email: "lucas.almeida@empresa.com.br", phone: "(81) 92109-8765", cpf: "258.369.147-00", birthdate: "1992-12-12", nationality: "Brasileiro", address: "Av. Boa Viagem, 3000", city: "Recife", state: "PE", zipCode: "51020-000", country: "Brasil", company: "Almeida Tech", occupation: "Engenheiro", emergencyName: "Lucia Almeida", emergencyPhone: "(81) 93333-2222", notes: "Requer quarto silencioso.", totalStays: 4, loyaltyTier: "silver" },
];

const defaultFormData: ReservationData = {
  guestId: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestCPF: "",
  guestBirthdate: "",
  guestNationality: "Brasileiro",
  guestDocumentType: "cpf",
  guestAddress: "",
  guestCity: "",
  guestState: "",
  guestZipCode: "",
  guestCountry: "Brasil",
  guestCompany: "",
  guestOccupation: "",
  guestNotes: "",
  guestEmergencyName: "",
  guestEmergencyPhone: "",
  guestLoyaltyTier: "bronze",
  guestTotalStays: 0,
  isReturningGuest: false,
  checkIn: "",
  checkOut: "",
  checkInTime: "14:00",
  checkOutTime: "12:00",
  adults: "2",
  children: "0",
  infants: "0",
  purposeOfStay: "leisure",
  specialOccasion: "",
  bookingSource: "website",
  propertyType: "hotel",
  stayType: "daily",
  category: "",
  roomId: "",
  selectedRooms: [],
  rateType: "standard",
  ratePlan: "standard",
  bedConfiguration: "",
  floorPreference: "",
  viewPreference: "",
  smokingPreference: "non-smoking",
  accessibilityNeeds: false,
  accessibilityNotes: "",
  breakfast: false,
  parking: false,
  airportTransfer: false,
  airportTransferType: "arrival",
  latecheckout: false,
  earlyCheckin: false,
  minibar: false,
  roomService: false,
  spa: false,
  gym: false,
  laundry: false,
  wifi: true,
  petFriendly: false,
  petDetails: "",
  selectedExtras: [],
  specialRequests: "",
  internalNotes: "",
  paymentMethod: "",
  paymentStatus: "pending",
  totalAmount: 0,
  paidAmount: 0,
  depositAmount: 0,
  depositDueDate: "",
  depositPaid: false,
  discount: 0,
  discountType: "percent",
  discountReason: "",
  taxIncluded: true,
  taxAmount: 0,
  installments: "1",
  billingName: "",
  billingDocument: "",
  billingAddress: "",
  requiresInvoice: false,
  paymentNotes: "",
  transactionReceipt: "",
  cardBrand: "",
  transactionId: "",
  authorizationCode: "",
  terminalId: "",
  splitPaymentDetails: {
    enabled: false,
    splits: [],
  },
  isAgency: false,
  agencyName: "",
  agencyContact: "",
  agencyEmail: "",
  agencyCommission: "0",
  bookingChannel: "direct",
  channelId: null,
  externalId: "",
  voucherNumber: "",
  isNetRate: false,
  netRateValue: 0,
  agencyNotes: "",
  operatorName: "",
  sendEmailConfirmation: true,
  sendWhatsAppConfirmation: false,
  sendSMSConfirmation: false,
  printConfirmation: false,
  agreedToTerms: false,
  agreedToPrivacy: false,
  marketingOptIn: false,
  confirmationNotes: "",
  reservationStatus: "confirmed",
  channel: "direct",
  accompanyingGuests: [],
};

export function NewReservationModal({ open, onOpenChange, initialData, mode = "create", onSave }: NewReservationModalProps) {
  const { user } = useAuth();
  const dateLocale = useDateLocale();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [formData, setFormData] = useState<ReservationData>({ ...defaultFormData, ...initialData, operatorName: initialData?.operatorName || user?.name || "" });
  const [searchGuest, setSearchGuest] = useState("");
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const [quickGuestModalOpen, setQuickGuestModalOpen] = useState(false);
  const [accompanyingGuestsModalOpen, setAccompanyingGuestsModalOpen] = useState(false);
  const [newGuestModalOpen, setNewGuestModalOpen] = useState(false);
  const [guestHistoryModalOpen, setGuestHistoryModalOpen] = useState(false);
  const [splitPaymentModalOpen, setSplitPaymentModalOpen] = useState(false);
  const [agencyDataExpanded, setAgencyDataExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState("");
  const [confirmationTime, setConfirmationTime] = useState("");
  const [summaryData, setSummaryData] = useState<{
    protocolNumber?: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestCPF: string;
    checkIn: string;
    checkOut: string;
    adults: string;
    children: string;
    infants?: string;
    roomId: string;
    selectedRooms?: string[];
    category: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    paidAmount?: number;
    discount?: number;
    [key: string]: unknown;
  } | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [discountPasswordModalOpen, setDiscountPasswordModalOpen] = useState(false);
  const [discountPasswordInput, setDiscountPasswordInput] = useState("");
  const [discountValidated, setDiscountValidated] = useState(false);
  const [isValidatingDiscountPassword, setIsValidatingDiscountPassword] = useState(false);

  const handleValidateDiscountPassword = async () => {
    if (!discountPasswordInput.trim()) {
      toast.error("Digite a senha de autorização.");
      return;
    }

    setIsValidatingDiscountPassword(true);
    try {
      const res = await api.validateDiscountPassword(discountPasswordInput);
      if (res.success) {
        setDiscountValidated(true);
        setDiscountPasswordModalOpen(false);
        setDiscountPasswordInput("");
        toast.success("Desconto autorizado.");
      } else {
        toast.error(res.error?.message || "Senha incorreta.");
        setDiscountPasswordInput("");
      }
    } catch {
      toast.error("Não foi possível validar a senha.");
      setDiscountPasswordInput("");
    } finally {
      setIsValidatingDiscountPassword(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingGuests, setIsSearchingGuests] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<any[]>([]);

  const [dbProperties, setDbProperties] = useState<any[]>([]);
  const [dbRoomTypes, setDbRoomTypes] = useState<any[]>([]);
  const [dbUnits, setDbUnits] = useState<any[]>([]);
  const [dbRatePlans, setDbRatePlans] = useState<any[]>([]);
  const [dbPromotions, setDbPromotions] = useState<any[]>([]);
  const [bookingChannels, setBookingChannels] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [availableExtras, setAvailableExtras] = useState<any[]>([]);
  const [unitRatesMap, setUnitRatesMap] = useState<Map<string, any>>(new Map());
  const [dbHousekeepingTasks, setDbHousekeepingTasks] = useState<any[]>([]);
  const [occupiedUnitIds, setOccupiedUnitIds] = useState<number[]>([]);

  const filteredGuests = availableGuests;

  const parseLocalDate = dateLocale.parseDateOnly;

  useEffect(() => {
    if (mode === "create" && user?.name && !formData.operatorName) {
      setFormData((prev) => ({ ...prev, operatorName: user.name }));
    }
  }, [user, mode, formData.operatorName]);

  useEffect(() => {
    if (open) {
      setDiscountValidated(false);
      setDiscountPasswordModalOpen(false);
      setDiscountPasswordInput("");
    }
  }, [open]);

  // Na etapa Canal: sem canal de venda selecionado → comissão % fica 0
  useEffect(() => {
    const noChannelSelected = formData.channelId == null && formData.bookingChannel === "direct";
    if (noChannelSelected && formData.agencyCommission !== "0") {
      setFormData(prev => ({ ...prev, agencyCommission: "0" }));
    }
  }, [formData.channelId, formData.bookingChannel, formData.agencyCommission]);

  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) return;
    const start = formData.checkIn.split("T")[0];
    const end = formData.checkOut.split("T")[0];
    api.getPricingMapData({ startDate: start, endDate: end }).then((res) => {
      if (res.success && res.data?.rates) {
        const map = new Map<string, any>();
        (res.data.rates as any[]).forEach((r: any) => {
          const dateStr = String(r.date).split("T")[0];
          map.set(`${r.unitId}-${dateStr}`, r);
        });
        setUnitRatesMap(map);
      }
    }).catch((e) => console.error("Error loading pricing map", e));
  }, [formData.checkIn, formData.checkOut]);

  // Unidades ocupadas no período (reservas no banco) para bloquear seleção
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) {
      setOccupiedUnitIds([]);
      return;
    }
    const checkInStr = formData.checkIn.split("T")[0];
    const checkOutStr = formData.checkOut.split("T")[0];
    api.getReservationAvailability({ checkIn: checkInStr, checkOut: checkOutStr }).then((res) => {
      if (res.success && (res.data as any)?.occupiedUnitIds) {
        setOccupiedUnitIds((res.data as any).occupiedUnitIds);
      } else {
        setOccupiedUnitIds([]);
      }
    }).catch(() => setOccupiedUnitIds([]));
  }, [formData.checkIn, formData.checkOut]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, roomTypesRes, unitsRes, ratesRes, promosRes, channelsRes, paymentRes, tasksRes] = await Promise.all([
          api.getProperties(),
          api.getRoomTypes(),
          api.getUnits(),
          api.getRatePlans(),
          api.getPromotions(),
          api.getBookingChannels(),
          api.getPaymentMethods(),
          api.getHousekeepingTasks({ status: "pending,in_progress" }),
        ]);
        if (propsRes.success && (propsRes.data as any)?.properties) setDbProperties((propsRes.data as any).properties);
        if (roomTypesRes.success && (roomTypesRes.data as any)?.roomTypes) setDbRoomTypes((roomTypesRes.data as any).roomTypes);
        if (unitsRes.success && (unitsRes.data as any)?.units) setDbUnits((unitsRes.data as any).units);
        if (ratesRes.success && (ratesRes.data as any)?.ratePlans) {
          setDbRatePlans(((ratesRes.data as any).ratePlans as any[]).map((r: any) => ({
            ...r,
            id: String(r.id ?? r.name),
            name: r.name ?? r.id,
            modifier: r.discountPercentage != null ? 1 - r.discountPercentage / 100 : 1,
          })));
        }
        if (promosRes.success && (promosRes.data as any)?.promotions) setDbPromotions((promosRes.data as any).promotions);
        if (channelsRes.success && (channelsRes.data as any)?.channels) setBookingChannels((channelsRes.data as any).channels);
        if (paymentRes.success && paymentRes.data) {
          const methods = Array.isArray(paymentRes.data) ? paymentRes.data : (paymentRes.data as any)?.paymentMethods ?? [];
          setPaymentMethods(methods);
        }
        if (tasksRes.success && (tasksRes.data as any)?.tasks) {
          setDbHousekeepingTasks((tasksRes.data as any).tasks);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Erro ao carregar dados do sistema");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let targetPropId: number | undefined;
    const roomIdToUse = formData.roomId || formData.selectedRooms?.[0];
    if (roomIdToUse) {
      const unit = dbUnits.find((u) => String(u.id) === String(roomIdToUse));
      targetPropId = unit?.propertyId ?? (unit as any)?.property_id;
    }
    if (!targetPropId && dbProperties.length === 1) targetPropId = dbProperties[0].id;
    if (targetPropId) {
      api.getExtras(undefined, Number(targetPropId)).then((res) => {
        if (res.success && (res.data as any)?.extras) setAvailableExtras((res.data as any).extras);
        else setAvailableExtras([]);
      }).catch(() => setAvailableExtras([]));
    } else setAvailableExtras([]);
  }, [formData.roomId, formData.selectedRooms, dbUnits, dbProperties]);

  useEffect(() => {
    if (searchGuest.length < 2) {
      setAvailableGuests([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingGuests(true);
      try {
        const response = await api.getGuests(searchGuest);
        if (response.success) {
          const rawGuests = (response.data as any)?.guests ?? (Array.isArray(response.data) ? response.data : []);
          const mappedGuests = (rawGuests as any[]).map((g: any) => ({
            ...g,
            name: g.name ?? `${g.firstName ?? ""} ${g.lastName ?? ""}`.trim(),
            cpf: g.document ?? g.cpf ?? g.documentNumber ?? g.cnpj ?? "",
            phone: g.phone ?? g.mobilePhone ?? "",
            loyaltyTier: g.loyaltyTier ?? g.tier ?? "bronze",
            totalStays: g.totalStays ?? g.stays ?? 0,
            birthdate: g.birthDate ?? g.birthdate,
            address: g.address ?? [g.street, g.number, g.complement].filter(Boolean).join(", "),
            emergencyName: g.emergencyContactName ?? g.emergencyName,
            emergencyPhone: g.emergencyContactPhone ?? g.emergencyPhone,
            notes: g.notes,
          }));
          setAvailableGuests(mappedGuests);
        }
      } catch (error) {
        console.error("Error searching guests:", error);
      } finally {
        setIsSearchingGuests(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchGuest]);

  const selectGuest = (guest: any) => {
    setFormData((prev) => ({
      ...prev,
      guestId: String(guest.id),
      guestName: guest.name ?? "",
      guestEmail: guest.email ?? "",
      guestPhone: guest.phone ?? "",
      guestCPF: guest.cpf ?? "",
      guestBirthdate: guest.birthdate ?? "",
      guestNationality: guest.nationality ?? "",
      guestAddress: guest.address ?? "",
      guestCity: guest.city ?? "",
      guestState: guest.state ?? "",
      guestZipCode: guest.zipCode ?? "",
      guestCountry: guest.country ?? "",
      guestCompany: guest.companyName ?? guest.company ?? "",
      guestOccupation: guest.occupation ?? guest.profession ?? "",
      guestEmergencyName: guest.emergencyName ?? "",
      guestEmergencyPhone: guest.emergencyPhone ?? "",
      guestNotes: guest.notes ?? "",
      guestLoyaltyTier: guest.loyaltyTier ?? "bronze",
      guestTotalStays: guest.totalStays ?? 0,
      isReturningGuest: (guest.totalStays ?? 0) > 0,
    }));
    setSearchGuest("");
    setShowGuestSuggestions(false);
    toast.success(`Hóspede ${guest.name} selecionado`);
  };

  const handleQuickGuestCreated = (guest: any) => {
    setFormData((prev) => ({
      ...prev,
      guestId: guest.id ? String(guest.id) : prev.guestId,
      guestName: guest.name ?? `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim(),
      guestEmail: guest.email ?? prev.guestEmail,
      guestPhone: guest.phone ?? guest.mobilePhone ?? prev.guestPhone,
      guestCPF: guest.cpf ?? guest.document ?? guest.documentNumber ?? prev.guestCPF,
      guestBirthdate: guest.birthdate ?? guest.birthDate ?? prev.guestBirthdate,
      guestNationality: guest.nationality ?? prev.guestNationality,
      guestAddress: `${guest.address ?? guest.street ?? ""}${guest.addressNumber ? `, ${guest.addressNumber}` : ""}${guest.complement ? ` - ${guest.complement}` : ""}`.trim() || prev.guestAddress,
      guestCity: guest.city ?? prev.guestCity,
      guestState: guest.state ?? prev.guestState,
      guestZipCode: guest.zipCode ?? prev.guestZipCode,
      guestCountry: guest.country ?? prev.guestCountry,
      guestCompany: guest.company ?? guest.companyName ?? prev.guestCompany,
      guestOccupation: guest.occupation ?? prev.guestOccupation,
      isReturningGuest: false,
      guestTotalStays: 0,
      guestLoyaltyTier: "bronze",
    }));
  };

  const prevOpenRef = useRef(false);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    // Só inicializa/reseta o formulário quando o modal abre (transição fechado → aberto)
    if (open && !wasOpen) {
      const merged = { ...defaultFormData, ...initialData, operatorName: initialData?.operatorName ?? user?.name ?? "" };
      if (Array.isArray(initialData?.selectedRooms) && initialData.selectedRooms.length > 0) {
        merged.selectedRooms = initialData.selectedRooms.map(String);
        if (!merged.roomId && merged.selectedRooms[0]) merged.roomId = merged.selectedRooms[0];
      } else if (initialData?.roomId) {
        merged.selectedRooms = [String(initialData.roomId)];
        merged.roomId = String(initialData.roomId);
      }
      if (merged.checkIn) merged.checkIn = dateLocale.extractDateOnly(merged.checkIn);
      if (merged.checkOut) merged.checkOut = dateLocale.extractDateOnly(merged.checkOut);
      setFormData(merged);
      setActiveTab("info");
      setShowSuccess(false);
      setProtocolNumber("");
      setConfirmationTime("");
    }
  }, [open, initialData, user?.name]);

  // Sempre rolar para o topo ao mudar de etapa (aba)
  useEffect(() => {
    const scrollToTop = () => {
      const viewport = scrollAreaRef.current?.querySelector?.("[data-radix-scroll-area-viewport]") ?? scrollAreaRef.current?.firstElementChild;
      if (viewport && typeof (viewport as HTMLElement).scrollTo === "function") {
        (viewport as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const t = setTimeout(scrollToTop, 80);
    return () => clearTimeout(t);
  }, [activeTab]);

  const updateForm = (field: keyof ReservationData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateProtocol = () => {
    const date = new Date();
    const dateStr = format(date, "yyyyMMdd");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RES-${dateStr}-${random}`;
  };

  const currentCategories = (() => {
    if (dbRoomTypes.length > 0 && dbProperties.length > 0) {
      const props = dbProperties.filter((p: any) => p.type === formData.propertyType || (!p.type && formData.propertyType === "hotel"));
      const propIds = props.map((p: any) => p.id);
      return dbRoomTypes
        .filter((rt: any) => propIds.includes(rt.propertyId) || rt.propertyType === formData.propertyType)
        .map((rt: any) => {
          const base = Number(rt.basePrice ?? (rt as any).base_price ?? rt.rates?.daily ?? 0);
          return {
            id: String(rt.id),
            name: rt.name,
            dailyPrice: base,
            weeklyPrice: rt.rates?.weekly ?? base * 7 * 0.85,
            monthlyPrice: rt.rates?.monthly ?? base * 30 * 0.7,
            longstayPrice: rt.rates?.longstay ?? base * 30 * 0.55,
            maxGuests: rt.maxGuests ?? 2,
          };
        });
    }
    return roomCategoriesByProperty[formData.propertyType] ?? [];
  })();

  const currentRooms = (() => {
    if (dbUnits.length > 0 && dbProperties.length > 0) {
      const props = dbProperties.filter((p: any) => p.type === formData.propertyType || (!p.type && formData.propertyType === "hotel"));
      const propIds = props.map((p: any) => p.id);
      return dbUnits
        .filter((u: any) => {
          const uPropId = u.propertyId ?? u.property_id;
          if (!propIds.includes(uPropId)) return false;
          return true;
        })
        .map((u: any) => ({
          ...u,
          id: String(u.id),
          category: String(u.roomTypeId ?? u.room_type_id ?? u.categoryId ?? u.category_id ?? ""),
          number: u.number ?? u.name ?? String(u.id),
          beds: u.beds ?? "Padrão",
          connectedTo: u.connectedTo ?? u.connected_to ?? [],
        }));
    }
    return availableRoomsByProperty[formData.propertyType] ?? [];
  })();

  const effectiveRatePlans = dbRatePlans.length > 0 ? dbRatePlans : ratePlans;

  const calculateUnitPricing = (unit: any, overrides?: { adults?: number; children?: number; infants?: number }): { total: number; avgDaily: number; baseDaily: number; isDynamic: boolean; nights: number } => {
    if (!unit) return { total: 0, avgDaily: 0, baseDaily: 0, isDynamic: false, nights: 0 };
    const categoryId = unit.roomTypeId ?? unit.room_type_id ?? unit.category;
    const categoryForUnit = dbRoomTypes.find((rt: any) => String(rt.id) === String(categoryId));
    const catDaily = Number(
      categoryForUnit?.basePrice ?? (categoryForUnit as any)?.base_price
      ?? (categoryForUnit as any)?.rates?.daily ?? (categoryForUnit as any)?.dailyPrice ?? 0
    );
    const fallbackDaily = catDaily > 0 ? catDaily : 0;
    const unitDaily = Number(unit.rates?.daily ?? unit.basePrice ?? (unit as any).base_price ?? fallbackDaily);
    const baseDaily = unitDaily > 0 ? unitDaily : (fallbackDaily > 0 ? fallbackDaily : 0);
    if (!formData.checkIn || !formData.checkOut) {
      return { total: 0, avgDaily: baseDaily, baseDaily, isDynamic: false, nights: 0 };
    }
    const start = parseLocalDate(formData.checkIn);
    const end = parseLocalDate(formData.checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { total: 0, avgDaily: baseDaily, baseDaily, isDynamic: false, nights: 0 };
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    let sum = 0;
    for (let i = 0; i < nights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = dateLocale.toDateOnlyKey(d);
      const customRate = unitRatesMap.get(`${unit.id}-${dateStr}`);
      const category = categoryForUnit ?? dbRoomTypes.find((rt: any) => String(rt.id) === String(unit.roomTypeId ?? unit.room_type_id ?? unit.category));
      const adultsToUse = overrides?.adults ?? Number(formData.adults);
      const childrenToUse = overrides?.children ?? Number(formData.children);
      const infantsToUse = overrides?.infants ?? Number(formData.infants);
      if (category?.pricingStyle === "per_person") {
        const adultRate = customRate ? Number(customRate.dailyRate) : (Number(category.adultPrice) || 0);
        const childRate = Number(category.childPrice) || 0;
        const infantRate = Number(category.infantPrice) || 0;
        sum += adultsToUse * adultRate + childrenToUse * childRate + infantsToUse * infantRate;
      } else {
        if (customRate) sum += Number(customRate.dailyRate);
        else {
          const dayOfWeek = d.getDay();
          sum += baseDaily * (dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1);
        }
      }
    }
    const ratePlanMod = effectiveRatePlans.find((r: any) => String(r.id) === String(formData.ratePlan))?.modifier ?? 1;
    sum *= (ratePlanMod > 0 ? ratePlanMod : 1);
    return { total: sum, avgDaily: sum / nights, baseDaily, isDynamic: false, nights };
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = parseLocalDate(formData.checkIn);
    const end = parseLocalDate(formData.checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const toggleExtra = (extra: { id?: number; name: string; price?: number; [key: string]: unknown }) => {
    const current = formData.selectedExtras || [];
    const exists = current.find((e) => e.extraId === extra.id || e.id === extra.id || e.name === extra.name);
    let next;
    if (exists) {
      next = current.filter((e) => !(e.extraId === extra.id || e.id === extra.id || e.name === extra.name));
    } else {
      next = [...current, { ...extra, quantity: 1, extraId: extra.id }];
    }
    setFormData((prev) => ({ ...prev, selectedExtras: next }));
  };

  const calculateTotal = () => {
    const roomsToCalculate = formData.selectedRooms.length > 0 ? formData.selectedRooms : formData.roomId ? [formData.roomId] : [];
    if (roomsToCalculate.length === 0) return 0;
    const nights = calculateNights();
    if (nights <= 0) return 0;
    let totalBasePrice = 0;
    const rooms = currentRooms;
    const categories = currentCategories;
    let ratePlanMod = effectiveRatePlans.find((r: any) => String(r.id) === String(formData.ratePlan))?.modifier ?? 1;
    if (ratePlanMod == null || ratePlanMod <= 0) ratePlanMod = 1;
    roomsToCalculate.forEach((roomId) => {
      const unit = dbUnits.find((u: any) => String(u.id) === String(roomId))
        ?? rooms.find((r: any) => String(r.id) === String(roomId));
      if (!unit) return;
      const pricing = calculateUnitPricing(unit);
      let roomPrice = pricing.total;
      if (roomPrice <= 0 && nights > 0) {
        const categoryId = unit.roomTypeId ?? unit.room_type_id ?? unit.category;
        const category = categories.find((c: any) => String(c.id) === String(categoryId));
        const rtFromDb = dbRoomTypes.find((rt: any) => String(rt.id) === String(categoryId));
        const dailyPrice = category
          ? Number(category.dailyPrice ?? (category as any).basePrice ?? 0)
          : Number(rtFromDb?.basePrice ?? (rtFromDb as any)?.base_price ?? (rtFromDb as any)?.rates?.daily ?? 0);
        if (dailyPrice > 0) {
          switch (formData.stayType) {
            case "weekly": roomPrice = Math.ceil(nights / 7) * (category?.weeklyPrice ?? dailyPrice * 7 * 0.85); break;
            case "monthly": roomPrice = Math.ceil(nights / 30) * (category?.monthlyPrice ?? dailyPrice * 30 * 0.7); break;
            case "longstay": roomPrice = Math.ceil(nights / 30) * (category?.longstayPrice ?? dailyPrice * 30 * 0.55); break;
            default: roomPrice = dailyPrice * nights; break;
          }
          roomPrice *= ratePlanMod;
        }
      }
      totalBasePrice += roomPrice;
    });
    if (dbUnits.length === 0) {
      const ratePlan = effectiveRatePlans.find((r: any) => r.id === formData.ratePlan);
      roomsToCalculate.forEach((roomId) => {
        const room = rooms.find((r: { id: string | number }) => String(r.id) === String(roomId));
        if (!room) return;
        const category = categories.find((c: { id: string }) => String(c.id) === String(room.category));
        if (!category) return;
        let roomPrice = 0;
        switch (formData.stayType) {
          case "weekly": roomPrice = Math.ceil(nights / 7) * category.weeklyPrice; break;
          case "monthly": roomPrice = Math.ceil(nights / 30) * category.monthlyPrice; break;
          case "longstay": roomPrice = Math.ceil(nights / 30) * category.longstayPrice; break;
          default: roomPrice = category.dailyPrice * nights;
        }
        if (ratePlan?.modifier) roomPrice *= ratePlan.modifier;
        totalBasePrice += roomPrice;
      });
    }
    if (formData.selectedRooms.length >= 2) totalBasePrice *= 0.95;
    const extrasTotal = (formData.selectedExtras || []).reduce((acc, extra) => acc + (Number(extra.price) || 0) * (Number(extra.quantity) || 1), 0);
    totalBasePrice += extrasTotal;
    if (formData.breakfast) totalBasePrice += 45 * nights * parseInt(formData.adults || "0");
    if (formData.parking) totalBasePrice += 30 * nights;
    if (formData.airportTransfer) totalBasePrice += formData.airportTransferType === "roundtrip" ? 280 : 150;
    if (formData.latecheckout) totalBasePrice += 80 * roomsToCalculate.length;
    if (formData.earlyCheckin) totalBasePrice += 60 * roomsToCalculate.length;
    if (formData.petFriendly) totalBasePrice += 50 * nights;
    if (formData.spa) totalBasePrice += 120;
    if (formData.laundry) totalBasePrice += 80;
    if (formData.discount > 0) {
      if (formData.discountType === "percent") totalBasePrice -= totalBasePrice * (formData.discount / 100);
      else totalBasePrice -= formData.discount;
    }
    return Math.max(0, totalBasePrice);
  };

  // Total da reserva (com desconto) — mesma referência em Pagamento, Canal e Confirmação
  const reservationTotalWithDiscount = useMemo(
    () => calculateTotal(),
    [
      formData.selectedRooms,
      formData.roomId,
      formData.checkIn,
      formData.checkOut,
      formData.ratePlan,
      formData.stayType,
      formData.discount,
      formData.discountType,
      formData.selectedExtras,
      formData.breakfast,
      formData.parking,
      formData.airportTransfer,
      formData.airportTransferType,
      formData.latecheckout,
      formData.earlyCheckin,
      formData.petFriendly,
      formData.spa,
      formData.laundry,
      formData.adults,
      formData.propertyType,
      formData.category,
      dbUnits,
      dbRoomTypes,
      dbProperties,
      unitRatesMap,
      effectiveRatePlans,
    ]
  );

  // Valor final a exibir: quando há comissão, mostra líquido (após comissão); senão, restante a receber
  const valorFinalExibido = useMemo(() => {
    const totalComDesconto = reservationTotalWithDiscount;
    const rawPaid = formData.paidAmount;
    const valorPago = typeof rawPaid === "number" ? rawPaid : (parseFloat(String(rawPaid ?? "").replace(",", ".").replace(/\s/g, "")) || 0);
    const restante = Math.max(0, totalComDesconto - valorPago);
    const hasCommission = formData.isAgency || (formData.agencyCommission && Number(formData.agencyCommission) > 0);
    const commissionPct = parseFloat(String(formData.agencyCommission || "0").replace(",", ".")) / 100;
    if (hasCommission && restante > 0 && commissionPct > 0) {
      const valorComissao = Math.round((restante * commissionPct) * 100) / 100;
      return Math.round(Math.max(0, restante - valorComissao) * 100) / 100;
    }
    return restante;
  }, [reservationTotalWithDiscount, formData.paidAmount, formData.isAgency, formData.agencyCommission]);

  const hasCommissionAplicada = useMemo(() => {
    const hasCommission = formData.isAgency || (formData.agencyCommission && Number(formData.agencyCommission) > 0);
    const totalComDesconto = reservationTotalWithDiscount;
    const rawPaid = formData.paidAmount;
    const valorPago = typeof rawPaid === "number" ? rawPaid : (parseFloat(String(rawPaid ?? "").replace(",", ".").replace(/\s/g, "")) || 0);
    const restante = Math.max(0, totalComDesconto - valorPago);
    return !!(hasCommission && restante > 0 && parseFloat(String(formData.agencyCommission || "0").replace(",", ".")) > 0);
  }, [reservationTotalWithDiscount, formData.paidAmount, formData.isAgency, formData.agencyCommission]);

  const handleSave = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      toast.error("Datas de Check-in e Check-out são obrigatórias.");
      return;
    }
    const isMultiRoom = formData.selectedRooms.length >= 2;
    if (!isMultiRoom && !formData.roomId) {
      toast.error("Selecione uma Unidade.");
      return;
    }
    if (!formData.guestName?.trim()) {
      toast.error("Nome do hóspede é obrigatório.");
      return;
    }
    setIsSaving(true);
    try {
      let finalGuestId = formData.guestId;
      if (!finalGuestId) {
        const nameParts = (formData.guestName ?? "").trim().split(/\s+/);
        const firstName = nameParts[0] ?? formData.guestName;
        const lastName = nameParts.slice(1).join(" ") || firstName;
        const guestPayload = {
          firstName,
          lastName,
          name: formData.guestName,
          email: formData.guestEmail || undefined,
          phone: formData.guestPhone || undefined,
          documentNumber: formData.guestCPF || undefined,
          address: formData.guestAddress || undefined,
          city: formData.guestCity || undefined,
          state: formData.guestState || undefined,
          zipCode: formData.guestZipCode || undefined,
          country: formData.guestCountry || undefined,
          marketingConsent: formData.marketingOptIn,
          type: "physical" as const,
          birthDate: formData.guestBirthdate || undefined,
          nationality: formData.guestNationality || undefined,
          occupation: formData.guestOccupation || undefined,
          companyName: formData.guestCompany || undefined,
          emergencyContactName: formData.guestEmergencyName || undefined,
          emergencyContactPhone: formData.guestEmergencyPhone || undefined,
          notes: formData.guestNotes || undefined,
        };
        const guestRes = await api.createGuest(guestPayload as any);
        if (guestRes.success && guestRes.data) {
          finalGuestId = String((guestRes.data as any).id);
        } else {
          toast.error("Erro ao criar cadastro do hóspede: " + (guestRes.error?.message ?? "Erro desconhecido"));
          setIsSaving(false);
          return;
        }
      }

      const reservationsToCreate: any[] = [];
      const groupId = isMultiRoom ? `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` : undefined;

      const extrasTotalForPayload = (formData.selectedExtras || []).reduce((acc, extra) => acc + (Number(extra.price) || 0) * (Number(extra.quantity) || 1), 0);

      const commissionPctNum = formData.agencyCommission !== "" && formData.agencyCommission != null && !isNaN(parseFloat(String(formData.agencyCommission)))
        ? parseFloat(String(formData.agencyCommission).replace(",", ".")) / 100
        : 0;
      const agencyPayload = {
        isAgency: !!formData.isAgency,
        agencyName: formData.agencyName || null,
        agencyContact: formData.agencyContact || null,
        agencyEmail: formData.agencyEmail || null,
        agencyCommission: formData.agencyCommission !== "" && formData.agencyCommission != null && !isNaN(parseFloat(String(formData.agencyCommission)))
          ? parseFloat(String(formData.agencyCommission).replace(",", "."))
          : null,
        externalId: formData.externalId || null,
        voucherNumber: formData.voucherNumber || null,
        agencyNotes: formData.agencyNotes || null,
      };
      const calcCommissionAmount = (totalVal: number, paidVal: number) => {
        const valorX = Math.max(0, totalVal - paidVal);
        if (commissionPctNum <= 0) return null;
        return Math.round((valorX * commissionPctNum) * 100) / 100;
      };

      if (isMultiRoom) {
        formData.selectedRooms.forEach((roomId) => {
          const unit = dbUnits.find((u: any) => String(u.id) === String(roomId));
          if (!unit) return;
          const pricing = calculateUnitPricing(unit);
          const roomTotal = pricing.total + extrasTotalForPayload;
          const paidPerRoom = (Number(formData.paidAmount) || 0) / formData.selectedRooms.length;
          const baseRate = pricing.nights > 0 ? roomTotal / pricing.nights : roomTotal;
          const commissionAmountRoom = calcCommissionAmount(roomTotal, paidPerRoom);
          reservationsToCreate.push({
            ...formData,
            ...agencyPayload,
            commissionAmount: commissionAmountRoom ?? undefined,
            guestId: finalGuestId,
            unitId: Number(roomId),
            propertyId: unit.propertyId ?? (unit as any).property_id ?? 1,
            totalAmount: roomTotal,
            paidAmount: paidPerRoom,
            baseRate,
            balance: roomTotal - paidPerRoom,
            nights: pricing.nights,
            status: "confirmed",
            groupId,
            adults: Number(formData.adults),
            children: Number(formData.children),
            infants: Number(formData.infants),
            items: (formData.selectedExtras || []).map((extra) => {
              const qty = Number(extra.quantity) || 1;
              const price = Number(extra.price) || 0;
              return { name: extra.name, type: "extra", quantity: qty, unitPrice: price, totalPrice: price * qty };
            }),
            checkIn: dateLocale.extractDateOnly(formData.checkIn),
            checkOut: dateLocale.extractDateOnly(formData.checkOut),
          });
        });
      } else {
        const unit = dbUnits.find((u: any) => String(u.id) === String(formData.roomId));
        const total = calculateTotal();
        const nights = calculateNights();
        const paidAmount = Number(formData.paidAmount) || 0;
        const baseRate = nights > 0 ? total / nights : total;
        const commissionAmountSingle = calcCommissionAmount(total, paidAmount);
        reservationsToCreate.push({
          ...formData,
          ...agencyPayload,
          commissionAmount: commissionAmountSingle ?? undefined,
          guestId: finalGuestId,
          unitId: Number(formData.roomId),
          propertyId: Number(unit?.propertyId ?? (unit as any)?.property_id ?? 1),
          totalAmount: total,
          paidAmount,
          baseRate,
          balance: total - paidAmount,
          nights,
          status: "confirmed",
          adults: Number(formData.adults),
          children: Number(formData.children),
          infants: Number(formData.infants),
          items: (formData.selectedExtras || []).map((extra) => {
            const qty = Number(extra.quantity) || 1;
            const price = Number(extra.price) || 0;
            return { name: extra.name, type: "extra", quantity: qty, unitPrice: price, totalPrice: price * qty };
          }),
          checkIn: dateLocale.extractDateOnly(formData.checkIn),
          checkOut: dateLocale.extractDateOnly(formData.checkOut),
        });
      }

      const results: any[] = [];
      for (const payload of reservationsToCreate) {
        if (mode === "edit" && formData.id && !isMultiRoom) {
          results.push(await api.updateReservation(Number(formData.id), payload));
        } else {
          results.push(await api.createReservation(payload));
        }
      }

      const allSuccess = results.every((r) => r.success);
      const firstSuccess = results.find((r) => r.success);

      if (allSuccess) {
        if (onSave) onSave({ ...formData, totalAmount: calculateTotal() });
        if (mode === "edit" && !isMultiRoom) {
          toast.success("Reserva atualizada com sucesso!");
          onOpenChange(false);
        } else {
          // Protocolo: priorizar reservation_number/reservationNumber retornado pelo backend
          const data = firstSuccess?.data as {
            reservation?: { reservationNumber?: string; reservation_number?: string };
            reservation_number?: string;
            reservationNumber?: string;
            protocol?: string;
          } | undefined;
          const res = data?.reservation;
          const protocol =
            (res && ("reservation_number" in res ? (res as { reservation_number?: string }).reservation_number : (res as { reservationNumber?: string }).reservationNumber)) ??
            data?.reservation_number ??
            data?.reservationNumber ??
            data?.protocol ??
            generateProtocol();
          setProtocolNumber(isMultiRoom ? (groupId ?? protocol) : protocol);
          setConfirmationTime(format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }));
          setShowSuccess(true);
          const roomsDisplay = (formData.selectedRooms?.length ? formData.selectedRooms : formData.roomId ? [formData.roomId] : []).map((roomId) => {
            const u = dbUnits.find((du: { id?: number; number?: string; name?: string; roomTypeId?: number; roomType?: { id?: number; name?: string } }) => String(du.id) === String(roomId));
            const rt = u ? dbRoomTypes.find((r: { id?: number; name?: string }) => String(r.id) === String((u as any).roomTypeId ?? (u as any).roomType?.id)) : null;
            return u ? `${(u as any).number ?? (u as any).name ?? roomId} (${rt?.name ?? "Standard"})` : String(roomId);
          });
          setSummaryData({
            protocolNumber: isMultiRoom ? (groupId ?? protocol) : protocol,
            guestName: formData.guestName ?? "",
            guestEmail: formData.guestEmail ?? "",
            guestPhone: formData.guestPhone ?? "",
            guestCPF: formData.guestCPF ?? "",
            guestAddress: formData.guestAddress,
            guestCity: formData.guestCity,
            guestState: formData.guestState,
            guestZipCode: formData.guestZipCode,
            checkIn: formData.checkIn ?? "",
            checkOut: formData.checkOut ?? "",
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            adults: String(formData.adults ?? 1),
            children: String(formData.children ?? 0),
            infants: String(formData.infants ?? 0),
            roomId: formData.roomId ?? "",
            selectedRooms: roomsDisplay,
            category: (formData.category && dbRoomTypes.find((c: { id?: number; name?: string }) => String(c.id) === String(formData.category))?.name) ?? "",
            paymentMethod: formData.paymentMethod ?? "",
            paymentStatus: formData.paymentStatus ?? "pending",
            totalAmount: calculateTotal(),
            paidAmount: Number(formData.paidAmount) || 0,
            discount: Number(formData.discount) || 0,
            discountType: formData.discountType,
            specialRequests: formData.confirmationNotes,
            breakfast: formData.breakfast,
            parking: formData.parking,
            airportTransfer: formData.airportTransfer,
            latecheckout: formData.latecheckout,
            earlyCheckin: formData.earlyCheckin,
            spa: formData.spa,
            petFriendly: formData.petFriendly,
            isAgency: formData.isAgency,
            agencyName: formData.agencyName,
            channel: formData.bookingChannel ?? formData.channel,
          });
          toast.success(`${results.length} reserva(s) realizada(s) com sucesso!`);
        }
      } else {
        toast.error(`Erro ao processar reserva(s). Sucesso: ${results.filter((r) => r.success).length}/${results.length}`);
      }
    } catch (error) {
      console.error("HandleSave Exception:", error);
      toast.error("Erro inesperado ao salvar reserva.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSummaryData(null);
    setSummaryModalOpen(false);
    onOpenChange(false);
  };

  const handleCreateAnother = () => {
    setFormData({ ...defaultFormData });
    setActiveTab("info");
    setShowSuccess(false);
    setProtocolNumber("");
    setConfirmationTime("");
    setSummaryData(null);
    setSummaryModalOpen(false);
  };

  const copyProtocol = () => {
    navigator.clipboard.writeText(protocolNumber);
    toast.success("Protocolo copiado!");
  };

  const goToNextTab = () => {
    // Validação na etapa Datas: não avançar sem check-in e check-out (igual ao modal antigo)
    if (activeTab === "availability") {
      if (!formData.checkIn || !formData.checkOut) {
        toast.error("Por favor, selecione as datas de Check-in e Check-out para continuar.", {
          position: "top-center",
        });
        return;
      }
    }
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleTabClick = (tabId: TabId) => {
    const targetIndex = tabs.findIndex(t => t.id === tabId);
    const availabilityIndex = tabs.findIndex(t => t.id === "availability");

    // Impedir ir para Unidade ou abas posteriores sem datas preenchidas (igual ao modal antigo)
    if (targetIndex > availabilityIndex) {
      if (!formData.checkIn || !formData.checkOut) {
        toast.error("Por favor, selecione as datas de Check-in e Check-out na aba 'Datas' antes de prosseguir.", {
          position: "top-center",
        });
        if (activeTab !== "availability") {
          setActiveTab("availability");
        }
        return;
      }
    }

    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "info": {
        const hasSelectedGuest = formData.guestName && formData.guestEmail;
        
        return (
          <div className="space-y-6">
            {/* Guest Search */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <Label className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
                <div className="p-1.5 rounded-lg bg-muted">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                Buscar Hóspede Existente
              </Label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Digite nome, CPF, e-mail ou telefone (mín. 2 caracteres)..."
                      value={searchGuest}
                      onChange={(e) => {
                        setSearchGuest(e.target.value);
                        setShowGuestSuggestions(e.target.value.length >= 2);
                      }}
                      onFocus={() => searchGuest.length >= 2 && setShowGuestSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowGuestSuggestions(false), 200)}
                      className="w-full pr-10"
                    />
                    {isSearchingGuests && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {/* Autocomplete Dropdown */}
                    {showGuestSuggestions && searchGuest.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {isSearchingGuests && filteredGuests.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando hóspedes...
                      </div>
                    ) : filteredGuests.length > 0 ? (
                        <>
                        {filteredGuests.map((guest) => (
                          <div
                            key={guest.id}
                            onClick={() => selectGuest(guest)}
                            className="p-3 hover:bg-emerald-500/5 cursor-pointer border-b border-border last:border-b-0 transition-colors rounded-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{guest.name}</p>
                                  <p className="text-sm text-muted-foreground">{guest.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={
                                  guest.loyaltyTier === "platinum" ? "border-slate-500 text-slate-600" :
                                  guest.loyaltyTier === "gold" ? "border-amber-500 text-amber-600" :
                                  guest.loyaltyTier === "silver" ? "border-slate-400 text-slate-500" :
                                  "border-amber-400 text-amber-600"
                                }>
                                  {guest.loyaltyTier.charAt(0).toUpperCase() + guest.loyaltyTier.slice(1)}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">{guest.totalStays} estadias</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {guest.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <IdCard className="h-3 w-3" />
                                {guest.cpf}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {guest.city}, {guest.state}
                              </span>
                            </div>
                          </div>
                        ))}
                        </>
                    ) : !isSearchingGuests ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum hóspede encontrado. Clique em &quot;Novo&quot; para cadastrar.
                      </div>
                    ) : null}
                    </div>
                    )}
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => setNewGuestModalOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                    Novo
                  </Button>
                </div>
              </div>
            </div>

            {/* Show guest data only after selection */}
            {hasSelectedGuest ? (
              <>
                {/* Returning Guest Badge */}
                {formData.isReturningGuest && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-success/20">
                      <Star className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Hóspede Frequente</p>
                      <p className="text-sm text-muted-foreground">{formData.guestTotalStays} estadias anteriores • Nível {formData.guestLoyaltyTier}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto gap-2"
                      onClick={() => setGuestHistoryModalOpen(true)}
                    >
                      <History className="h-4 w-4" />
                      Ver Histórico
                    </Button>
                  </div>
                )}

                {/* Guest Profile Card - Read Only View */}
                <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-white">
                          {formData.guestName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{formData.guestName}</h3>
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/25 text-xs font-medium">
                            SELECIONADO
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={
                            formData.guestLoyaltyTier === "platinum" ? "border-slate-500 text-slate-600 bg-slate-500/10" :
                            formData.guestLoyaltyTier === "gold" ? "border-amber-500 text-amber-600 bg-amber-500/10" :
                            formData.guestLoyaltyTier === "silver" ? "border-slate-400 text-slate-500 bg-slate-400/10" :
                            "border-amber-400 text-amber-600 bg-amber-400/10"
                          }>
                            {formData.guestLoyaltyTier.charAt(0).toUpperCase() + formData.guestLoyaltyTier.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formData.guestTotalStays} estadias</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-border text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            guestName: "",
                            guestEmail: "",
                            guestPhone: "",
                            guestCPF: "",
                            guestBirthdate: "",
                            guestNationality: "Brasileiro",
                            guestAddress: "",
                            guestCity: "",
                            guestState: "",
                            guestZipCode: "",
                            guestCountry: "Brasil",
                            guestCompany: "",
                            guestOccupation: "",
                            guestEmergencyName: "",
                            guestEmergencyPhone: "",
                            guestNotes: "",
                            guestLoyaltyTier: "bronze",
                            guestTotalStays: 0,
                            isReturningGuest: false,
                          }));
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Substituir Hóspede
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-border text-muted-foreground hover:text-foreground"
                        onClick={() => setGuestHistoryModalOpen(true)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Ver Timeline
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                        onClick={() => setAccompanyingGuestsModalOpen(true)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Acompanhantes ({formData.accompanyingGuests?.length ?? 0})
                      </Button>
                    </div>
                  </div>

                  {/* Personal Data Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">E-mail</span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{formData.guestEmail}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Telefone</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{formData.guestPhone}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Documento</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{formData.guestCPF}</p>
                    </div>
                    {formData.guestBirthdate && (
                      <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Nascimento</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(formData.guestBirthdate + "T00:00:00"), "dd/MM/yyyy")}
                        </p>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Nacionalidade</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{formData.guestNationality}</p>
                    </div>
                    {formData.guestOccupation && (
                      <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Profissão</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{formData.guestOccupation}</p>
                      </div>
                    )}
                    {formData.guestCompany && (
                      <div className="p-3 rounded-xl bg-background/60 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Empresa</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{formData.guestCompany}</p>
                      </div>
                    )}
                  </div>

                  {/* Address Section */}
                  {formData.guestAddress && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Endereço</span>
                      </div>
                      <p className="text-sm text-foreground">{formData.guestAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.guestCity && formData.guestState && `${formData.guestCity}, ${formData.guestState}`}
                        {formData.guestZipCode && ` - CEP: ${formData.guestZipCode}`}
                        {formData.guestCountry && formData.guestCountry !== "Brasil" && ` • ${formData.guestCountry}`}
                      </p>
                    </div>
                  )}

                  {/* Emergency Contact Section */}
                  {formData.guestEmergencyName && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-semibold text-foreground">Contato de Emergência</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="text-sm font-medium text-foreground">{formData.guestEmergencyName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Telefone</p>
                          <p className="text-sm font-medium text-foreground">{formData.guestEmergencyPhone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {formData.guestNotes && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">Observações</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{formData.guestNotes}</p>
                    </div>
                  )}
                </div>

              </>
            ) : (
              /* Empty State - No guest selected */
              <div className="p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2">Nenhum hóspede selecionado</h4>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Busque um hóspede existente no campo acima ou clique em <strong>"Novo"</strong> para cadastrar um novo hóspede.
                </p>
              </div>
            )}
          </div>
        );
      }

      case "availability": {
        const dateRange: DateRange | undefined = formData.checkIn || formData.checkOut ? {
          from: formData.checkIn ? dateLocale.parseDateOnly(formData.checkIn) : undefined,
          to: formData.checkOut ? dateLocale.parseDateOnly(formData.checkOut) : undefined,
        } : undefined;
        
        const handleDateRangeSelect = (range: DateRange | undefined) => {
          if (range?.from) {
            updateForm("checkIn", dateLocale.toDateOnlyKey(range.from));
          } else {
            updateForm("checkIn", "");
          }
          if (range?.to) {
            updateForm("checkOut", dateLocale.toDateOnlyKey(range.to));
          } else {
            updateForm("checkOut", "");
          }
        };
        
        return (
          <div className="space-y-6">
            {/* Dates & Times in one section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <CalendarDays className="h-4 w-4 text-emerald-500" />
                </div>
                Período da Estadia
                {calculateNights() > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary text-sm px-3">
                    {calculateNights()} noite{calculateNights() > 1 ? "s" : ""}
                  </Badge>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Date Range Picker */}
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Check-in / Check-out *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd MMM", { locale: ptBR })} - {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                            </>
                          ) : (
                            format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
                          )
                        ) : (
                          <span>Selecione as datas</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                        locale={ptBR}
                        className="pointer-events-auto"
                        classNames={{ day_today: "" }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        defaultMonth={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Check-in Time */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Hora Check-in
                  </Label>
                  <Select value={formData.checkInTime} onValueChange={(v) => updateForm("checkInTime", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Check-out Time */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Hora Check-out
                  </Label>
                  <Select value={formData.checkOutTime} onValueChange={(v) => updateForm("checkOutTime", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/5 to-violet-600/10 border border-violet-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                Hóspedes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Adults */}
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adultos</p>
                      <p className="text-xs text-muted-foreground">13+ anos</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.adults) || 1;
                        if (current > 1) updateForm("adults", String(current - 1));
                      }}
                      disabled={parseInt(formData.adults) <= 1}
                    >
                      <span className="text-lg font-medium">−</span>
                    </Button>
                    <span className="text-2xl font-bold text-foreground min-w-[3rem] text-center">
                      {formData.adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.adults) || 1;
                        if (current < 8) updateForm("adults", String(current + 1));
                      }}
                      disabled={parseInt(formData.adults) >= 8}
                    >
                      <span className="text-lg font-medium">+</span>
                    </Button>
                  </div>
                </div>
                
                {/* Children */}
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Baby className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Crianças</p>
                      <p className="text-xs text-muted-foreground">2-12 anos</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.children) || 0;
                        if (current > 0) updateForm("children", String(current - 1));
                      }}
                      disabled={parseInt(formData.children) <= 0}
                    >
                      <span className="text-lg font-medium">−</span>
                    </Button>
                    <span className="text-2xl font-bold text-foreground min-w-[3rem] text-center">
                      {formData.children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.children) || 0;
                        if (current < 5) updateForm("children", String(current + 1));
                      }}
                      disabled={parseInt(formData.children) >= 5}
                    >
                      <span className="text-lg font-medium">+</span>
                    </Button>
                  </div>
                </div>

                {/* Infants */}
                <div className="p-4 rounded-xl bg-background border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <Baby className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Bebês</p>
                      <p className="text-xs text-muted-foreground">0-2 anos</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.infants) || 0;
                        if (current > 0) updateForm("infants", String(current - 1));
                      }}
                      disabled={parseInt(formData.infants) <= 0}
                    >
                      <span className="text-lg font-medium">−</span>
                    </Button>
                    <span className="text-2xl font-bold text-foreground min-w-[3rem] text-center">
                      {formData.infants}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => {
                        const current = parseInt(formData.infants) || 0;
                        if (current < 3) updateForm("infants", String(current + 1));
                      }}
                      disabled={parseInt(formData.infants) >= 3}
                    >
                      <span className="text-lg font-medium">+</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Purpose & Occasion */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/5 to-pink-500/10 border border-rose-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20">
                  <Briefcase className="h-4 w-4 text-rose-500" />
                </div>
                Motivo da Viagem
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2">Propósito da Estadia</Label>
                  <Select value={formData.purposeOfStay} onValueChange={(v) => updateForm("purposeOfStay", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leisure">Lazer</SelectItem>
                      <SelectItem value="business">Negócios</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="health">Tratamento de Saúde</SelectItem>
                      <SelectItem value="family">Visita Familiar</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    Ocasião Especial
                  </Label>
                  <Select value={formData.specialOccasion} onValueChange={(v) => updateForm("specialOccasion", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="birthday">Aniversário</SelectItem>
                      <SelectItem value="anniversary">Aniversário de Casamento</SelectItem>
                      <SelectItem value="honeymoon">Lua de Mel</SelectItem>
                      <SelectItem value="graduation">Formatura</SelectItem>
                      <SelectItem value="proposal">Pedido de Casamento</SelectItem>
                      <SelectItem value="babymoon">Babymoon</SelectItem>
                      <SelectItem value="retirement">Aposentadoria</SelectItem>
                      <SelectItem value="other">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Origem da Reserva
                  </Label>
                  <Select value={formData.bookingSource} onValueChange={(v) => updateForm("bookingSource", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Site do Hotel</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="walkin">Walk-in</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="referral">Indicação</SelectItem>
                      <SelectItem value="repeat">Hóspede Frequente</SelectItem>
                      <SelectItem value="corporate">Contrato Corporativo</SelectItem>
                      <SelectItem value="event">Evento no Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "apartment": {
        const PropertyIcon = propertyTypeConfig[formData.propertyType]?.icon || Building2;
        const propertyConfig = propertyTypeConfig[formData.propertyType];
        const stayConfig = stayTypeConfig[formData.stayType];
        
        return (
          <div className="space-y-6">
            {/* Property Type Selection */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-600/10 border border-blue-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                Tipo de Propriedade *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(propertyTypeConfig) as [PropertyType, typeof propertyTypeConfig.hotel][]).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      onClick={() => {
                        updateForm("propertyType", type);
                        updateForm("category", "");
                        updateForm("roomId", "");
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.propertyType === type
                          ? `border-${config.color}-500 bg-${config.color}-500/10 shadow-lg`
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${formData.propertyType === type ? `text-${config.color}-500` : "text-muted-foreground"}`} />
                      <p className="font-semibold text-foreground text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stay Type Selection */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <CalendarRange className="h-4 w-4 text-emerald-500" />
                </div>
                Tipo de Estadia *
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.entries(stayTypeConfig) as [StayType, typeof stayTypeConfig.daily][]).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      onClick={() => updateForm("stayType", type)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.stayType === type
                          ? `border-${config.color}-500 bg-${config.color}-500/10 shadow-lg`
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${formData.stayType === type ? `text-${config.color}-500` : "text-muted-foreground"}`} />
                        {config.multiplier < 1 && (
                          <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                            -{Math.round((1 - config.multiplier) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Mín: {config.minNights} noites</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Preferences - moved before category for filtering logic */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <Home className="h-4 w-4 text-amber-500" />
                </div>
                Preferências do Quarto
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 text-sm">Preferência de Andar</Label>
                  <Select value={formData.floorPreference} onValueChange={(v) => updateForm("floorPreference", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem preferência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem preferência</SelectItem>
                      <SelectItem value="low">Andar baixo</SelectItem>
                      <SelectItem value="high">Andar alto</SelectItem>
                      <SelectItem value="ground">Térreo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 text-sm">Preferência de Vista</Label>
                  <Select value={formData.viewPreference} onValueChange={(v) => updateForm("viewPreference", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sem preferência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem preferência</SelectItem>
                      <SelectItem value="pool">Piscina</SelectItem>
                      <SelectItem value="garden">Jardim</SelectItem>
                      <SelectItem value="sea">Mar</SelectItem>
                      <SelectItem value="city">Cidade</SelectItem>
                      <SelectItem value="mountain">Montanha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 text-sm">Fumante</Label>
                  <Select value={formData.smokingPreference} onValueChange={(v) => updateForm("smokingPreference", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-smoking">Não fumante</SelectItem>
                      <SelectItem value="smoking">Fumante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border h-10 w-full">
                    <Checkbox
                      id="accessibility-pref"
                      checked={formData.accessibilityNeeds}
                      onCheckedChange={(checked) => updateForm("accessibilityNeeds", checked as boolean)}
                    />
                    <Label htmlFor="accessibility-pref" className="cursor-pointer text-sm flex items-center gap-2">
                      <Accessibility className="h-4 w-4 text-muted-foreground" />
                      Acessibilidade
                    </Label>
                  </div>
                </div>
              </div>
              
              {formData.accessibilityNeeds && (
                <Input
                  placeholder="Descreva as necessidades específicas de acessibilidade..."
                  value={formData.accessibilityNotes}
                  onChange={(e) => updateForm("accessibilityNotes", e.target.value)}
                  className="mt-4"
                />
              )}
            </div>

            {/* Room Category */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/5 to-violet-600/10 border border-violet-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20">
                  <Tag className="h-4 w-4 text-violet-500" />
                </div>
                Categoria da Unidade *
                <Badge variant="outline" className="ml-2 text-xs">
                  <PropertyIcon className="h-3 w-3 mr-1" />
                  {propertyConfig?.label}
                </Badge>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {currentCategories.map(cat => {
                  const priceByStay = formData.stayType === "weekly" ? cat.weeklyPrice :
                    formData.stayType === "monthly" ? cat.monthlyPrice :
                    formData.stayType === "longstay" ? cat.longstayPrice : cat.dailyPrice;
                  const priceLabel = formData.stayType === "weekly" ? "/semana" :
                    formData.stayType === "monthly" ? "/mês" :
                    formData.stayType === "longstay" ? "/mês" : "/noite";
                  
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, category: cat.id, roomId: "", selectedRooms: [] }));
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.category === cat.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-semibold text-foreground">{cat.name}</p>
                      <p className="text-sm text-primary font-medium">R$ {priceByStay.toLocaleString()}{priceLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">Até {cat.maxGuests} hóspedes</p>
                      {formData.stayType !== "daily" && (
                        <p className="text-xs text-muted-foreground line-through">
                          R$ {cat.dailyPrice}/noite
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Rate Plan - only show for daily */}
            {formData.category && formData.stayType === "daily" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Plano Tarifário
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {effectiveRatePlans.map((plan: any) => {
                    const isSelected = formData.ratePlan === plan.id;
                    return (
                    <div
                      key={plan.id}
                      onClick={() => updateForm("ratePlan", isSelected ? "" : plan.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-foreground text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                      {plan.modifier && (
                        <Badge variant="secondary" className={`mt-2 text-xs ${plan.modifier < 1 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                          {plan.modifier < 1 ? `-${Math.round((1 - plan.modifier) * 100)}%` : `+${Math.round((plan.modifier - 1) * 100)}%`}
                        </Badge>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Room Selection with Connected Rooms */}
            {formData.category && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 border border-cyan-500/20">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <BedDouble className="h-4 w-4 text-cyan-500" />
                  </div>
                  Selecionar Unidades
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Clique em um quarto para selecionar. Quartos com <Link className="h-3 w-3 inline text-cyan-500" /> são conectáveis para famílias.
                </p>
                
                {formData.selectedRooms.length >= 2 && (
                  <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      Pacote Família: 5% de desconto aplicado para quartos conectados!
                    </span>
                  </div>
                )}

                {/* Quartos Selecionados - acima do grid para ficar visível */}
                {formData.selectedRooms.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Quartos Selecionados ({formData.selectedRooms.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedRooms.map(roomId => {
                        const room = currentRooms.find((r: { id: string | number }) => String(r.id) === String(roomId));
                        const category = currentCategories.find((c: { id: string }) => String(c.id) === String(room?.category));
                        return room ? (
                          <Badge key={roomId} variant="secondary" className="bg-cyan-500/20 text-cyan-700">
                            {room.number} - {category?.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                {(() => {
                  // Unidades filtradas pela categoria selecionada (igual ao modal antigo)
                  const roomsInCategory = currentRooms.filter((r: any) => {
                    const isCategory = String(r.roomTypeId ?? r.room_type_id ?? r.categoryId ?? r.category_id ?? r.category) === String(formData.category);
                    if (!isCategory) return false;
                    if (formData.floorPreference && formData.floorPreference !== "none") {
                      const floor = Number(r.floor ?? 0);
                      if (formData.floorPreference === "ground" && floor !== 0) return false;
                      if (formData.floorPreference === "low" && (floor === 0 || floor > 3)) return false;
                      if (formData.floorPreference === "high" && floor <= 3) return false;
                    }
                    if (formData.viewPreference && formData.viewPreference !== "none") {
                      const view = (r.view ?? "").toLowerCase();
                      const pref = formData.viewPreference;
                      if (pref === "pool" && !view.includes("piscina") && !view.includes("pool")) return false;
                      if (pref === "garden" && !view.includes("jardim") && !view.includes("garden")) return false;
                      if (pref === "sea" && !view.includes("mar") && !view.includes("sea")) return false;
                      if (pref === "city" && !view.includes("cidade") && !view.includes("city")) return false;
                    }
                    return true;
                  });
                  return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roomsInCategory.map(room => {
                    const roomIdStr = String(room.id);
                    const isSelected = formData.selectedRooms.some(id => String(id) === roomIdStr);
                    const hasConnections = room.connectedTo && room.connectedTo.length > 0;
                    const isConnectedToSelected = formData.selectedRooms.some(
                      selectedId => (room.connectedTo ?? []).some((connId: string | number) => String(connId) === String(selectedId))
                    );
                    
                    // Sincronizar status com tarefas de governança + disponibilidade no período (banco)
                    const activeTask = dbHousekeepingTasks.find((t: any) => String(t.unit_id || t.unitId) === String(room.id));
                    const isOccupiedByReservation = occupiedUnitIds.includes(Number(room.id));
                    const computedStatus = resolveUnitOperationalStatus({
                      unitStatus: room.status,
                      activeTask,
                      isOccupiedByReservation,
                    });
                    const taskTypeLabel = activeTask?.type ?? "";
                    
                    // Números dos quartos conectados (apenas os que estão na mesma categoria)
                    const connectedRoomNumbers = (room.connectedTo ?? []).map((connId: string | number) => {
                      const connRoom = roomsInCategory.find((r: any) => String(r.id) === String(connId));
                      return connRoom?.number;
                    }).filter(Boolean);
                    
                    const handleRoomClick = () => {
                      if (isSelected) {
                        const newSelection = formData.selectedRooms.filter(id => String(id) !== roomIdStr);
                        setFormData(prev => ({ 
                          ...prev, 
                          selectedRooms: newSelection,
                          roomId: newSelection.length > 0 ? newSelection[0] : "",
                          category: newSelection.length > 0 ? prev.category : ""
                        }));
                      } else {
                        if (computedStatus === "occupied") {
                          toast.error(`Unidade ${room.number ?? roomIdStr} já está reservada neste período. Escolha outras datas ou outra unidade.`);
                          return;
                        }
                        if (computedStatus === "maintenance" || computedStatus === "blocked") {
                          toast.error(taskTypeLabel ? `Unidade ${room.number ?? roomIdStr} bloqueada para Manutenção: ${taskTypeLabel}` : `A unidade ${room.number ?? roomIdStr} está em manutenção e não pode ser reservada.`);
                          return;
                        }
                        if (computedStatus === "cleaning") {
                          toast.error(`Unidade ${room.number ?? roomIdStr} está em Limpeza.`);
                          return;
                        }
                        setFormData(prev => ({ 
                          ...prev, 
                          selectedRooms: [...prev.selectedRooms, roomIdStr],
                          roomId: prev.roomId || roomIdStr,
                          category: prev.category || room.category
                        }));
                        toast.success("Unidade adicionada à reserva");
                      }
                    };
                    
                    const isBlocked = computedStatus === "maintenance" || computedStatus === "blocked";
                    const isCleaning = computedStatus === "cleaning";
                    const isOccupied = computedStatus === "occupied";
                    const canSelect = !isBlocked && !isCleaning && !isOccupied;
                    
                    return (
                      <div
                        key={room.id}
                        onClick={canSelect ? handleRoomClick : undefined}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all relative",
                          !canSelect && "opacity-80 cursor-not-allowed",
                          canSelect && isSelected && "border-cyan-500 bg-cyan-500/10 shadow-lg ring-2 ring-cyan-500/30 cursor-pointer",
                          canSelect && !isSelected && "border-border hover:border-cyan-500/50 hover:bg-muted/50 cursor-pointer",
                          !canSelect && isBlocked && "border-red-100 bg-red-50/30",
                          !canSelect && isCleaning && "border-orange-100 bg-orange-50/30",
                          !canSelect && isOccupied && "border-blue-100 bg-blue-50/30"
                        )}
                      >
                        {/* Indicador de conectável (apenas informativo) */}
                        {hasConnections && (
                          <div className="absolute -top-2 -right-2">
                            <div className={cn("p-1 rounded-full", (isConnectedToSelected || isSelected) ? "bg-cyan-500" : "bg-muted")}>
                              <Link className={cn("h-3 w-3", (isConnectedToSelected || isSelected) ? "text-white" : "text-muted-foreground")} />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-lg text-foreground">{room.number}</p>
                          <div className="flex items-center gap-1">
                            {computedStatus === "maintenance" && (
                              <Badge variant="destructive" className="text-[9px] h-5 px-2 font-black flex items-center gap-1">
                                <Wrench className="h-3 w-3" /> MANUTENÇÃO
                              </Badge>
                            )}
                            {computedStatus === "cleaning" && (
                              <Badge className="bg-orange-500 text-white border-0 text-[9px] h-5 px-2 font-black flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> LIMPEZA
                              </Badge>
                            )}
                            {computedStatus === "occupied" && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-[9px] h-5 px-2 font-black flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> OCUPADO
                              </Badge>
                            )}
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {room.floor > 0 ? `${room.floor}º andar • ` : ""}{room.view ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{room.beds}</p>
                        
                        {/* Show connected rooms hint */}
                        {hasConnections && connectedRoomNumbers && (
                          <p className="text-xs text-cyan-600 mt-2 flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Conecta: {connectedRoomNumbers.join(", ")}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(room.amenities ?? []).slice(0, 3).map(amenity => (
                            <Badge key={amenity} variant="outline" className="text-[10px] px-1.5 py-0">
                              {amenity}
                            </Badge>
                          ))}
                          {(room.amenities ?? []).length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{(room.amenities ?? []).length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Category badge */}
                        <Badge 
                          variant="secondary" 
                          className="mt-2 text-[10px] bg-cyan-500/20 text-cyan-700"
                        >
                          {currentCategories.find((c: any) => String(c.id) === String(room.category))?.name}
                        </Badge>

                        {/* Tarifa base e valor cobrado pela unidade */}
                        {(() => {
                          const pricing = calculateUnitPricing(room);
                          const hasDates = formData.checkIn && formData.checkOut && pricing.nights > 0;
                          return (
                            <div className="mt-3 p-2.5 rounded-lg bg-muted/50 border border-border/50 space-y-1">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                Tarifa base
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                R$ {Number(pricing.baseDaily).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/dia
                              </p>
                              {hasDates && (
                                <>
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide pt-1 border-t border-border/50 mt-1">
                                    Valor período ({pricing.nights} {pricing.nights === 1 ? "noite" : "noites"})
                                  </p>
                                  <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                                    R$ {Number(pricing.total).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })()}
                        
                        {/* Label inferior (igual ao modal antigo) */}
                        <div
                          className={cn(
                            "mt-3 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-widest",
                            isSelected && "bg-cyan-200 text-cyan-800",
                            !canSelect && isBlocked && "bg-red-100 text-red-600 cursor-not-allowed",
                            !canSelect && isCleaning && "bg-orange-100 text-orange-600 cursor-not-allowed",
                            canSelect && !isSelected && "bg-muted text-muted-foreground group-hover:bg-cyan-50 group-hover:text-cyan-600"
                          )}
                        >
                          {isSelected ? "Selecionado" : computedStatus === "occupied" ? "Ocupado neste período" : computedStatus === "maintenance" || computedStatus === "blocked" ? "Bloqueado" : computedStatus === "cleaning" ? "Aguardando Limpeza" : "Clique para Adicionar"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  );
                })()}
              </div>
            )}
            
            {/* Extras & Serviços - vindos do banco (igual à tela antiga) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/5 to-pink-600/10 border border-pink-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/20">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                </div>
                Extras & Serviços
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Serviços adicionais</p>
              {availableExtras.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-muted/30 border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">Selecione uma unidade para ver os extras disponíveis.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableExtras.map((extra: { id: number; name: string; price?: number; [key: string]: unknown }) => {
                    const isSelected = formData.selectedExtras?.some((e) => e.extraId === extra.id || e.id === extra.id || e.name === extra.name);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                          isSelected ? "border-pink-500 bg-pink-500/10" : "border-border hover:border-pink-500/50 hover:bg-muted/30"
                        )}
                      >
                        <div className={cn("w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center", isSelected ? "border-pink-500 bg-pink-500" : "border-muted-foreground/40")}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate" title={String(extra.name)}>{extra.name}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            + R$ {Number(extra.price ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {formData.airportTransfer && (
                <div className="mt-4 p-3 rounded-xl bg-muted/30">
                  <Label className="mb-2 flex items-center gap-2 text-sm">
                    <Plane className="h-4 w-4 text-pink-500" />
                    Tipo de Transfer
                  </Label>
                  <Select value={formData.airportTransferType} onValueChange={(v) => updateForm("airportTransferType", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arrival">Somente Chegada (+R$ 150)</SelectItem>
                      <SelectItem value="departure">Somente Saída (+R$ 150)</SelectItem>
                      <SelectItem value="roundtrip">Ida e Volta (+R$ 280)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.petFriendly && (
                <div className="mt-4 p-3 rounded-xl bg-muted/30">
                  <Label className="mb-2 flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Detalhes do Pet
                  </Label>
                  <Input
                    placeholder="Tipo, raça, porte do pet..."
                    value={formData.petDetails}
                    onChange={(e) => updateForm("petDetails", e.target.value)}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Special Requests */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Solicitações Especiais
              </Label>
              <Textarea
                placeholder="Decoração especial, flores, champanhe, berço, cama extra..."
                value={formData.specialRequests}
                onChange={(e) => updateForm("specialRequests", e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Observações Internas
              </Label>
              <Textarea
                placeholder="Notas internas para a equipe (não visíveis para o hóspede)..."
                value={formData.internalNotes}
                onChange={(e) => updateForm("internalNotes", e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );
      }

      case "payments":
        return (
          <div className="space-y-6">
            {/* Resumo financeiro — layout igual à etapa Revisar & Confirmar: fundo escuro, título à esquerda, valor em destaque à direita */}
            {(() => {
              const totalComDesconto = reservationTotalWithDiscount;
              const discountVal = Number(formData.discount) || 0;
              const totalOriginal = discountVal > 0
                ? (formData.discountType === "percent"
                  ? totalComDesconto / (1 - discountVal / 100)
                  : totalComDesconto + discountVal)
                : totalComDesconto;
              const valorDesconto = Math.max(0, totalOriginal - totalComDesconto);
              const rawPaid = formData.paidAmount;
              const valorPago = typeof rawPaid === "number" ? rawPaid : (parseFloat(String(rawPaid ?? "").replace(",", ".").replace(/\s/g, "")) || 0);
              const restante = Math.max(0, totalComDesconto - valorPago);
              const stayInfo = calculateNights() > 0 && formData.category
                ? `${calculateNights()} noite${calculateNights() > 1 ? "s" : ""} • ${currentCategories.find((c: any) => String(c.id) === String(formData.category))?.name} • ${stayTypeConfig[formData.stayType]?.label}`
                : "Valores e formas de pagamento";
              const breakdownParts = [
                `Original: R$ ${totalOriginal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                valorDesconto > 0 && `Desconto: −R$ ${valorDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `Total: R$ ${totalComDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                valorPago > 0 && `Pago: R$ ${valorPago.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${valorPago >= totalComDesconto ? " (total)" : " (parcial)"}`,
              ].filter(Boolean);
              return (
                <div className="relative overflow-hidden rounded-2xl bg-slate-800 p-6">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Pagamento</h3>
                      <p className="text-sm text-slate-400 mt-1">{stayInfo}</p>
                      {breakdownParts.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          {breakdownParts.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">Valor restante</p>
                      <p className="text-3xl font-bold text-emerald-400 mt-1">
                        R$ {restante.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Split Payment Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-600/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                    <Split className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Dividir Pagamento</h3>
                    <p className="text-xs text-muted-foreground">Divida a conta entre múltiplos hóspedes</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSplitPaymentModalOpen(true)}
                  className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                >
                  <Split className="h-4 w-4 mr-2" />
                  Dividir Pagamento
                </Button>
              </div>
            </div>

            {/* Split Payment Details - Show when split is configured */}
            {formData.splitPaymentDetails?.enabled && formData.splitPaymentDetails?.splits?.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/5 to-emerald-500/10 border border-teal-500/20">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/20">
                    <Split className="h-4 w-4 text-teal-500" />
                  </div>
                  Detalhes da Divisão de Pagamento
                </h3>
                <div className="space-y-3">
                  {formData.splitPaymentDetails.splits.map((split, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{split.guestName}</p>
                          <p className="text-xs text-muted-foreground">{split.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">R$ {split.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <Badge variant={split.status === "paid" ? "default" : "secondary"} className="text-xs">
                          {split.status === "paid" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Payment Method */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-600/10 border border-amber-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                </div>
                Forma de Pagamento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: "pix", icon: QrCode, label: "PIX" },
                  { id: "credit", icon: CreditCard, label: "Crédito" },
                  { id: "debit", icon: CreditCard, label: "Débito" },
                  { id: "transfer", icon: Landmark, label: "Transferência" },
                  { id: "cash", icon: Banknote, label: "Dinheiro" },
                  { id: "invoice", icon: ReceiptText, label: "Faturado" },
                ].map(method => (
                  <div
                    key={method.id}
                    onClick={() => updateForm("paymentMethod", method.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      formData.paymentMethod === method.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <method.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </div>
                ))}
              </div>

              {/* Credit Card Specific Fields */}
              {formData.paymentMethod === "credit" && (
                <div className="mt-4 pt-4 border-t border-amber-500/20 space-y-4">
                  <p className="text-xs text-muted-foreground mb-3">Dados do Cartão de Crédito</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Comprovante de Transação (Controle Interno)</Label>
                      <Input
                        placeholder="Número do comprovante"
                        value={formData.transactionReceipt}
                        onChange={(e) => updateForm("transactionReceipt", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Bandeira</Label>
                      <Select value={formData.cardBrand} onValueChange={(v) => updateForm("cardBrand", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="mastercard">Mastercard</SelectItem>
                          <SelectItem value="amex">American Express</SelectItem>
                          <SelectItem value="elo">Elo</SelectItem>
                          <SelectItem value="hipercard">Hipercard</SelectItem>
                          <SelectItem value="diners">Diners Club</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-2">ID Transação / NSU</Label>
                      <Input
                        placeholder="Número da transação"
                        value={formData.transactionId}
                        onChange={(e) => updateForm("transactionId", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Cód. Autorização</Label>
                      <Input
                        placeholder="Código de autorização"
                        value={formData.authorizationCode}
                        onChange={(e) => updateForm("authorizationCode", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2">ID da Máquina / Terminal</Label>
                      <Input
                        placeholder="Identificação do terminal"
                        value={formData.terminalId}
                        onChange={(e) => updateForm("terminalId", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status do Pagamento */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/10 border border-violet-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20">
                  <Receipt className="h-4 w-4 text-violet-500" />
                </div>
                Status do Pagamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    Status
                  </Label>
                  <Select value={formData.paymentStatus} onValueChange={(v) => updateForm("paymentStatus", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="partial">Parcialmente Pago</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Split className="h-4 w-4 text-muted-foreground" />
                    Parcelas
                  </Label>
                  <Select value={formData.installments} onValueChange={(v) => updateForm("installments", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}x {n === 1 ? "à vista" : `de R$ ${(calculateTotal() / n).toFixed(2)}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Valor Pago
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      className="flex-1"
                      value={formData.paidAmount ? `R$ ${formData.paidAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const numericValue = parseFloat(value) / 100;
                        updateForm("paidAmount", isNaN(numericValue) ? 0 : numericValue);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 whitespace-nowrap"
                      onClick={() => updateForm("paidAmount", calculateTotal())}
                    >
                      Total
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    Desconto
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.discount || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const num = parseFloat(raw) || 0;
                        const isPercent = formData.discountType === "percent";
                        if (isPercent && num > 5 && !discountValidated) {
                          setFormData((prev) => ({ ...prev, discount: num }));
                          setDiscountPasswordModalOpen(true);
                        } else {
                          if (num <= 5 && isPercent) setDiscountValidated(false);
                          updateForm("discount", num);
                        }
                      }}
                      className="flex-1"
                    />
                    <Select value={formData.discountType} onValueChange={(v) => {
                      updateForm("discountType", v);
                      if (v === "fixed" || (v === "percent" && (formData.discount || 0) <= 5)) setDiscountValidated(false);
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="fixed">R$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {formData.discount > 0 && (
                <div className="mt-4">
                  <Label className="mb-2">Motivo do Desconto</Label>
                  <Input
                    placeholder="Ex: Cliente VIP, Promoção sazonal..."
                    value={formData.discountReason}
                    onChange={(e) => updateForm("discountReason", e.target.value)}
                  />
                </div>
              )}

              {/* Payment Status Warning */}
              {formData.paymentStatus === "partial" && formData.paidAmount > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Saldo restante: R$ {(calculateTotal() - formData.paidAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sinal / Depósito */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-green-500/10 border border-emerald-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <Banknote className="h-4 w-4 text-emerald-500" />
                </div>
                Sinal / Depósito
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2">Valor do Sinal</Label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formData.depositAmount ? `R$ ${formData.depositAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const numericValue = parseFloat(value) / 100;
                      updateForm("depositAmount", isNaN(numericValue) ? 0 : numericValue);
                    }}
                  />
                </div>
                <div>
                  <Label className="mb-2">Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.depositDueDate}
                    onChange={(e) => updateForm("depositDueDate", e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 w-full">
                    <Checkbox
                      checked={formData.depositPaid}
                      onCheckedChange={(checked) => updateForm("depositPaid", checked as boolean)}
                    />
                    <Label className="cursor-pointer">Sinal Pago</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota Fiscal - Toggle */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/5 to-pink-500/10 border border-rose-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20">
                    <FileText className="h-4 w-4 text-rose-500" />
                  </div>
                  Requer Nota Fiscal
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">
                    {formData.requiresInvoice ? "Sim" : "Não"}
                  </Label>
                  <div
                    onClick={() => updateForm("requiresInvoice", !formData.requiresInvoice)}
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.requiresInvoice ? "bg-rose-500" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requiresInvoice ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {formData.requiresInvoice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-rose-500/20">
                  <div>
                    <Label className="mb-2">Nome/Razão Social para NF</Label>
                    <Input
                      placeholder="Nome ou razão social"
                      value={formData.billingName}
                      onChange={(e) => updateForm("billingName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">CPF/CNPJ</Label>
                    <Input
                      placeholder="Documento"
                      value={formData.billingDocument}
                      onChange={(e) => updateForm("billingDocument", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2">Endereço para NF</Label>
                    <Input
                      placeholder="Endereço completo"
                      value={formData.billingAddress}
                      onChange={(e) => updateForm("billingAddress", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Observações de Pagamento */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500/5 to-gray-500/10 border border-slate-500/20">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-500/20">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                Observações de Pagamento
              </h3>
              <Textarea
                placeholder="Notas sobre pagamento, acordos especiais..."
                value={formData.paymentNotes}
                onChange={(e) => updateForm("paymentNotes", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "agency":
        return (
          <div className="space-y-6">
            {/* Agency/OTA Section with Toggle */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/5 to-amber-500/10 border border-orange-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Esta reserva é de uma agência/OTA</h3>
                    <p className="text-xs text-muted-foreground">Marque se a reserva veio através de parceiro</p>
                  </div>
                </div>
                <Switch
                  checked={formData.isAgency}
                  onCheckedChange={(checked) => {
                    updateForm("isAgency", checked);
                    if (!checked) setAgencyDataExpanded(false);
                  }}
                />
              </div>
            </div>
            
            {formData.isAgency && (
              <>
                {/* Canal de Venda - canais vindos da API (igual ao modal antigo) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                      <Store className="h-4 w-4 text-blue-500" />
                    </div>
                    Canal de Venda
                  </h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Origem da reserva</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {bookingChannels.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-full">Nenhum canal cadastrado. Verifique a configuração.</p>
                    ) : (
                      bookingChannels.map((channel: { id: number | string; slug: string; name: string; color?: string; commissionValue?: number; defaultCommission?: number; default_commission?: number }) => {
                        const channelIdNum = typeof channel.id === "string" ? Number(channel.id) : channel.id;
                        const isSelected = (formData.channelId != null && formData.channelId === channelIdNum) ||
                          (formData.channelId == null && formData.bookingChannel === channel.slug);
                        const channelCommission = channel.commissionValue ?? channel.defaultCommission ?? (channel as { default_commission?: number }).default_commission;
                        return (
                          <div
                            key={String(channel.id)}
                            onClick={() => {
                              const isAgencyChannel = (channel.slug && (channel.slug === "agency" || channel.slug === "agencia")) ||
                                (channel.name && /ag[eê]ncia/i.test(channel.name));
                              const commissionFromChannel = channelCommission != null && !Number.isNaN(Number(channelCommission))
                                ? String(Math.round(Number(channelCommission)))
                                : undefined;
                              setFormData(prev => ({
                                ...prev,
                                channelId: channelIdNum,
                                bookingChannel: channel.slug,
                                channel: channel.slug,
                                isAgency: isAgencyChannel ? true : prev.isAgency,
                                agencyCommission: commissionFromChannel != null ? commissionFromChannel : "0",
                              }));
                              if (isAgencyChannel) setAgencyDataExpanded(true);
                              else setAgencyDataExpanded(false);
                            }}
                            className={cn(
                              "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                              isSelected ? "border-cyan-500 bg-cyan-50 shadow-lg" : "border-border hover:border-cyan-200 hover:bg-muted/50"
                            )}
                          >
                            <div className={cn("w-4 h-4 rounded-full shadow-sm", channel.color || "bg-slate-300")} />
                            <span className={cn("text-sm font-medium", isSelected ? "text-cyan-900" : "text-foreground")}>
                              {channel.name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Dados da Agência - fechado por padrão; abre ao selecionar Canal Agência ou pelo toggle */}
                <Collapsible open={agencyDataExpanded} onOpenChange={setAgencyDataExpanded}>
                  <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/10 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between p-5 text-left hover:bg-violet-500/5 transition-colors"
                      >
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-violet-500/20">
                            <Building2 className="h-4 w-4 text-violet-500" />
                          </div>
                          Dados da Agência
                        </h4>
                        <ChevronDown
                          className={cn("h-5 w-5 text-violet-500 transition-transform duration-200", agencyDataExpanded && "rotate-180")}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-5 pb-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                            Nome da Agência/OTA
                          </Label>
                          <Input
                            placeholder="Nome da agência"
                            value={formData.agencyName}
                            onChange={(e) => updateForm("agencyName", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                            ID Externo/Código da Reserva
                          </Label>
                          <Input
                            placeholder="Código da reserva na OTA"
                            value={formData.externalId}
                            onChange={(e) => updateForm("externalId", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                            Contato da Agência
                          </Label>
                          <Input
                            placeholder="Telefone ou nome do contato"
                            value={formData.agencyContact}
                            onChange={(e) => updateForm("agencyContact", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                            E-mail da Agência
                          </Label>
                          <Input
                            type="email"
                            placeholder="email@agencia.com"
                            value={formData.agencyEmail}
                            onChange={(e) => updateForm("agencyEmail", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                            Número do Voucher
                          </Label>
                          <Input
                            placeholder="Número do voucher"
                            value={formData.voucherNumber}
                            onChange={(e) => updateForm("voucherNumber", e.target.value)}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Comissionamento */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    Comissionamento
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4 ml-9 uppercase tracking-wide">Valores NET e Comissões</p>

                  {/* Tarifa NET Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-background/80 border border-border mb-4">
                    <span className="font-medium text-foreground">Tarifa NET</span>
                    <Switch
                      checked={formData.isNetRate}
                      onCheckedChange={(checked) => updateForm("isNetRate", checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Side - Inputs */}
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                          Valor NET a Receber
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                          <Input
                            type="text"
                            placeholder="0,00"
                            className="pl-10"
                            value={formData.netRateValue ? formData.netRateValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              const numericValue = parseFloat(value) / 100;
                              updateForm("netRateValue", isNaN(numericValue) ? 0 : numericValue);
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                          Comissão (%)
                        </Label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={formData.agencyCommission}
                          onChange={(e) => updateForm("agencyCommission", e.target.value)}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Vem do canal selecionado ou pode ser alterado manualmente.
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Summary Card: comissão sobre Valor X = Total com desconto − Valor pago (mesmo total da etapa Pagamento) */}
                    <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-slate-600 text-6xl font-bold opacity-30">%</div>
                      <div className="relative space-y-4">
                        {(() => {
                          const roomsToCalculate = formData.selectedRooms.length > 0 ? formData.selectedRooms : formData.roomId ? [formData.roomId] : [];
                          const nights = calculateNights();
                          const hasStepsData = roomsToCalculate.length > 0 && nights > 0;
                          const totalComDesconto = reservationTotalWithDiscount;
                          const rawPaid = formData.paidAmount;
                          const valorPago = typeof rawPaid === "number" ? rawPaid : (parseFloat(String(rawPaid ?? "").replace(",", ".").replace(/\s/g, "")) || 0);
                          const valorX = Math.max(0, totalComDesconto - valorPago);
                          const commissionPct = parseFloat(String(formData.agencyCommission || "0").replace(",", ".")) / 100;
                          const valorComissaoEst = Math.round((valorX * commissionPct) * 100) / 100;
                          const valorLiquidoEst = Math.round(Math.max(0, valorX - valorComissaoEst) * 100) / 100;
                          return (
                            <>
                              {!hasStepsData && (
                                <p className="text-xs text-amber-400/90 mb-2">
                                  Complete as etapas <strong>Unidade</strong> e <strong>Pagamento</strong> (datas, unidade e valores) para ver o resumo da comissão.
                                </p>
                              )}
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Base (restante a receber)</p>
                                <p className="text-lg font-bold text-slate-200">
                                  R$ {valorX.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Comissão Estimada</p>
                                <p className="text-xl font-bold text-rose-400">
                                  R$ {formData.agencyCommission && valorX > 0 ? valorComissaoEst.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Valor Líquido (após comissão)</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                  R$ {formData.agencyCommission && valorX > 0 ? valorLiquidoEst.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : valorX.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500/5 to-gray-500/10 border border-slate-500/20">
                  <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-500/20">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    Observações da Agência
                  </h4>
                  <Textarea
                    placeholder="Notas sobre a agência ou condições especiais..."
                    value={formData.agencyNotes}
                    onChange={(e) => updateForm("agencyNotes", e.target.value)}
                    rows={3}
                    className="bg-background/50"
                  />
                </div>
              </>
            )}
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-6">
            {/* Header - Revisar & Confirmar */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-800 p-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Revisar & Confirmar</h3>
                  <p className="text-sm text-slate-400 mt-1">Verifique os detalhes abaixo antes de finalizar a reserva</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-400 uppercase tracking-wide font-medium">
                    {hasCommissionAplicada ? "Valor Líquido Final (após comissão)" : "Valor Total Final"}
                  </p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">
                    R$ {valorFinalExibido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guest Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">Hóspede</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <IdCard className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Nome:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{formData.guestName || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Telefone:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{formData.guestPhone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">E-mail:</span>
                    <span className="text-sm font-medium text-foreground ml-auto truncate max-w-[150px]">{formData.guestEmail || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Hóspedes:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">
                      {formData.adults} adulto{parseInt(formData.adults) > 1 ? "s" : ""}
                      {parseInt(formData.children) > 0 && `, ${formData.children} criança${parseInt(formData.children) > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stay Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                    <CalendarDays className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">Período</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Check-in:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">
                      {formData.checkIn ? dateLocale.formatDateOnly(formData.checkIn) : "-"} às {formData.checkInTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Check-out:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">
                      {formData.checkOut ? dateLocale.formatDateOnly(formData.checkOut) : "-"} às {formData.checkOutTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Duração:</span>
                    <Badge className="ml-auto bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-0">
                      {calculateNights()} noite{calculateNights() !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Tarifa:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{effectiveRatePlans.find((r: any) => String(r.id) === String(formData.ratePlan))?.name || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Room Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                    <BedDouble className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">Acomodação</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Propriedade:</span>
                    <Badge className="ml-auto bg-violet-500/20 text-violet-700 hover:bg-violet-500/30 border-0">
                      {propertyTypeConfig[formData.propertyType]?.label || "-"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarRange className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Tipo Estadia:</span>
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-0">
                      {stayTypeConfig[formData.stayType]?.label || "-"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Unidade:</span>
                    <Badge className="ml-auto bg-violet-500/20 text-violet-700 hover:bg-violet-500/30 border-0">
                      {currentRooms.find((r: any) => String(r.id) === String(formData.roomId))?.number || "-"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Categoria:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{roomCategoriesByProperty[formData.propertyType]?.find(c => c.id === formData.category)?.name || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-4 w-4 text-violet-500" />
                    <span className="text-sm text-muted-foreground">Camas:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{currentRooms.find((r: any) => String(r.id) === String(formData.roomId))?.beds || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">Pagamento</h4>
                </div>
                <div className="space-y-3">
                  {/* Valores */}
                  <div className="p-3 rounded-xl bg-background/60 border border-emerald-500/20 space-y-2.5 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor total</span>
                      <span className="text-base font-bold text-foreground">
                        R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor pago/Sinal</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {(Number(formData.paidAmount) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(() => {
                      const totalConf = calculateTotal();
                      const pagoConf = Number(formData.paidAmount) || 0;
                      const percentualPago = totalConf > 0 ? Math.min(100, (pagoConf / totalConf) * 100) : 0;
                      return pagoConf > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">% do total</span>
                          <span className="text-xs font-medium text-emerald-600/90 dark:text-emerald-400/90">
                            {percentualPago.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                          </span>
                        </div>
                      ) : null;
                    })()}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Restante a receber</span>
                      <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                        R$ {Math.max(0, calculateTotal() - (Number(formData.paidAmount) || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Banknote className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Método:</span>
                    <span className="text-sm font-medium text-foreground ml-auto capitalize">{formData.paymentMethod || "Não definido"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Receipt className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge className={`ml-auto border-0 ${
                      formData.paymentStatus === "paid" ? "bg-emerald-500/20 text-emerald-700" :
                      formData.paymentStatus === "partial" ? "bg-amber-500/20 text-amber-700" :
                      "bg-rose-500/20 text-rose-700"
                    }`}>
                      {formData.paymentStatus === "paid" ? "Pago" : formData.paymentStatus === "partial" ? "Parcial" : "Pendente"}
                    </Badge>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex items-center gap-3">
                      <Percent className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">Desconto:</span>
                      <span className="text-sm font-medium text-emerald-600 ml-auto">
                        {formData.discountType === "percent" ? `${formData.discount}%` : `R$ ${formData.discount}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">Canal:</span>
                    <span className="text-sm font-medium text-foreground ml-auto">
                      {(() => {
                        const ch = bookingChannels.find((c: { id?: number | string; slug?: string; name?: string }) =>
                          (formData.channelId != null && (Number(c.id) === formData.channelId || c.id === formData.channelId)) || (formData.bookingChannel && c.slug === formData.bookingChannel)
                        );
                        return ch?.name ?? formData.agencyName ?? (formData.bookingChannel === "direct" ? "Direto" : formData.bookingChannel) ?? "—";
                      })()}
                    </span>
                  </div>
                  {/* Comissão: base = Valor X = Valor total (já com desconto) − Valor pago = Restante a receber (mesmo total da etapa Pagamento) */}
                  {(formData.isAgency || (formData.agencyCommission && Number(formData.agencyCommission) > 0)) && (() => {
                    const totalComDesconto = reservationTotalWithDiscount;
                    const rawPaid = formData.paidAmount;
                    const valorPago = typeof rawPaid === "number" ? rawPaid : (parseFloat(String(rawPaid ?? "").replace(",", ".").replace(/\s/g, "")) || 0);
                    const valorX = Math.max(0, totalComDesconto - valorPago);
                    const commissionPct = parseFloat(String(formData.agencyCommission || "0").replace(",", ".")) / 100;
                    const valorComissao = Math.round((valorX * commissionPct) * 100) / 100;
                    const valorLiquidoAposComissao = Math.round(Math.max(0, valorX - valorComissao) * 100) / 100;
                    return (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 mt-3">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Comissão</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Comissão (%):</span>
                          <span className="font-medium text-foreground">{formData.agencyCommission || "0"}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Base (Valor X = Total − Pago):</span>
                          <span className="font-medium text-foreground">R$ {valorX.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {valorX > 0 && formData.agencyCommission && Number(formData.agencyCommission) > 0 && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Valor comissão:</span>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                R$ {valorComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-500/20">
                              <span className="text-muted-foreground">Valor líquido a receber (após comissão):</span>
                              <span className="font-bold text-foreground">
                                R$ {valorLiquidoAposComissao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </>
                        )}
                        {formData.isNetRate && Number(formData.netRateValue) > 0 && (
                          <div className="flex items-center justify-between text-sm pt-1 border-t border-amber-500/20">
                            <span className="text-muted-foreground">Valor NET (informado):</span>
                            <span className="font-semibold text-foreground">
                              R$ {Number(formData.netRateValue).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Extras Summary - boolean flags + extras do banco */}
            {((formData.selectedExtras?.length ?? 0) > 0 || formData.breakfast || formData.parking || formData.airportTransfer || formData.latecheckout || formData.earlyCheckin || formData.petFriendly || formData.spa) && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">Serviços Extras</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedExtras?.map((extra) => (
                    <Badge key={extra.extraId ?? extra.id ?? extra.name} className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Sparkles className="h-3.5 w-3.5" /> {extra.name}
                      {Number(extra.price) > 0 && <span className="opacity-80"> · R$ {Number(extra.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                    </Badge>
                  ))}
                  {formData.breakfast && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Coffee className="h-3.5 w-3.5" /> Café da Manhã
                    </Badge>
                  )}
                  {formData.parking && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Car className="h-3.5 w-3.5" /> Estacionamento
                    </Badge>
                  )}
                  {formData.airportTransfer && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Plane className="h-3.5 w-3.5" /> Transfer
                    </Badge>
                  )}
                  {formData.earlyCheckin && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Clock className="h-3.5 w-3.5" /> Early Check-in
                    </Badge>
                  )}
                  {formData.latecheckout && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Clock className="h-3.5 w-3.5" /> Late Check-out
                    </Badge>
                  )}
                  {formData.petFriendly && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Heart className="h-3.5 w-3.5" /> Pet Friendly
                    </Badge>
                  )}
                  {formData.spa && (
                    <Badge className="bg-rose-500/20 text-rose-700 hover:bg-rose-500/30 border-0 gap-1.5 py-1.5 px-3">
                      <Sparkles className="h-3.5 w-3.5" /> Spa
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Total */}
            <div className="md:hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                  <span className="font-medium text-foreground">Total da Estadia</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Status Selection */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-500/5 to-slate-600/10 border border-slate-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-md">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">Status da Reserva</h4>
              </div>
              <RadioGroup
                value={formData.reservationStatus}
                onValueChange={(v) => updateForm("reservationStatus", v)}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {[
                  { id: "confirmed", label: "Confirmada", icon: <CheckCircle2 className="h-4 w-4" />, color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-700" },
                  { id: "pending", label: "Pendente", icon: <Clock className="h-4 w-4" />, color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-700" },
                  { id: "tentative", label: "Tentativa", icon: <AlertCircle className="h-4 w-4" />, color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-700" },
                  { id: "cancelled", label: "Cancelada", icon: <Ban className="h-4 w-4" />, color: "from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-700" },
                ].map(status => {
                  const radioId = `reservation-status-${status.id}`;
                  const isSelected = formData.reservationStatus === status.id;
                  const textColorClass = isSelected ? (status.color.split(" ").pop() ?? "text-foreground") : "text-muted-foreground";
                  const labelColorClass = isSelected ? (status.color.split(" ").pop() ?? "text-foreground") : "text-foreground";
                  return (
                    <Label
                      key={status.id}
                      htmlFor={radioId}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none",
                        isSelected ? `bg-gradient-to-br ${status.color} shadow-sm` : "bg-muted/30 border-border hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={status.id} id={radioId} className="sr-only" aria-label={status.label} />
                      <span className={textColorClass}>{status.icon}</span>
                      <span className={cn("text-sm font-medium", labelColorClass)}>{status.label}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Notifications */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-sky-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-md">
                  <Send className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">Notificações ao Hóspede</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.sendEmailConfirmation 
                      ? "bg-cyan-500/20 border-cyan-500/30" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updateForm("sendEmailConfirmation", !formData.sendEmailConfirmation)}
                >
                  <Checkbox
                    checked={formData.sendEmailConfirmation}
                    onCheckedChange={(checked) => updateForm("sendEmailConfirmation", checked as boolean)}
                  />
                  <Mail className={`h-4 w-4 ${formData.sendEmailConfirmation ? "text-cyan-600" : "text-muted-foreground"}`} />
                  <Label className="cursor-pointer text-sm font-medium">E-mail</Label>
                </div>
                
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.sendWhatsAppConfirmation 
                      ? "bg-cyan-500/20 border-cyan-500/30" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updateForm("sendWhatsAppConfirmation", !formData.sendWhatsAppConfirmation)}
                >
                  <Checkbox
                    checked={formData.sendWhatsAppConfirmation}
                    onCheckedChange={(checked) => updateForm("sendWhatsAppConfirmation", checked as boolean)}
                  />
                  <MessageSquare className={`h-4 w-4 ${formData.sendWhatsAppConfirmation ? "text-cyan-600" : "text-muted-foreground"}`} />
                  <Label className="cursor-pointer text-sm font-medium">WhatsApp</Label>
                </div>

                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.printConfirmation 
                      ? "bg-cyan-500/20 border-cyan-500/30" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updateForm("printConfirmation", !formData.printConfirmation)}
                >
                  <Checkbox
                    checked={formData.printConfirmation}
                    onCheckedChange={(checked) => updateForm("printConfirmation", checked as boolean)}
                  />
                  <Printer className={`h-4 w-4 ${formData.printConfirmation ? "text-cyan-600" : "text-muted-foreground"}`} />
                  <Label className="cursor-pointer text-sm font-medium">Imprimir</Label>
                </div>
              </div>
            </div>

            {/* Terms & Consents */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
                  <FileCheck className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-semibold text-foreground">Termos e Consentimentos</h4>
              </div>
              <div className="space-y-3">
                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.agreedToTerms 
                      ? "bg-indigo-500/20 border-indigo-500/30" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updateForm("agreedToTerms", !formData.agreedToTerms)}
                >
                  <Checkbox
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => updateForm("agreedToTerms", checked as boolean)}
                  />
                  <Label className="cursor-pointer text-sm flex-1">
                    Hóspede concordou com os <span className="text-indigo-600 underline font-medium">Termos e Condições</span>
                  </Label>
                </div>

                <div 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.marketingOptIn 
                      ? "bg-indigo-500/20 border-indigo-500/30" 
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                  onClick={() => updateForm("marketingOptIn", !formData.marketingOptIn)}
                >
                  <Checkbox
                    checked={formData.marketingOptIn}
                    onCheckedChange={(checked) => updateForm("marketingOptIn", checked as boolean)}
                  />
                  <Label className="cursor-pointer text-sm flex-1">
                    Aceita receber comunicações de marketing e promoções
                  </Label>
                </div>
              </div>
            </div>

            {/* Operator & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Operador Responsável
                </Label>
                <Input
                  placeholder="Nome do atendente"
                  value={formData.operatorName}
                  onChange={(e) => updateForm("operatorName", e.target.value)}
                  className="bg-muted/30"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Observações Finais
                </Label>
                <Input
                  placeholder="Observações adicionais..."
                  value={formData.confirmationNotes}
                  onChange={(e) => updateForm("confirmationNotes", e.target.value)}
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-h-[95vh] p-0 gap-0 overflow-hidden bg-gradient-to-b from-background to-muted/20",
          showSuccess ? "max-w-5xl w-[min(96vw,56rem)]" : "max-w-6xl"
        )}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {showSuccess ? (
          (() => {
            const selectedRoom = currentRooms.find((r: any) => String(r.id) === String(formData.roomId));
            const selectedCategory = currentCategories.find((c: any) => String(c.id) === String(formData.category));
            const selectedRatePlan = effectiveRatePlans.find((r: any) => String(r.id) === String(formData.ratePlan));
            const roomPropertyId = selectedRoom?.propertyId ?? (selectedRoom as any)?.property_id;
            const propertyName = dbProperties.find((p: any) => String(p.id) === String(roomPropertyId))?.name;
            const nights = calculateNights();
            const total = calculateTotal();
            const hasNotifications =
              (formData.sendEmailConfirmation && formData.guestEmail) ||
              (formData.sendWhatsAppConfirmation && formData.guestPhone);
            const paymentLabel =
              formData.paymentStatus === "pending"
                ? "Pendente"
                : formData.paymentStatus === "partial"
                  ? "Parcial"
                  : "Pago";
            const paymentMethodLabel =
              (
                {
                  pix: "PIX",
                  credit: "Crédito",
                  debit: "Débito",
                  transfer: "Transferência",
                  cash: "Dinheiro",
                  invoice: "Faturado",
                } as Record<string, string>
              )[formData.paymentMethod] ?? formData.paymentMethod;

            return (
              <div className="flex flex-col max-h-[90vh] animate-fade-in">
                <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-6 py-5 sm:px-8">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                  />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h2 className="text-xl font-bold text-white sm:text-2xl">
                        {mode === "edit" ? "Reserva Atualizada!" : "Reserva Confirmada!"}
                      </h2>
                      <p className="text-sm text-white/85">
                        A reserva foi {mode === "edit" ? "atualizada" : "registrada"} com sucesso no sistema
                      </p>
                    </div>
                    <Badge className="hidden shrink-0 border-white/30 bg-white/15 text-white sm:inline-flex">
                      {nights} noite{nights !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
                    <div className="space-y-4 lg:col-span-4">
                      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Protocolo da reserva
                        </p>
                        <div className="mt-2 flex items-start gap-2">
                          <span className="break-all font-mono text-lg font-bold leading-tight text-primary sm:text-xl">
                            {protocolNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={copyProtocol}
                            className="shrink-0 hover:bg-primary/10"
                            title="Copiar protocolo"
                          >
                            <Copy className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Registrado em {confirmationTime}</span>
                        </div>
                      </div>

                      {hasNotifications && (
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Confirmações enviadas
                          </p>
                          <div className="space-y-2">
                            {formData.sendEmailConfirmation && formData.guestEmail && (
                              <div className="flex items-center gap-3 rounded-xl bg-blue-500/8 px-3 py-2.5 ring-1 ring-blue-500/15">
                                <div className="rounded-lg bg-blue-500/15 p-2">
                                  <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">E-mail</p>
                                  <p className="truncate text-xs text-muted-foreground">{formData.guestEmail}</p>
                                </div>
                                <Check className="h-4 w-4 shrink-0 text-blue-600" />
                              </div>
                            )}
                            {formData.sendWhatsAppConfirmation && formData.guestPhone && (
                              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/8 px-3 py-2.5 ring-1 ring-emerald-500/15">
                                <div className="rounded-lg bg-emerald-500/15 p-2">
                                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">WhatsApp</p>
                                  <p className="truncate text-xs text-muted-foreground">{formData.guestPhone}</p>
                                </div>
                                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <Button variant="outline" className="gap-2" onClick={() => setSummaryModalOpen(true)}>
                          <Printer className="h-4 w-4" />
                          Imprimir Voucher
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Send className="h-4 w-4" />
                          Reenviar
                        </Button>
                      </div>
                    </div>

                    <div className="lg:col-span-8">
                      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <div className="border-b border-border bg-muted/30 px-5 py-3">
                          <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-primary" />
                            Resumo da estadia
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                          <div className="px-5 py-4">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Check-in
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {formData.checkIn ? dateLocale.formatDateOnly(formData.checkIn) : "—"}
                            </p>
                            <p className="text-sm text-muted-foreground">às {formData.checkInTime}</p>
                          </div>
                          <div className="flex flex-col items-center justify-center bg-primary/5 px-5 py-4 text-center">
                            <CalendarRange className="mb-1 h-5 w-5 text-primary" />
                            <p className="text-2xl font-bold text-primary">{nights}</p>
                            <p className="text-xs text-muted-foreground">
                              noite{nights !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="px-5 py-4 sm:text-right">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-rose-600 sm:justify-end">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Check-out
                            </p>
                            <p className="text-base font-semibold text-foreground">
                              {formData.checkOut ? dateLocale.formatDateOnly(formData.checkOut) : "—"}
                            </p>
                            <p className="text-sm text-muted-foreground">às {formData.checkOutTime}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 border-t border-border p-5 sm:grid-cols-2">
                          <div className="rounded-xl bg-muted/35 p-3.5">
                            <div className="mb-1.5 flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="text-xs text-muted-foreground">Hóspede</span>
                            </div>
                            <p className="font-semibold leading-snug text-foreground">
                              {formData.guestName || "—"}
                            </p>
                            {formData.guestEmail && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">{formData.guestEmail}</p>
                            )}
                          </div>
                          <div className="rounded-xl bg-muted/35 p-3.5">
                            <div className="mb-1.5 flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-violet-500" />
                              <span className="text-xs text-muted-foreground">Acomodação</span>
                            </div>
                            <p className="font-semibold leading-snug text-foreground">
                              {selectedRoom?.number ? `Quarto ${selectedRoom.number}` : "—"}
                              {selectedCategory?.name ? ` · ${selectedCategory.name}` : ""}
                            </p>
                            {propertyName && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">{propertyName}</p>
                            )}
                          </div>
                          <div className="rounded-xl bg-muted/35 p-3.5">
                            <div className="mb-1.5 flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ocupação</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {formData.adults} adulto{parseInt(String(formData.adults)) !== 1 ? "s" : ""}
                              {parseInt(formData.children) > 0 &&
                                ` · ${formData.children} criança${parseInt(formData.children) !== 1 ? "s" : ""}`}
                              {parseInt(formData.infants) > 0 &&
                                ` · ${formData.infants} bebê${parseInt(formData.infants) !== 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <div className="rounded-xl bg-muted/35 p-3.5">
                            <div className="mb-1.5 flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Tarifa</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {selectedRatePlan?.name || "—"}
                            </p>
                            {formData.paymentMethod && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Pagamento: {paymentMethodLabel}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-amber-500/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-amber-500/15 p-2.5">
                              <DollarSign className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Valor total da reserva</p>
                              <p className="text-2xl font-bold text-foreground">
                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <Badge className="w-fit border-amber-500/25 bg-amber-500/15 text-amber-800 capitalize">
                            {paymentLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button variant="outline" onClick={handleClose} className="sm:min-w-[140px]">
                      Fechar
                    </Button>
                    {mode === "create" && (
                      <Button
                        onClick={handleCreateAnother}
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80 sm:min-w-[180px]"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Nova Reserva
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* Normal Form */
          <>
            {/* Modern Header with Gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
              <DialogHeader className="relative p-6 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${mode === "edit" ? "from-amber-500 to-orange-600" : "from-primary to-primary/80"} shadow-lg`}>
                      {mode === "edit" ? <Pencil className="h-6 w-6 text-white" /> : <CalendarDays className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-foreground">
                        {mode === "edit" ? "Editar Reserva" : "Nova Reserva"}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mode === "edit" && initialData?.id ? `Código: #${initialData.id}` : "Preencha os dados para criar uma nova reserva"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Modern Tab Navigation */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.id;
                    const isPast = tabs.findIndex(t => t.id === activeTab) > index;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`relative p-3 rounded-xl transition-all duration-300 text-left group ${
                          isActive 
                            ? "bg-card shadow-lg border-2 border-primary scale-[1.02]" 
                            : isPast
                              ? "bg-success/10 border border-success/30 hover:bg-success/20"
                              : "bg-card/50 border border-border/50 hover:bg-card hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded-lg transition-all ${
                            isActive 
                              ? `bg-gradient-to-br ${tab.color} text-white shadow-md` 
                              : isPast
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}>
                            {isPast && !isActive ? <CheckCircle2 className="h-4 w-4" /> : tab.icon}
                          </div>
                          <span className={`text-xs font-bold ${
                            isActive ? "text-primary" : isPast ? "text-success" : "text-muted-foreground"
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold truncate ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {tab.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                          {tab.description}
                        </p>
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </DialogHeader>
            </div>
            
            <ScrollArea ref={scrollAreaRef} className="flex-1 max-h-[calc(95vh-320px)]">
              <div className="p-6">
                {renderTabContent()}
              </div>
            </ScrollArea>
            
            {/* Modern Footer */}
            <div className="p-4 border-t border-border bg-gradient-to-r from-muted/50 via-background to-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  {activeTab !== "info" && (
                    <Button variant="ghost" onClick={goToPrevTab} className="gap-2 hover:bg-muted">
                      <ChevronLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {/* Central financeira: Total da reserva (com desconto) − Valor pago = Restante a pagar */}
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {hasCommissionAplicada ? "Líquido (após comissão):" : "Total:"}
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      R$ {valorFinalExibido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <Button variant="outline" onClick={handleClose} className="px-6">
                    Cancelar
                  </Button>
                  
                  {activeTab === "confirmation" ? (
                    <Button 
                      variant="gradient" 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2 px-6 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? "Salvando..." : (mode === "edit" ? "Salvar Alterações" : "Confirmar Reserva")}
                    </Button>
                  ) : (
                    <Button 
                      onClick={goToNextTab} 
                      className="gap-2 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>

      <NewGuestModal 
        open={newGuestModalOpen} 
        onOpenChange={setNewGuestModalOpen}
        onSuccess={handleQuickGuestCreated}
      />

      <QuickGuestModal 
        open={quickGuestModalOpen} 
        onOpenChange={setQuickGuestModalOpen}
        onGuestCreated={handleQuickGuestCreated}
      />

      <AccompanyingGuestsModal
        open={accompanyingGuestsModalOpen}
        onOpenChange={setAccompanyingGuestsModalOpen}
        guests={formData.accompanyingGuests || []}
        onUpdateGuests={(guests) => setFormData((prev) => ({ ...prev, accompanyingGuests: guests }))}
      />

      <SplitPaymentModal 
        open={splitPaymentModalOpen} 
        onOpenChange={setSplitPaymentModalOpen}
        totalAmount={calculateTotal()}
        bookingDetails={{
          unitName: currentCategories.find((c: any) => String(c.id) === String(formData.category))?.name ?? "Unidade",
          checkIn: formData.checkIn ?? "",
          checkOut: formData.checkOut ?? "",
          protocol: "NOVO",
          nights: calculateNights(),
        }}
        onConfirm={(payers) => {
          const total = calculateTotal();
          setFormData((prev) => ({
            ...prev,
            splitPaymentDetails: {
              enabled: true,
              splits: payers.map((p) => ({
                guestName: p.name,
                amount: p.amount,
                method: "Divisão",
                status: p.paid ? "paid" : "pending",
              })),
            },
          }));
        }}
      />

      <GuestHistoryModal 
        open={guestHistoryModalOpen} 
        onOpenChange={setGuestHistoryModalOpen}
        guestName={formData.guestName}
        guestEmail={formData.guestEmail}
        guestPhone={formData.guestPhone}
        loyaltyTier={formData.guestLoyaltyTier}
        totalStays={formData.guestTotalStays}
      />

      <ReservationSummaryModal
        open={summaryModalOpen}
        onOpenChange={(open) => {
          setSummaryModalOpen(open);
          if (!open) setSummaryData(null);
        }}
        reservation={summaryData}
      />

      {/* Modal de validação de senha para desconto acima de 5% */}
      <Dialog
        open={discountPasswordModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (!discountValidated) {
              setFormData((prev) => ({ ...prev, discount: 5 }));
              toast.info("Desconto limitado a 5% sem validação.");
            }
            setDiscountPasswordInput("");
          }
          setDiscountPasswordModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Validação de desconto
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Descontos acima de 5% exigem senha de autorização.
          </p>
          <div className="space-y-2">
            <Label htmlFor="discount-password">Senha</Label>
            <Input
              id="discount-password"
              type="password"
              placeholder="Digite a senha"
              value={discountPasswordInput}
              onChange={(e) => setDiscountPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleValidateDiscountPassword();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormData((prev) => ({ ...prev, discount: 5 }));
                setDiscountPasswordInput("");
                setDiscountPasswordModalOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleValidateDiscountPassword()}
              disabled={isValidatingDiscountPassword}
            >
              <Check className="h-4 w-4 mr-1" />
              {isValidatingDiscountPassword ? "Validando..." : "Validar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}