import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  CalendarDays,
  Users,
  CreditCard,
  Check,
  Wifi,
  Star,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Bed,
  Maximize,
  Heart,
  Shield,
  Hotel,
  Building,
  TreePine,
  CalendarRange,
  Sparkles,
  Coffee,
  Car,
  Waves,
  AirVent,
  Tv,
  UtensilsCrossed,
  Dumbbell,
  Bath,
  Mountain,
  Palmtree,
  Home,
  Building2,
  X,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Search,
  Minus,
  Plus,
  Globe,
  Plane,
  Sun,
  Camera,
  Compass,
  SlidersHorizontal,
  Filter,
  QrCode,
  Banknote,
  Landmark,
  Wallet,
  Receipt,
  Loader2,
  Layers,
  Copy
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGuestAuth } from "@/contexts/GuestAuthContext";

// Types
type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";
type AccommodationType = "quarto" | "apartamento" | "suite" | "casa" | "chalé";
type StayType = "daily" | "weekly" | "monthly" | "longstay";
type CategoryType = "standard" | "superior" | "deluxe" | "suite" | "premium" | "executive" | "family" | "penthouse";

// Step type
type BookingStep = "search" | "results" | "guest" | "payment" | "confirmation";

// Configurations
const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; gradient: string; description: string; image: string }> = {
  hotel: {
    label: "Hotel",
    icon: Hotel,
    gradient: "from-blue-600 to-cyan-500",
    description: "Quartos com serviço completo e comodidades premium",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"
  },
  "apart-hotel": {
    label: "Apart-Hotel",
    icon: Building,
    gradient: "from-purple-600 to-pink-500",
    description: "Apartamentos equipados com serviços de hotel",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"
  },
  loft: {
    label: "Loft",
    icon: Building2,
    gradient: "from-amber-500 to-orange-500",
    description: "Espaços modernos com design contemporâneo",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600"
  },
  temporada: {
    label: "Temporada",
    icon: TreePine,
    gradient: "from-emerald-500 to-teal-500",
    description: "Imóveis para aluguel de curta e longa temporada",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600"
  }
};

const accommodationTypeConfig: Record<AccommodationType, { label: string; icon: typeof Bed; description: string }> = {
  quarto: { label: "Quarto", icon: Bed, description: "Quarto individual ou duplo" },
  apartamento: { label: "Apartamento", icon: Building, description: "Apartamento completo" },
  suite: { label: "Suíte", icon: Sparkles, description: "Suíte de luxo" },
  casa: { label: "Casa", icon: Home, description: "Casa completa" },
  chalé: { label: "Chalé", icon: TreePine, description: "Chalé aconchegante" }
};

const stayTypeConfig: Record<StayType, { label: string; description: string; minNights: number; discount: string; gradient: string }> = {
  daily: {
    label: "Diária",
    description: "Reserva por noite",
    minNights: 1,
    discount: "",
    gradient: "from-blue-500 to-blue-600"
  },
  weekly: {
    label: "Semanal",
    description: "Mínimo 7 noites",
    minNights: 7,
    discount: "-10%",
    gradient: "from-purple-500 to-purple-600"
  },
  monthly: {
    label: "Mensal",
    description: "Mínimo 30 noites",
    minNights: 30,
    discount: "-20%",
    gradient: "from-amber-500 to-amber-600"
  },
  longstay: {
    label: "Long Stay",
    description: "Mínimo 90 dias",
    minNights: 90,
    discount: "-30%",
    gradient: "from-emerald-500 to-emerald-600"
  }
};

const categoryConfig: Record<CategoryType, { label: string; icon: typeof Home; gradient: string; description: string; features: string[] }> = {
  standard: {
    label: "Standard",
    icon: Home,
    gradient: "from-slate-500 to-slate-600",
    description: "Conforto essencial para sua estadia",
    features: ["Wi-Fi", "TV", "Ar Condicionado"]
  },
  superior: {
    label: "Superior",
    icon: Building2,
    gradient: "from-blue-500 to-blue-600",
    description: "Mais espaço e comodidades extras",
    features: ["Wi-Fi", "TV 50\"", "Frigobar", "Vista"]
  },
  deluxe: {
    label: "Deluxe",
    icon: Star,
    gradient: "from-purple-500 to-purple-600",
    description: "Luxo e sofisticação em cada detalhe",
    features: ["Wi-Fi Premium", "TV 55\"", "Varanda", "Banheira"]
  },
  suite: {
    label: "Suíte",
    icon: Sparkles,
    gradient: "from-amber-500 to-amber-600",
    description: "Ampla com área de estar separada",
    features: ["Living Room", "Jacuzzi", "Vista Mar", "Mordomo"]
  },
  premium: {
    label: "Premium",
    icon: Mountain,
    gradient: "from-cyan-500 to-cyan-600",
    description: "Vista panorâmica exclusiva",
    features: ["Vista 360°", "Terraço", "Jacuzzi", "Cozinha"]
  },
  executive: {
    label: "Executivo",
    icon: Building,
    gradient: "from-indigo-500 to-indigo-600",
    description: "Ideal para viagens de negócios",
    features: ["Office", "Wi-Fi Premium", "Lounge", "Meeting Room"]
  },
  family: {
    label: "Família",
    icon: Users,
    gradient: "from-green-500 to-green-600",
    description: "Espaçoso para toda a família",
    features: ["2+ Quartos", "Cozinha", "Área Kids", "Lavanderia"]
  },
  penthouse: {
    label: "Penthouse",
    icon: Palmtree,
    gradient: "from-rose-500 to-rose-600",
    description: "O máximo em exclusividade",
    features: ["Piscina Privativa", "Chef", "Spa", "Heliponto"]
  }
};

import { api } from "@/lib/api";

const BOOKING_ENGINE_DRAFT_KEY = "booking_engine_draft";
const GUEST_POST_LOGIN_REDIRECT_KEY = "guest_post_login_redirect";

type CategoryResult = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  size: number;
  beds: string;
  amenities: string[];
  rating: number;
  reviews: number;
  prices: {
    daily: number;
    weekly: number;
    monthly: number;
    longstay: number;
    originalPrice: number;
  };
  available: boolean;
  originalPrice: number;
  propertyName: string;
  propertyType: PropertyType;
  city: string;
  neighborhood: string;
  unitId: number;
  remainingUnits: number;
  imageUrl: string;
  taxRate?: number;
  serviceFee?: number;
  units: {
    id: number;
    number: string;
    floor: number;
    view: string;
    amenities: string[];
  }[];
};

export default function BookingEngine() {
  const { toast } = useToast();
  const { guestUser, isAuthenticated: isGuestAuthenticated, login } = useGuestAuth();

  // Booking flow state
  const [step, setStep] = useState<BookingStep>("search");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Data state
  const [isLoading, setIsLoading] = useState(false);
  const [availableResults, setAvailableResults] = useState<CategoryResult[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);

  // Selection state
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState<AccommodationType | null>(null);
  const [selectedStayType, setSelectedStayType] = useState<StayType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Changed to ID
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [completeReservationData, setCompleteReservationData] = useState<any[]>([]);

  // Guest info
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    country: "Brasil"
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<any | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // UI state
  const [showUnitModal, setShowUnitModal] = useState<number | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixGenerating, setPixGenerating] = useState(false);
  const [pixPaymentConfirmed, setPixPaymentConfirmed] = useState(false);
  const [pixChargeData, setPixChargeData] = useState<{
    provider: string;
    txid: string;
    brCode: string;
    amount: number;
    description: string;
  } | null>(null);
  const [authWizardOpen, setAuthWizardOpen] = useState(false);
  const [authWizardTab, setAuthWizardTab] = useState<"login" | "register">("login");
  const [authWizardLoading, setAuthWizardLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentNumber: "",
    password: "",
    confirmPassword: "",
  });

  // System Settings
  const [hotelName, setHotelName] = useState("Unistays");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.getGeneralSettings();
        if (response.success && response.data) {
          if (response.data.hotelName) setHotelName(response.data.hotelName);
          if (response.data.logoUrl) setLogoUrl(response.data.logoUrl);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Restore booking draft if user was redirected for guest login
  useEffect(() => {
    const rawDraft = sessionStorage.getItem(BOOKING_ENGINE_DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      if (draft.step) setStep(draft.step);
      if (draft.selectedRegion) setSelectedRegion(draft.selectedRegion);
      if (typeof draft.adults === "number") setAdults(draft.adults);
      if (typeof draft.children === "number") setChildren(draft.children);
      if (draft.checkIn) setCheckIn(new Date(draft.checkIn));
      if (draft.checkOut) setCheckOut(new Date(draft.checkOut));
      if (Array.isArray(draft.availableResults)) setAvailableResults(draft.availableResults);
      if (Array.isArray(draft.selectedUnits)) setSelectedUnits(draft.selectedUnits);
      if (typeof draft.selectedCategory === "number" || draft.selectedCategory === null) setSelectedCategory(draft.selectedCategory);
      if (draft.selectedPropertyType) setSelectedPropertyType(draft.selectedPropertyType);
      if (draft.selectedAccommodationType) setSelectedAccommodationType(draft.selectedAccommodationType);
      if (draft.selectedStayType) setSelectedStayType(draft.selectedStayType);
      if (typeof draft.selectedPaymentMethodId === "number" || draft.selectedPaymentMethodId === null) {
        setSelectedPaymentMethodId(draft.selectedPaymentMethodId);
      }
      if (draft.guestInfo) setGuestInfo(draft.guestInfo);
      if (draft.couponCode) setCouponCode(draft.couponCode);
      if (draft.appliedPromotion) setAppliedPromotion(draft.appliedPromotion);
    } catch (error) {
      console.error("Failed to restore booking draft", error);
    } finally {
      sessionStorage.removeItem(BOOKING_ENGINE_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isGuestAuthenticated || !guestUser) return;

    const fullName = guestUser.name || `${guestUser.firstName || ""} ${guestUser.lastName || ""}`.trim();
    const cleanDocument = (guestUser.documentNumber || "").replace(/\D/g, "");

    setGuestInfo((prev) => ({
      ...prev,
      name: prev.name || fullName,
      email: prev.email || guestUser.email || "",
      phone: prev.phone || (guestUser.phone || ""),
      document: prev.document || (cleanDocument ? maskCPF(cleanDocument) : ""),
    }));
  }, [isGuestAuthenticated, guestUser]);

  // After guest auth, close wizard and continue checkout flow.
  useEffect(() => {
    if (!isGuestAuthenticated) return;
    setAuthWizardOpen(false);
    setStep("payment");
  }, [isGuestAuthenticated]);

  // Fetch initial booking data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [regionsRes, paymentsRes] = await Promise.all([
          api.getRegions(),
          api.getPaymentMethods()
        ]);

        if (regionsRes.success && regionsRes.data) {
          setAvailableRegions(regionsRes.data.regions);
        }

        if (paymentsRes.success && paymentsRes.data) {
          setPaymentMethods(paymentsRes.data.paymentMethods || []);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      }
    };
    fetchInitialData();
  }, []);

  // Computed values
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalGuests = adults + children;

  // Filter available results based on selections
  const filteredCategories = availableResults.filter(category => {
    if (selectedPropertyType && category.propertyType !== selectedPropertyType) return false;
    return true;
  });

  // Get available categories IDs from results
  const availableCategoriesIds = availableResults.map(c => c.id);

  // Get available property types from the results (for Step 2 filtering)
  const availablePropertyTypes = Array.from(new Set(availableResults.map(r => r.propertyType)));

  // Flattened units from available categories
  const filteredUnits = availableResults
    .filter(cat => !selectedCategory || cat.id === selectedCategory)
    .flatMap(cat => cat.units.map(u => ({
      ...u,
      categoryName: cat.name,
      price: cat.prices[selectedStayType || 'daily'] || cat.prices.daily,
      image: cat.imageUrl,
      rating: cat.rating,
      capacity: cat.capacity,
      size: cat.size,
      beds: cat.beds,
      categoryId: cat.id,
      city: cat.city,
      neighborhood: cat.neighborhood,
      propertyType: cat.propertyType,
      images: Array.isArray((u as any).images)
        ? (u as any).images
        : (Array.isArray((u as any).imageUrls) ? (u as any).imageUrls : []),
    })));

  const openUnitGallery = (unit: any) => {
    const fallback = unit.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600";
    const images = [fallback, ...(unit.images || [])]
      .filter((img: string, idx: number, arr: string[]) => !!img && arr.indexOf(img) === idx);
    setGalleryImages(images.length ? images : [fallback]);
    setGalleryIndex(0);
    setGalleryOpen(true);
  };

  const goPrevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  // Get available accommodation types based on property type
  // This might need to be inferred or hardcoded if not in DB
  const availableAccommodationTypes = Object.keys(accommodationTypeConfig) as AccommodationType[];

  // Calculate total
  const calculateTotal = () => {
    let subtotal = 0;
    const selectedUnitIds = selectedUnits;

    selectedUnitIds.forEach(unitId => {
      const category = availableResults.find(c => c.units.some(u => u.id === unitId));
      if (category && selectedStayType) {
        let price = category.prices[selectedStayType] || category.prices.daily;
        subtotal += price * nights;
      } else if (category) {
        subtotal += category.prices.daily * nights;
      }
    });

    let discount = 0;
    if (appliedPromotion) {
      if (appliedPromotion.discountPercentage) {
        discount = subtotal * (Number(appliedPromotion.discountPercentage) / 100);
      } else if (appliedPromotion.discountValue) {
        discount = Number(appliedPromotion.discountValue);
      }
    }

    // Find selected category to get tax/fee rates
    const category = availableResults.find(c => c.id === selectedCategory);
    const taxRate = category?.taxRate ?? 5;
    const serviceFeeRate = category?.serviceFee ?? 0;

    const taxes = subtotal * (taxRate / 100);
    const serviceFees = subtotal * (serviceFeeRate / 100);

    return {
      subtotal,
      discount,
      taxes,
      serviceFees,
      total: Math.max(0, subtotal - discount + taxes + serviceFees)
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setIsApplyingCoupon(true);
      const response = await api.getPromotions(couponCode.trim());

      if (response.success && response.data?.promotions?.length > 0) {
        const promo = response.data.promotions.find((p: any) => p.code.toUpperCase() === couponCode.trim().toUpperCase());

        if (promo) {
          if (promo.status !== "active") {
            toast({ title: "Cupom inválido", description: "Este cupom não está ativo.", variant: "destructive" });
            return;
          }

          const today = new Date();
          const validFrom = promo.validFrom ? new Date(promo.validFrom) : null;
          const validTo = promo.validTo ? new Date(promo.validTo) : null;

          if ((validFrom && today < validFrom) || (validTo && today > validTo)) {
            toast({ title: "Cupom expirado", description: "Este coupon não é válido para esta data.", variant: "destructive" });
            return;
          }

          setAppliedPromotion(promo);
          toast({ title: "Cupom aplicado!", description: `Desconto de ${promo.discountPercentage ? promo.discountPercentage + '%' : 'R$ ' + promo.discountValue} aplicado.` });
        } else {
          toast({ title: "Cupom não encontrado", description: "Verifique o código digitado.", variant: "destructive" });
        }
      } else {
        toast({ title: "Cupom não encontrado", description: "Verifique o código digitado.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao aplicar cupom", description: "Ocorreu um erro técnico.", variant: "destructive" });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Datas obrigatórias",
        description: "Por favor, selecione as datas de check-in e check-out",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.checkBookingAvailability({
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: totalGuests,
        region: selectedRegion || undefined,
        // stayType: selectedStayType || 'daily' // We can pass this if known, or handle prices in frontend
      });

      if (response.success && response.data) {
        const units = response.data.units as unknown as CategoryResult[];
        if (units.length === 0) {
          toast({
            title: "Nenhuma disponibilidade",
            description: `Não encontramos propriedades disponíveis em "${selectedRegion || 'qualquer região'}" para ${totalGuests} hóspedes nestas datas.`,
            variant: "destructive"
          });
          return;
        }
        setAvailableResults(units);
        setStep("results");
        setSelectedStayType("daily"); // Default
      } else {
        toast({
          title: "Erro ao buscar",
          description: "Não foi possível buscar disponibilidade",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar disponibilidade",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Navigation
  const goBack = () => {
    const steps: BookingStep[] = ["search", "results", "guest", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const maskPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const maskCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const goNext = () => {
    const steps: BookingStep[] = ["search", "results", "guest", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const persistBookingDraft = (options?: { resumeStep?: BookingStep }) => {
    const draft = {
      step: options?.resumeStep || step,
      selectedRegion,
      adults,
      children,
      checkIn: checkIn ? checkIn.toISOString() : null,
      checkOut: checkOut ? checkOut.toISOString() : null,
      availableResults,
      selectedUnits,
      selectedCategory,
      selectedPropertyType,
      selectedAccommodationType,
      selectedStayType,
      selectedPaymentMethodId,
      guestInfo,
      couponCode,
      appliedPromotion,
    };

    sessionStorage.setItem(BOOKING_ENGINE_DRAFT_KEY, JSON.stringify(draft));
  };

  const requireGuestLoginForPayment = () => {
    if (isGuestAuthenticated) {
      setStep("payment");
      return;
    }

    persistBookingDraft({ resumeStep: "payment" });
    setAuthWizardOpen(true);
  };

  const handleWizardLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Dados obrigatórios",
        description: "Informe e-mail e senha para entrar.",
        variant: "destructive",
      });
      return;
    }

    setAuthWizardLoading(true);
    try {
      sessionStorage.setItem(GUEST_POST_LOGIN_REDIRECT_KEY, "/booking-engine");
      await login(loginData.email.trim().toLowerCase(), loginData.password);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error?.message || "Não foi possível autenticar.",
        variant: "destructive",
      });
    } finally {
      setAuthWizardLoading(false);
    }
  };

  const handleWizardRegister = async () => {
    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
      toast({
        title: "Dados obrigatórios",
        description: "Preencha nome, sobrenome, e-mail e senha.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "Confirme a senha corretamente.",
        variant: "destructive",
      });
      return;
    }

    setAuthWizardLoading(true);
    try {
      const registerRes = await api.guestRegister({
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
        email: registerData.email.trim().toLowerCase(),
        phone: registerData.phone.trim() || undefined,
        documentNumber: registerData.documentNumber.trim() || undefined,
        password: registerData.password,
      });

      if (!registerRes.success) {
        throw new Error(registerRes.error?.message || "Não foi possível criar a conta.");
      }

      sessionStorage.setItem(GUEST_POST_LOGIN_REDIRECT_KEY, "/booking-engine");
      await login(registerData.email.trim().toLowerCase(), registerData.password);
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error?.message || "Não foi possível concluir o cadastro.",
        variant: "destructive",
      });
    } finally {
      setAuthWizardLoading(false);
    }
  };

  // Toggle unit selection
  const toggleUnitSelection = (unitId: number) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (selectedUnits.length === 0) return;

    setIsLoading(true);
    try {
      const results = [];

      // We'll create one reservation per unit as the backend is structured 1:1
      for (const unitId of selectedUnits) {
        const response = await api.createBookingReservation({
          unitId,
          checkIn: checkIn!.toISOString(),
          checkOut: checkOut!.toISOString(),
          guests: totalGuests,
          stayType: selectedStayType || 'daily',
          guestInfo: {
            name: guestInfo.name,
            email: guestInfo.email,
            phone: guestInfo.phone,
            cpf: guestInfo.document.replace(/\D/g, ''),
            observations: ''
          },
          paymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethodId)?.name || 'Nenhum',
          promotionCode: appliedPromotion?.code,
          paymentStatus: pixPaymentConfirmed ? 'paid' : 'pending',
          pixGatewayProvider: pixPaymentConfirmed ? (pixChargeData?.provider || 'efi') : undefined,
          pixGatewayTxid: pixPaymentConfirmed ? (pixChargeData?.txid || undefined) : undefined,
        });

        if (response.success && response.data) {
          results.push(response.data.reservation);
        }
      }

      if (results.length > 0) {
        setCompleteReservationData(results);
        setStep("confirmation");
        toast({
          title: "Reserva realizada!",
          description: `Sua reserva foi confirmada com sucesso.`,
        });
      } else {
        toast({
          title: "Erro na reserva",
          description: "Não foi possível processar sua reserva.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua reserva.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePixQrCode = async () => {
    const totals = calculateTotal();
    const computedAmount = Number(
      (Number(totals.subtotal || 0) - Number(totals.discount || 0) + Number(totals.taxes || 0) + Number(totals.serviceFees || 0))
        .toFixed(2)
    );
    const totalAmount = Number(totals.total || 0) > 0 ? Number(totals.total) : computedAmount;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Não foi possível calcular o valor da reserva para gerar o PIX.",
        variant: "destructive",
      });
      return;
    }

    setPixGenerating(true);
    try {
      const response = await api.generateBookingPixCharge({
        amount: totalAmount,
        description: "Pagamento de reserva - Booking Engine",
        guest: {
          name: guestInfo.name,
          cpf: guestInfo.document.replace(/\D/g, ""),
        },
        reservationContext: {
          unitLabel: selectedUnits.length ? `Unidades selecionadas: ${selectedUnits.length}` : undefined,
          period: checkIn && checkOut
            ? `${format(checkIn, "dd/MM/yyyy")} - ${format(checkOut, "dd/MM/yyyy")}`
            : undefined,
        },
      });

      if (!response.success || !response.data?.brCode) {
        throw new Error(response.error?.message || "Não foi possível gerar o QR Code PIX.");
      }

      setPixChargeData(response.data);
      setPixModalOpen(true);
      toast({
        title: "QR Code gerado!",
        description: "Escaneie o código para efetuar o pagamento via PIX.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PIX",
        description: error?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setPixGenerating(false);
    }
  };

  // Step progress indicator
  const getStepNumber = () => {
    const steps: BookingStep[] = ["search", "results", "guest", "payment", "confirmation"];
    return steps.indexOf(step);
  };

  useEffect(() => {
    if (step !== "payment") return;
    const total = Number(calculateTotal().total || 0);
    if (total > 0) return;

    toast({
      title: "Valor inválido para pagamento",
      description: "Selecione as datas novamente para continuar a reserva.",
      variant: "destructive",
    });
    setStep("search");
  }, [step, checkIn, checkOut, selectedUnits, selectedStayType, appliedPromotion, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                  <img src={logoUrl} alt={hotelName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                {logoUrl ? (
                  <>
                    <h1 className="font-bold text-lg text-foreground leading-tight">{hotelName}</h1>
                    <p className="text-xs text-muted-foreground">Motor de Reservas</p>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-lg text-foreground tracking-tight">Uni<span className="text-primary mx-0.5">|</span>Stays</span>
                    <span className="text-xs text-muted-foreground">Sistema Unificado</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>(11) 9.8440-1158</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>reservas@unistays.com.br</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Search Step */}
        {step === "search" && (
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920"
                alt="Travel destination"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 animate-float opacity-20">
              <Plane className="w-16 h-16 text-white" />
            </div>
            <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: "1s" }}>
              <Sun className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: "2s" }}>
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: "1.5s" }}>
              <Compass className="w-14 h-14 text-white" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
              <div className="max-w-4xl mx-auto">
                {/* Title */}
                <div className="mb-8 animate-slide-up">
                  <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                    <Globe className="w-4 h-4 mr-2" />
                    Descubra experiências únicas
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                    Encontre seu
                    <span className="block bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                      Destino Perfeito
                    </span>
                  </h1>
                  <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Hotéis, apartamentos, lofts e casas de temporada com as melhores condições
                  </p>
                </div>

                {/* Search Card */}
                <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
                      {/* Região */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Região
                        </Label>
                        <Select
                          value={selectedRegion}
                          onValueChange={(val) => setSelectedRegion(val === "all" ? "" : val)}
                        >
                          <SelectTrigger className="h-14 border-2 hover:border-primary/50 transition-colors bg-white">
                            <SelectValue placeholder="Onde você vai?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as regiões</SelectItem>
                            {availableRegions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Check-in */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Check-in
                        </Label>
                        <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-14 border-2 hover:border-primary/50 transition-colors"
                            >
                              {checkIn ? (
                                <span className="text-foreground font-medium">
                                  {format(checkIn, "dd MMM yyyy", { locale: ptBR })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Selecione a data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={(date) => {
                                setCheckIn(date);
                                setIsCheckInOpen(false);
                                if (date && (!checkOut || checkOut <= date)) {
                                  setCheckOut(addDays(date, 1));
                                }
                              }}
                              disabled={(date) => date < new Date()}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Check-out */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Check-out
                        </Label>
                        <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-14 border-2 hover:border-primary/50 transition-colors"
                            >
                              {checkOut ? (
                                <span className="text-foreground font-medium">
                                  {format(checkOut, "dd MMM yyyy", { locale: ptBR })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Selecione a data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={(date) => {
                                setCheckOut(date);
                                setIsCheckOutOpen(false);
                              }}
                              disabled={(date) => date <= (checkIn || new Date())}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Guests */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Hóspedes
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-14 border-2 hover:border-primary/50 transition-colors"
                            >
                              <span className="text-foreground font-medium">
                                {adults} adulto{adults !== 1 ? "s" : ""}
                                {children > 0 && `, ${children} criança${children !== 1 ? "s" : ""}`}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72" align="start">
                            <div className="space-y-4 p-2">
                              {/* Adults */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Adultos</p>
                                  <p className="text-sm text-muted-foreground">13 anos ou mais</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                    disabled={adults <= 1}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center font-medium">{adults}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setAdults(adults + 1)}
                                    disabled={adults >= 10}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Children */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Crianças</p>
                                  <p className="text-sm text-muted-foreground">0-12 anos</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                    disabled={children <= 0}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-6 text-center font-medium">{children}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setChildren(children + 1)}
                                    disabled={children >= 6}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Search Button */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-transparent">Buscar</Label>
                        <Button
                          className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg font-semibold shadow-lg"
                          onClick={handleSearch}
                        >
                          <Search className="w-5 h-5 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </div>

                    {/* Summary */}
                    {checkIn && checkOut && (
                      <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{nights} noite{nights !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{totalGuests} hóspede{totalGuests !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick info */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  {[
                    { icon: Shield, label: "Reserva Segura" },
                    { icon: CreditCard, label: "Parcelamento" },
                    { icon: CheckCircle2, label: "Confirmação Imediata" },
                    { icon: Star, label: "Melhor Preço" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 text-white/80 text-sm">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Selection Steps */}
        {step !== "search" && step !== "confirmation" && (
          <div className="container mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {["Seleção", "Dados", "Pagamento"].map((label, index) => {
                  const stepIndex = getStepNumber() - 1;
                  const isActive = index <= stepIndex;
                  const isCurrent = index === stepIndex;

                  return (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                          isCurrent
                            ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-110"
                            : isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        )}>
                          {isActive && !isCurrent ? <Check className="w-5 h-5" /> : index + 1}
                        </div>
                        <span className={cn(
                          "text-xs mt-2",
                          isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                        )}>
                          {label}
                        </span>
                      </div>
                      {index < 2 && (
                        <div className={cn(
                          "w-12 md:w-24 h-1 mx-1 rounded-full transition-colors",
                          isActive ? "bg-primary/30" : "bg-muted"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Summary Strip */}
            <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
                  {selectedRegion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Destino:</span>
                      <span className="font-medium">{selectedRegion}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Check-in:</span>
                    <span className="font-medium">{checkIn && format(checkIn, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="font-medium">{checkOut && format(checkOut, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{nights} noite{nights !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">{totalGuests} hóspede{totalGuests !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                {step === "results" && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setStep("search")}
                    >
                      <Filter className="w-4 h-4" />
                      Refazer filtro de busca
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results - Selection View */}
            {step === "results" && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Sidebar Filters */}
                  <aside className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-24">
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h3 className="font-bold flex items-center gap-2 mb-4">
                            <SlidersHorizontal className="w-4 h-4 text-primary" />
                            Filtros
                          </h3>
                        </div>

                        {/* Stay Type Filter */}
                        <div className="space-y-3">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Tipo de Estadia</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {(Object.entries(stayTypeConfig) as [StayType, typeof stayTypeConfig[StayType]][]).map(([type, config]) => {
                              const isSelected = selectedStayType === type;
                              const isDisabled = nights < config.minNights;
                              return (
                                <Button
                                  key={type}
                                  variant={isSelected ? "default" : "outline"}
                                  className={cn(
                                    "justify-start h-auto py-3 px-4",
                                    isSelected ? "bg-primary text-white" : ""
                                  )}
                                  disabled={isDisabled}
                                  onClick={() => setSelectedStayType(type)}
                                >
                                  <div className="text-left">
                                    <div className="font-bold text-sm flex items-center gap-2">
                                      {config.label}
                                      {config.discount && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[10px] px-1 py-0">
                                          {config.discount}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-[10px] opacity-70">{config.description}</div>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Property Type Filter */}
                        <div className="space-y-3 pt-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Tipo de Imóvel</Label>
                          <div className="space-y-2">
                            {(Object.entries(propertyTypeConfig) as [PropertyType, typeof propertyTypeConfig[PropertyType]][])
                              .filter(([type]) => availablePropertyTypes.includes(type))
                              .map(([type, config]) => (
                                <div
                                  key={type}
                                  className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                                    selectedPropertyType === type ? "bg-primary/5 text-primary" : "hover:bg-muted"
                                  )}
                                  onClick={() => setSelectedPropertyType(selectedPropertyType === type ? null : type)}
                                >
                                  <div className="flex items-center gap-2">
                                    <config.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{config.label}</span>
                                  </div>
                                  {selectedPropertyType === type && <Check className="w-4 h-4" />}
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Accommodation Type Filter */}
                        <div className="space-y-3 pt-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Acomodação</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(accommodationTypeConfig) as [AccommodationType, typeof accommodationTypeConfig[AccommodationType]][])
                              .map(([type, config]) => (
                                <Button
                                  key={type}
                                  variant={selectedAccommodationType === type ? "default" : "outline"}
                                  size="sm"
                                  className="text-[10px] h-8"
                                  onClick={() => setSelectedAccommodationType(selectedAccommodationType === type ? null : type)}
                                >
                                  {config.label}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </aside>

                  {/* Results Main Area */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">
                        {filteredUnits.length} {filteredUnits.length === 1 ? 'Unidade disponível' : 'Unidades disponíveis'}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Ordenar por:</span>
                        <Select defaultValue="price-asc">
                          <SelectTrigger className="w-40 h-8 text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price-asc">Menor Preço</SelectItem>
                            <SelectItem value="price-desc">Maior Preço</SelectItem>
                            <SelectItem value="rating">Melhor Avaliação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredUnits.map((unit) => {
                        const isSelected = selectedUnits.includes(unit.id);

                        return (
                          <Card
                            key={unit.id}
                            className={cn(
                              "overflow-hidden transition-all duration-300 hover:shadow-xl group",
                              isSelected && "ring-2 ring-primary"
                            )}
                          >
                            <div className="flex flex-col h-full">
                              {/* Image Section */}
                              <div className="relative aspect-video overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => openUnitGallery(unit)}
                                  className="w-full h-full text-left"
                                >
                                  <img
                                    src={unit.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
                                    alt={unit.categoryName}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </button>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                <div className="absolute top-3 left-3 flex gap-2">
                                  <Badge className="bg-primary/90 text-white border-0 backdrop-blur-md">
                                    {unit.categoryName}
                                  </Badge>
                                  <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-md capitalize">
                                    {unit.propertyType}
                                  </Badge>
                                </div>

                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span>{unit.rating}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openUnitGallery(unit)}
                                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs"
                                >
                                  <Camera className="w-3 h-3" />
                                  Ver fotos
                                </button>
                              </div>

                              {/* Content Section */}
                              <CardContent className="p-5 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">#{unit.number} - {unit.categoryName}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                      <MapPin className="w-3.5 h-3.5 text-primary" />
                                      {unit.city} - {unit.neighborhood}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/50 my-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{unit.capacity} pessoas</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Maximize className="w-3.5 h-3.5" />
                                    <span>{unit.size}m²</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Bed className="w-3.5 h-3.5" />
                                    <span>{unit.beds}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Valor por noite</p>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-bold text-primary">R$ {unit.price}</span>
                                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">/noite</span>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => toggleUnitSelection(unit.id)}
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                      "px-6 font-bold",
                                      isSelected ? "bg-primary" : "hover:border-primary hover:text-primary"
                                    )}
                                  >
                                    {isSelected ? (
                                      <><Check className="w-4 h-4 mr-2" /> Selecionado</>
                                    ) : (
                                      'Selecionar'
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Finalize Selection Bubble */}
                    {selectedUnits.length > 0 && (
                      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                        <Card className="shadow-2xl border-primary/20 bg-primary text-white overflow-hidden min-w-[300px]">
                          <CardContent className="p-4 flex items-center justify-between gap-6">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Total Estimado</p>
                              <p className="text-xl font-bold">
                                R$ {calculateTotal().total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <Button
                              size="lg"
                              className="bg-white text-primary hover:bg-white/90 font-bold"
                              onClick={() => setStep("guest")}
                            >
                              Finalizar Reserva ({selectedUnits.length})
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-start mt-12">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={goBack}>
                    <ChevronLeft className="mr-2 w-4 h-4" />
                    Alterar Busca
                  </Button>
                </div>
              </div>
            )}

            {/* Guest Info */}
            {step === "guest" && (
              <div className="animate-fade-in max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Dados do Hóspede</h2>
                  <p className="text-muted-foreground">
                    {isGuestAuthenticated
                      ? "Confirme seus dados para continuar"
                      : "Faça login no Portal do Hóspede para seguir ao pagamento"}
                  </p>
                </div>

                {isGuestAuthenticated ? (
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Nome Completo *</Label>
                          <Input
                            placeholder="Digite seu nome completo"
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>E-mail *</Label>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Telefone *</Label>
                          <Input
                            placeholder="(11) 99999-9999"
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: maskPhone(e.target.value) })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>CPF/Documento *</Label>
                          <Input
                            placeholder="000.000.000-00"
                            value={guestInfo.document}
                            onChange={(e) => setGuestInfo({ ...guestInfo, document: maskCPF(e.target.value) })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>País</Label>
                          <Input
                            placeholder="Brasil"
                            value={guestInfo.country}
                            onChange={(e) => setGuestInfo({ ...guestInfo, country: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-primary/30 shadow-lg">
                    <CardContent className="p-8 sm:p-10">
                      <div className="text-center max-w-lg mx-auto space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold">Acesse para finalizar seu pagamento</h3>
                        <p className="text-muted-foreground">
                          Para segurança e histórico da reserva, entre com sua conta ou crie um novo cadastro.
                        </p>
                        <Button
                          size="lg"
                          className="w-full h-14 text-base font-semibold mt-2"
                          onClick={() => {
                            persistBookingDraft({ resumeStep: "payment" });
                            setAuthWizardOpen(true);
                          }}
                        >
                          Logar na plataforma para Pagamento
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" size="lg" onClick={goBack}>
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    size="lg"
                    className="px-8"
                    onClick={requireGuestLoginForPayment}
                  >
                    {isGuestAuthenticated ? "Ir para Pagamento" : "Entrar para pagar"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Payment */}
            {step === "payment" && (
              <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Pagamento</h2>
                  <p className="text-muted-foreground">Escolha a forma de pagamento</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Payment options */}
                  <div className="lg:col-span-2 space-y-4">
                    {paymentMethods.map((method) => {
                      const isSelected = selectedPaymentMethodId === method.id;
                      const Icon = (() => {
                        switch (method.type) {
                          case "credit_card": return CreditCard;
                          case "debit_card": return CreditCard;
                          case "pix": return QrCode;
                          case "cash": return Banknote;
                          case "bank_transfer": return Landmark;
                          case "check": return Receipt;
                          case "invoice": return Receipt;
                          case "voucher": return Wallet;
                          default: return CreditCard;
                        }
                      })();

                      return (
                        <div key={method.id} className="space-y-4">
                          <Card
                            className={cn(
                              "cursor-pointer transition-all duration-300 border-2",
                              isSelected ? "border-primary bg-primary/5 shadow-md" : "hover:border-primary/50"
                            )}
                            onClick={() => setSelectedPaymentMethodId(isSelected ? null : method.id)}
                          >
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                  isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                )}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">{method.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Clique para ver detalhes do pagamento
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {isSelected && method.details && (
                            <div className="animate-in slide-in-from-top-4 duration-300 px-4">
                              <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-6">
                                  <h4 className="font-bold text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Procedimento para Pagamento
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* PIX Details */}
                                    {method.type === 'pix' && (
                                      <>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Chave PIX</p>
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg select-all cursor-copy">{method.details.pixKey || 'Não informada'}</p>
                                            {method.details.pixKey ? (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => {
                                                  const pixKey = String(method.details.pixKey || "");
                                                  void navigator.clipboard.writeText(pixKey)
                                                    .then(() => toast({ title: "Chave PIX copiada!" }))
                                                    .catch(() => toast({
                                                      title: "Erro ao copiar",
                                                      description: "Não foi possível copiar a chave PIX.",
                                                      variant: "destructive",
                                                    }));
                                                }}
                                              >
                                                <Copy className="w-3.5 h-3.5" />
                                              </Button>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Tipo de Chave</p>
                                          <p className="font-bold capitalize">{method.details.pixKeyType || 'Não informada'}</p>
                                        </div>
                                        <div className="md:col-span-2 pt-2">
                                          <Button
                                            type="button"
                                            size="lg"
                                            className="h-11 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700"
                                            onClick={handleGeneratePixQrCode}
                                            disabled={pixGenerating}
                                          >
                                            {pixGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                                            Gerar QRCode PIX
                                          </Button>
                                          {pixPaymentConfirmed && (
                                            <p className="text-xs text-emerald-600 font-semibold mt-2">
                                              Pagamento PIX confirmado pelo hóspede.
                                            </p>
                                          )}
                                        </div>
                                      </>
                                    )}

                                    {/* Bank Transfer Details */}
                                    {method.type === 'bank_transfer' && (
                                      <>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Banco</p>
                                          <p className="font-bold">{method.details.bankName || 'Não informado'}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Agência / Conta</p>
                                          <p className="font-bold">{method.details.bankAgency || '0000'} / {method.details.bankAccount || '0000'}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Titular</p>
                                          <p className="font-bold">{method.details.bankHolder || 'Não informado'}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">CPF/CNPJ</p>
                                          <p className="font-bold">{method.details.bankDoc || 'Não informado'}</p>
                                        </div>
                                      </>
                                    )}

                                    {/* Card Details */}
                                    {(method.type === 'credit_card' || method.type === 'debit_card') && (
                                      <>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">Operadora</p>
                                          <p className="font-bold">{method.details.providerName || 'Não informada'}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium">ID do Terminal</p>
                                          <p className="font-bold">{method.details.terminalId || 'N/A'}</p>
                                        </div>
                                      </>
                                    )}

                                    {/* Generic Additional Info */}
                                    {method.details.additionalInfo && (
                                      <div className="md:col-span-2 space-y-1 mt-2 p-3 bg-white/50 rounded-lg border border-dashed border-primary/20">
                                        <p className="text-xs text-muted-foreground font-medium">Instruções Adicionais</p>
                                        <p className="text-sm italic text-foreground leading-relaxed whitespace-pre-wrap">
                                          {method.details.additionalInfo}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {(method.type === 'credit_card' || method.type === 'debit_card') && (
                                    <div className="mt-6 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                      <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                      <p className="text-xs text-amber-800">
                                        <strong>Atenção:</strong> O pagamento via cartão será processado no balcão durante o check-in ou conforme políticas da propriedade.
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <Card className="h-fit">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-4">Resumo da Reserva</h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-in</span>
                          <span className="font-medium">{checkIn && format(checkIn, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check-out</span>
                          <span className="font-medium">{checkOut && format(checkOut, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Noites</span>
                          <span className="font-medium">{nights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hóspedes</span>
                          <span className="font-medium">{totalGuests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unidades</span>
                          <span className="font-medium">{selectedUnits.length}</span>
                        </div>

                        {/* Coupon Section */}
                        <div className="pt-4 mt-4 border-t">
                          <Label className="text-xs mb-2 block">Tem um cupom de desconto?</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="CUPOM"
                              className="h-9 text-xs"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              disabled={!!appliedPromotion || isApplyingCoupon}
                            />
                            <Button
                              variant={appliedPromotion ? "secondary" : "outline"}
                              size="sm"
                              className="h-9 px-3"
                              onClick={appliedPromotion ? () => { setAppliedPromotion(null); setCouponCode(""); } : handleApplyCoupon}
                              disabled={isApplyingCoupon || (!couponCode && !appliedPromotion)}
                            >
                              {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedPromotion ? "Remover" : "Aplicar"}
                            </Button>
                          </div>
                          {appliedPromotion && (
                            <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Cupom {appliedPromotion.code} aplicado com sucesso!
                            </p>
                          )}
                        </div>

                        <div className="border-t pt-3 mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>R$ {calculateTotal().subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          {calculateTotal().discount > 0 && (
                            <div className="flex justify-between text-xs text-green-600 font-medium">
                              <span>Desconto ({appliedPromotion?.name || appliedPromotion?.code})</span>
                              <span>- R$ {calculateTotal().discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          {calculateTotal().serviceFees > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Taxa de Serviço</span>
                              <span>R$ {calculateTotal().serviceFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Impostos / Taxas</span>
                            <span>R$ {calculateTotal().taxes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold text-base">Total</span>
                            <span className="text-2xl font-bold text-primary">
                              R$ {calculateTotal().total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" size="lg" onClick={goBack}>
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    size="lg"
                    className="px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    disabled={isLoading || !selectedPaymentMethodId || calculateTotal().total <= 0}
                    onClick={handleCreateBooking}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="mr-2 w-5 h-5" />
                        Confirmar e Pagar (R$ {calculateTotal().total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation */}
        {
          step === "confirmation" && (
            <div className="container mx-auto px-4 py-16 text-center animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-4xl font-bold mb-4">Reserva Confirmada!</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Sua reserva foi realizada com sucesso. Enviamos os detalhes para seu e-mail.
                </p>

                <div className="space-y-6">
                  <Card className="overflow-hidden border-primary/20 shadow-xl">
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <QrCode className="w-5 h-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Reserva(s)</p>
                            <p className="font-bold text-lg">
                              {completeReservationData.map(r => r.confirmationCode).join(', ')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Confirmada
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Detalhes da Reserva */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-left">
                              <p className="text-muted-foreground mb-1">Check-in</p>
                              <div className="flex items-center gap-2 font-bold">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                {completeReservationData[0]?.checkIn ? format(new Date(completeReservationData[0].checkIn), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-muted-foreground mb-1">Check-out</p>
                              <div className="flex items-center gap-2 font-bold">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                {completeReservationData[0]?.checkOut ? format(new Date(completeReservationData[0].checkOut), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                              </div>
                            </div>
                            <div className="text-left col-span-2 bg-muted/50 p-3 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Unidade(s)</p>
                                <p className="font-bold text-primary">
                                  {completeReservationData.map(r => r.unitName).join(', ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Noites</p>
                                <p className="font-bold">{nights}</p>
                              </div>
                            </div>
                          </div>

                          {/* Financeiro */}
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>R$ {completeReservationData.reduce((acc, curr) => acc + (Number(curr.subtotal) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                            {completeReservationData.some(r => r.discount > 0) && (
                              <div className="flex justify-between text-sm text-green-600 font-medium">
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Desconto {completeReservationData[0]?.appliedPromotion ? `(${completeReservationData[0].appliedPromotion.name})` : ''}</span>
                                </div>
                                <span>- R$ {completeReservationData.reduce((acc, curr) => acc + (Number(curr.discount) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {completeReservationData.some(r => r.serviceFees > 0) && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Taxa de Serviço</span>
                                <span>R$ {completeReservationData.reduce((acc, curr) => acc + (Number(curr.serviceFees) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Impostos / Taxas</span>
                              <span>R$ {completeReservationData.reduce((acc, curr) => acc + (Number(curr.taxes) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                              <span className="font-bold text-lg">Total</span>
                              <span className="text-2xl font-bold text-primary">
                                R$ {completeReservationData.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Credenciais e QR */}
                        <div className="space-y-6">
                          {/* QR Code */}
                          <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-xl border border-dashed border-border/50">
                            {completeReservationData[0]?.qrCode ? (
                              <img src={completeReservationData[0].qrCode} alt="QR Code" className="w-32 h-32 mb-2" />
                            ) : (
                              <div className="w-32 h-32 bg-white flex items-center justify-center mb-2">
                                <QrCode className="w-16 h-16 text-muted" />
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground uppercase font-bold text-center">
                              Apresente este QR Code no check-in
                            </p>
                          </div>

                          {/* Dados de Acesso */}
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left">
                            <h4 className="flex items-center gap-2 font-bold text-primary text-sm mb-3">
                              <Globe className="w-4 h-4" />
                              Acesso ao Portal do Hóspede
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">E-mail</p>
                                <p className="text-sm font-medium">{completeReservationData[0]?.guestEmail || guestInfo.email}</p>
                              </div>
                              {completeReservationData[0]?.guestCredentials?.password && (
                                <div className="bg-white p-2 rounded border border-primary/10 mt-1">
                                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Senha Temporária</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-mono font-bold text-primary">{completeReservationData[0].guestCredentials.password}</p>
                                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary uppercase">Mude ao acessar</Badge>
                                  </div>
                                </div>
                              )}
                              {!completeReservationData[0]?.guestCredentials && (
                                <p className="text-[10px] text-muted-foreground italic">
                                  Acesse com sua senha cadastrada ou use o link enviado por e-mail.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 h-12 px-8"
                      onClick={() => {
                        setStep("search");
                        setSelectedPropertyType(null);
                        setSelectedAccommodationType(null);
                        setSelectedStayType(null);
                        setSelectedCategory(null);
                        setSelectedUnits([]);
                        setCheckIn(undefined);
                        setCheckOut(undefined);
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Nova Reserva
                    </Button>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 gap-2 h-12 px-8"
                      onClick={() => window.open('/guest-portal', '_blank')}
                    >
                      Acessar Portal do Hóspede
                      <Globe className="w-4 h-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-8"
                      onClick={() => window.open(`/check-in/${completeReservationData[0]?.confirmationCode}`, '_blank')}
                    >
                      Fazer Check-in Online
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </main>
      <footer className="bg-muted/50 border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 HotelFlow. Todos os direitos reservados.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Shield className="w-5 h-5" />
            <span>Pagamento 100% Seguro</span>
          </div>
        </div>
      </footer>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl p-3 bg-black/95 border-zinc-700">
          <div className="relative">
            <img
              src={galleryImages[galleryIndex]}
              alt={`Imagem ${galleryIndex + 1}`}
              className="w-full max-h-[72vh] object-contain rounded-md"
            />
            {galleryImages.length > 1 && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={goPrevGallery}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={goNextGallery}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {galleryIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  className={cn(
                    "h-16 w-24 shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    idx === galleryIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={authWizardOpen} onOpenChange={setAuthWizardOpen}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-5xl p-0 overflow-hidden rounded-2xl border-0">
          <div className="grid md:grid-cols-[360px,1fr] min-h-[640px]">
            <div className="relative hidden md:flex flex-col justify-between p-8 text-white overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"
                alt="Hotel background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-primary/75 to-cyan-700/70" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.18em] text-white/80">Reserva Segura</p>
                <h3 className="text-3xl font-bold mt-3 leading-tight">Acesso do Hóspede</h3>
                <p className="mt-3 text-white/85 text-sm">
                  Entre para finalizar o pagamento e acompanhar sua reserva com segurança.
                </p>
              </div>
              <div className="relative z-10 space-y-3">
                {[
                  { id: "01", title: "Escolha o acesso", active: true },
                  { id: "02", title: authWizardTab === "login" ? "Entrar na conta" : "Criar nova conta", active: true },
                  { id: "03", title: "Ir para pagamento", active: !!isGuestAuthenticated }
                ].map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2 backdrop-blur-sm",
                      item.active ? "bg-white/15 border-white/30" : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      item.active ? "bg-white text-primary" : "bg-white/15 text-white"
                    )}>
                      {item.id}
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background p-6 sm:p-8 md:p-10">
              <div className="md:hidden mb-6 rounded-xl bg-gradient-to-r from-primary to-cyan-600 text-white p-5">
                <h3 className="text-xl font-bold">Acesso para pagamento</h3>
                <p className="text-white/90 text-sm mt-1">Escolha como deseja continuar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAuthWizardTab("login")}
                  className={cn(
                    "text-left rounded-2xl border-2 p-5 transition-all",
                    authWizardTab === "login"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">Já tenho conta</p>
                      <p className="text-sm text-muted-foreground mt-1">Entrar com e-mail e senha.</p>
                    </div>
                    {authWizardTab === "login" ? <CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> : null}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthWizardTab("register")}
                  className={cn(
                    "text-left rounded-2xl border-2 p-5 transition-all",
                    authWizardTab === "register"
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold">Novo cadastro</p>
                      <p className="text-sm text-muted-foreground mt-1">Criar conta para pagar agora.</p>
                    </div>
                    {authWizardTab === "register" ? <CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> : null}
                  </div>
                </button>
              </div>

              {authWizardTab === "login" ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label>E-mail</Label>
                    <Input
                      className="mt-2 h-11"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <Input
                      className="mt-2 h-11"
                      type="password"
                      placeholder="Sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <Button size="lg" className="w-full h-12 mt-2 text-base" onClick={handleWizardLogin} disabled={authWizardLoading}>
                    {authWizardLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Entrar e continuar pagamento
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome *</Label>
                      <Input
                        className="mt-2 h-11"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Sobrenome *</Label>
                      <Input
                        className="mt-2 h-11"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>E-mail *</Label>
                      <Input
                        className="mt-2 h-11"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        className="mt-2 h-11"
                        placeholder="(11) 99999-9999"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, phone: maskPhone(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>CPF/Documento</Label>
                      <Input
                        className="mt-2 h-11"
                        placeholder="000.000.000-00"
                        value={registerData.documentNumber}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, documentNumber: maskCPF(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label>Senha *</Label>
                      <Input
                        className="mt-2 h-11"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Confirmar senha *</Label>
                      <Input
                        className="mt-2 h-11"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button size="lg" className="w-full h-12 mt-2 text-base" onClick={handleWizardRegister} disabled={authWizardLoading}>
                    {authWizardLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Criar conta e continuar pagamento
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-4xl p-0 overflow-hidden rounded-2xl border-0">
          <DialogTitle className="sr-only">Pagamento PIX da Reserva</DialogTitle>
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1400"
              alt="Pagamento PIX"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-primary/80 to-emerald-700/80" />
            <div className="relative z-10 px-6 sm:px-10 py-7 text-white">
              <h3 className="text-2xl sm:text-3xl font-bold">Pagamento PIX da Reserva</h3>
              <p className="text-white/90 mt-2">
                Escaneie o QR Code no aplicativo do seu banco e confirme o pagamento para prosseguir.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-6">
            <div className="rounded-2xl border bg-white shadow-sm p-5 flex flex-col items-center">
              {pixChargeData?.brCode ? (
                <QRCodeSVG
                  value={pixChargeData.brCode}
                  size={260}
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  level="M"
                  includeMargin
                />
              ) : (
                <div className="h-[260px] w-[260px] bg-muted rounded-xl" />
              )}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Abra o app do banco, escolha PIX e escaneie o QR.
              </p>
            </div>

            <div className="space-y-5">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Resumo do pagamento</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {Number(pixChargeData?.amount || calculateTotal().total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pixChargeData?.description || "Pagamento da reserva via PIX"}
                  </p>
                  {pixChargeData?.txid ? (
                    <p className="text-xs text-muted-foreground">
                      TXID: <span className="font-mono">{pixChargeData.txid}</span>
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">PIX copia e cola</Label>
                <div className="rounded-xl border bg-muted/40 p-3">
                  <p className="font-mono text-xs break-all">
                    {pixChargeData?.brCode || "Código indisponível"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    const code = pixChargeData?.brCode || "";
                    void navigator.clipboard.writeText(code)
                      .then(() => toast({ title: "Código PIX copiado!" }))
                      .catch(() => toast({
                        title: "Erro ao copiar",
                        description: "Não foi possível copiar o código PIX.",
                        variant: "destructive",
                      }));
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar código PIX
                </Button>
              </div>

              <Card className="border-dashed">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold mb-2">Instruções inteligentes da reserva</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Realize o pagamento no app do banco.</li>
                    <li>2. Aguarde a confirmação no seu comprovante.</li>
                    <li>3. Clique em "Confirmar pagamento" para continuar.</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  onClick={() => {
                    setPixPaymentConfirmed(true);
                    setPixModalOpen(false);
                    toast({
                      title: "Pagamento confirmado",
                      description: "PIX confirmado. Agora você pode concluir a reserva.",
                    });
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Confirmar pagamento
                </Button>
                <Button type="button" variant="outline" size="lg" className="h-12" onClick={() => setPixModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}