import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Search,
  Plus,
  Filter,
  BedDouble,
  Building2,
  CreditCard,
  Truck,
  Tag,
  Percent,
  Calendar,
  Settings2,
  ChevronRight,
  FileText,
  Package,
  Utensils,
  Car,
  Wifi,
  Sparkles,
  ShieldCheck,
  Layers,
  Globe,
  MonitorSmartphone,
  CalendarCheck,
  Hotel,
  Receipt,
  Calculator,
  FileSpreadsheet,
  Warehouse,
  ShoppingBag,
  Ruler,
  Cog,
  Landmark,
  Mail,
  Chrome,
  Webhook,
  Code2,
  Puzzle,
  HardDrive,
  Cloud,
  FileSignature,
} from "lucide-react";
import { SMTPConfigModal } from "@/components/registrations/SMTPConfigModal";
import { OAuthGoogleModal } from "@/components/registrations/OAuthGoogleModal";
import { WebhooksModal } from "@/components/registrations/WebhooksModal";
import { APIConfigModal } from "@/components/registrations/APIConfigModal";
import { ConnectedAppsModal } from "@/components/registrations/ConnectedAppsModal";
import { NewRegistrationModal } from "@/components/registrations/NewRegistrationModal";
import { RoomTypesListModal } from "@/components/registrations/RoomTypesListModal";
import { RoomModal } from "@/components/registrations/RoomModal";
import { CompaniesListModal } from "@/components/registrations/CompaniesListModal";
import { PaymentMethodsListModal } from "@/components/registrations/PaymentMethodsListModal";
import { RatePlansListModal } from "@/components/registrations/RatePlansListModal";
import { PromotionsListModal } from "@/components/registrations/PromotionsListModal";
import { SuppliersListModal } from "@/components/registrations/SuppliersListModal";
import { SeasonsListModal } from "@/components/registrations/SeasonsListModal";
import { ExtrasListModal } from "@/components/registrations/ExtrasListModal";
import { MealsModal } from "@/components/registrations/MealsModal";
import { ParkingModal } from "@/components/registrations/ParkingModal";
import { AmenitiesModal } from "@/components/registrations/AmenitiesModal";
import { PoliciesModal } from "@/components/registrations/PoliciesModal";
import { DocumentsModal } from "@/components/registrations/DocumentsModal";
import { GeneralSettingsModal } from "@/components/registrations/GeneralSettingsModal";
import { WebCheckinModal } from "@/components/registrations/WebCheckinModal";
import { DayUseListModal } from "@/components/registrations/DayUseListModal";
import { BookingEngineModal } from "@/components/registrations/BookingEngineModal";
import { ChartOfAccountsModal } from "@/components/registrations/ChartOfAccountsModal";
import { FinancialCategoryModal } from "@/components/registrations/FinancialCategoryModal";
import { InvoiceParamsModal } from "@/components/registrations/InvoiceParamsModal";
import { FiscalParamsModal } from "@/components/registrations/FiscalParamsModal";
import { StockConfigModal } from "@/components/registrations/StockConfigModal";
import { StorageLocationsModal } from "@/components/registrations/StorageLocationsModal";
import { ProductsModal } from "@/components/registrations/ProductsModal";
import { UnitsModal } from "@/components/registrations/UnitsModal";
import { ProductCategoriesModal } from "@/components/registrations/ProductCategoriesModal";
import { ProductConfigModal } from "@/components/registrations/ProductConfigModal";
import { StorageConfigModal } from "@/components/registrations/StorageConfigModal";
import { EmailTemplateModal } from "@/components/registrations/EmailTemplateModal";
import { AIModal } from "@/components/registrations/AIModal";
import { EquipmentsListModal } from "@/components/registrations/EquipmentsListModal";
import { SalesChannelsModal } from "@/components/registrations/BookingChannelsListModal";
import { ContractsModal } from "@/components/registrations/ContractsModal";
import { BankAccountsModal } from "@/components/registrations/BankAccountsModal";

interface RegistrationCategory {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  count: number;
  color: string;
  bgColor: string;
}

const registrationCategories: RegistrationCategory[] = [
  {
    id: "contracts",
    icon: FileSignature,
    title: "Contratos",
    description: "Modelos contratuais com variaveis dinamicas por modulo",
    count: 0,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "room-types",
    icon: BedDouble,
    title: "Tipos de Quarto",
    description: "Categorias e tipos de acomodação",
    count: 8,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },

  {
    id: "companies",
    icon: Building2,
    title: "Empresas",
    description: "Empresas e agências parceiras",
    count: 34,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "booking-channels",
    icon: Globe,
    title: "Canais de Venda",
    description: "OTAs, agências e canal direto",
    count: 0,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "payment-methods",
    icon: CreditCard,
    title: "Formas de Pagamento",
    description: "Métodos de pagamento aceitos",
    count: 6,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "suppliers",
    icon: Truck,
    title: "Fornecedores",
    description: "Fornecedores e prestadores",
    count: 22,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "rate-plans",
    icon: Tag,
    title: "Planos Tarifários",
    description: "Tarifas e políticas de preço",
    count: 12,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "promotions",
    icon: Percent,
    title: "Promoções",
    description: "Ofertas e descontos especiais",
    count: 5,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "seasons",
    icon: Calendar,
    title: "Temporadas",
    description: "Períodos sazonais e feriados",
    count: 8,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "extras",
    icon: Package,
    title: "Extras e Serviços",
    description: "Serviços adicionais disponíveis",
    count: 15,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "meals",
    icon: Utensils,
    title: "Refeições",
    description: "Opções de alimentação",
    count: 4,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "parking",
    icon: Car,
    title: "Estacionamento",
    description: "Vagas e tipos de estacionamento",
    count: 3,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
  },
  {
    id: "amenities",
    icon: Wifi,
    title: "Amenidades",
    description: "Comodidades dos quartos",
    count: 28,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "policies",
    icon: ShieldCheck,
    title: "Políticas",
    description: "Regras e políticas do hotel",
    count: 6,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "documents",
    icon: FileText,
    title: "Documentos",
    description: "Tipos de documentos aceitos",
    count: 5,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
  },
  {
    id: "settings",
    icon: Settings2,
    title: "Configurações Gerais",
    description: "Parâmetros do sistema",
    count: 12,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "email-templates",
    icon: Mail,
    title: "Template de Emails",
    description: "Templates de e-mail transacionais",
    count: 8,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "ai-config",
    icon: Sparkles,
    title: "IA",
    description: "Configuração de Inteligência Artificial",
    count: 1,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  // Web
  {
    id: "webcheckin",
    icon: MonitorSmartphone,
    title: "Web Check-in",
    description: "Cadastro de webcheckin do cliente",
    count: 1,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "dayuse-params",
    icon: CalendarCheck,
    title: "Parametrização DayUse",
    description: "Configurações do módulo DayUse",
    count: 8,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "booking-engine-params",
    icon: Hotel,
    title: "Motor de Reserva",
    description: "Parametrização do motor de reservas",
    count: 15,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  // Financeiro
  {
    id: "bank-accounts",
    icon: Landmark,
    title: "Contas Bancárias",
    description: "Contas por propriedade para recebimento",
    count: 0,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "chart-of-accounts",
    icon: Receipt,
    title: "Plano de Conta",
    description: "Estrutura de contas financeiras",
    count: 42,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "financial-categories",
    icon: Tag,
    title: "Categorias Financeiras",
    description: "Categorias para receitas e despesas na tela Financeiro",
    count: 0,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  // Fiscal
  {
    id: "invoice-params",
    icon: FileSpreadsheet,
    title: "Parâmetros de Nota Fiscal",
    description: "Configurações de emissão de NF",
    count: 6,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "fiscal-params",
    icon: Calculator,
    title: "Parâmetros Fiscais",
    description: "Configurações fiscais e tributárias",
    count: 12,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  // Estoque
  {
    id: "stock-config",
    icon: Warehouse,
    title: "Configuração de Estoque",
    description: "Parâmetros e regras de estoque",
    count: 8,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "stock-locations",
    icon: MapPin,
    title: "Locais de Estoque",
    description: "Locais de armazenamento físico",
    count: 0,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  // Produtos
  {
    id: "products",
    icon: ShoppingBag,
    title: "Produtos",
    description: "Cadastro de produtos",
    count: 156,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "units",
    icon: Ruler,
    title: "Unidades",
    description: "Unidades de medida",
    count: 12,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "product-categories",
    icon: Tag,
    title: "Categorias de Produtos",
    description: "Categorias simples para produtos",
    count: 6,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "product-config",
    icon: Cog,
    title: "Config. de Produtos",
    description: "Configurações gerais de produtos",
    count: 5,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  // Armazenamento
  {
    id: "storage",
    icon: HardDrive,
    title: "Armazenamento",
    description: "Configurações de armazenamento de arquivos",
    count: 1,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
  },
  // Manutenção
  {
    id: "equipments",
    icon: Package,
    title: "Equipamentos",
    description: "Cadastro e controle de equipamentos",
    count: 8,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  // Integrações
  {
    id: "smtp-config",
    icon: Mail,
    title: "Configuração SMTP",
    description: "Servidor de e-mail e templates",
    count: 1,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "oauth-google",
    icon: Chrome,
    title: "OAuth Google",
    description: "Autenticação via Google",
    count: 1,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "webhooks",
    icon: Webhook,
    title: "Webhooks",
    description: "Endpoints de notificação",
    count: 3,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "api",
    icon: Code2,
    title: "API REST",
    description: "Chaves de API e documentação",
    count: 2,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "connected-apps",
    icon: Puzzle,
    title: "Apps Conectados",
    description: "Integrações com serviços externos",
    count: 5,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

const filterOptions = [
  { id: "all", label: "Todos" },
  { id: "accommodation", label: "Hospedagem" },
  { id: "financial", label: "Financeiro" },
  { id: "fiscal", label: "Fiscal" },
  { id: "services", label: "Serviços" },
  { id: "web", label: "Web" },
  { id: "stock", label: "Estoque" },
  { id: "products", label: "Produtos" },
  { id: "integrations", label: "Integrações" },
  { id: "system", label: "Sistema" },
];

export default function Registrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal states
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [webhooksModalOpen, setWebhooksModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [newRegistrationModalOpen, setNewRegistrationModalOpen] = useState(false);
  const [roomTypesListModalOpen, setRoomTypesListModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [companiesListModalOpen, setCompaniesListModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [ratePlansListModalOpen, setRatePlansListModalOpen] = useState(false);
  const [promotionsListModalOpen, setPromotionsListModalOpen] = useState(false);
  const [suppliersListModalOpen, setSuppliersListModalOpen] = useState(false);
  const [seasonsListModalOpen, setSeasonsListModalOpen] = useState(false);
  const [extrasListModalOpen, setExtrasListModalOpen] = useState(false);
  const [mealsListModalOpen, setMealsListModalOpen] = useState(false);
  const [parkingListModalOpen, setParkingListModalOpen] = useState(false);
  const [amenitiesListModalOpen, setAmenitiesListModalOpen] = useState(false);
  const [policiesModalOpen, setPoliciesModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [generalSettingsModalOpen, setGeneralSettingsModalOpen] = useState(false);
  const [webCheckinModalOpen, setWebCheckinModalOpen] = useState(false);
  const [dayUseListModalOpen, setDayUseListModalOpen] = useState(false);
  const [bookingEngineModalOpen, setBookingEngineModalOpen] = useState(false);
  const [chartOfAccountsModalOpen, setChartOfAccountsModalOpen] = useState(false);
  const [financialCategoryModalOpen, setFinancialCategoryModalOpen] = useState(false);
  const [invoiceParamsModalOpen, setInvoiceParamsModalOpen] = useState(false);
  const [fiscalParamsModalOpen, setFiscalParamsModalOpen] = useState(false);
  const [stockConfigModalOpen, setStockConfigModalOpen] = useState(false);
  const [stockLocationsModalOpen, setStockLocationsModalOpen] = useState(false);
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [unitsListModalOpen, setUnitsListModalOpen] = useState(false);
  const [productCategoriesModalOpen, setProductCategoriesModalOpen] = useState(false);
  const [productConfigModalOpen, setProductConfigModalOpen] = useState(false);
  const [storageConfigModalOpen, setStorageConfigModalOpen] = useState(false);
  const [emailTemplateModalOpen, setEmailTemplateModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [equipmentsListModalOpen, setEquipmentsListModalOpen] = useState(false);
  const [bookingChannelsModalOpen, setBookingChannelsModalOpen] = useState(false);
  const [contractsModalOpen, setContractsModalOpen] = useState(false);
  const [bankAccountsModalOpen, setBankAccountsModalOpen] = useState(false);

  const filteredCategories = registrationCategories.filter((category) => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "all") return matchesSearch;

    const filterMapping: Record<string, string[]> = {
      accommodation: ["room-types", "rooms", "amenities", "policies"],
      financial: ["payment-methods", "rate-plans", "promotions", "seasons", "chart-of-accounts", "financial-categories", "bank-accounts"],
      fiscal: ["invoice-params", "fiscal-params"],
      services: ["extras", "meals", "parking", "suppliers", "equipment-categories", "equipments"],
      web: ["webcheckin", "dayuse-params", "booking-engine-params"],
      stock: ["stock-config", "stock-locations"],
      products: ["products", "units", "product-categories", "product-config"],
      integrations: ["smtp-config", "oauth-google", "webhooks", "api", "connected-apps", "booking-channels"],
      system: ["companies", "documents", "settings", "storage", "email-templates", "ai-config", "contracts"],
    };

    return matchesSearch && filterMapping[activeFilter]?.includes(category.id);
  });

  const totalRecords = registrationCategories.reduce((acc, cat) => acc + cat.count, 0);

  const handleCategoryClick = (categoryId: string) => {
    switch (categoryId) {
      case "room-types":
        setRoomTypesListModalOpen(true);
        break;
      case "rooms":
        setRoomModalOpen(true);
        break;
      case "companies":
        setCompaniesListModalOpen(true);
        break;
      case "payment-methods":
        setPaymentMethodModalOpen(true);
        break;
      case "rate-plans":
        setRatePlansListModalOpen(true);
        break;
      case "promotions":
        setPromotionsListModalOpen(true);
        break;
      case "suppliers":
        setSuppliersListModalOpen(true);
        break;
      case "seasons":
        setSeasonsListModalOpen(true);
        break;
      case "extras":
        setExtrasListModalOpen(true);
        break;
      case "meals":
        setMealsListModalOpen(true);
        break;
      case "parking":
        setParkingListModalOpen(true);
        break;
      case "amenities":
        setAmenitiesListModalOpen(true);
        break;
      case "policies":
        setPoliciesModalOpen(true);
        break;
      case "documents":
        setDocumentsModalOpen(true);
        break;
      case "settings":
        setGeneralSettingsModalOpen(true);
        break;
      case "webcheckin":
        setWebCheckinModalOpen(true);
        break;
      case "dayuse-params":
        setDayUseListModalOpen(true);
        break;
      case "booking-engine-params":
        setBookingEngineModalOpen(true);
        break;
      case "chart-of-accounts":
        setChartOfAccountsModalOpen(true);
        break;
      case "bank-accounts":
        setBankAccountsModalOpen(true);
        break;
      case "financial-categories":
        setFinancialCategoryModalOpen(true);
        break;
      case "invoice-params":
        setInvoiceParamsModalOpen(true);
        break;
      case "fiscal-params":
        setFiscalParamsModalOpen(true);
        break;
      case "stock-config":
        setStockConfigModalOpen(true);
        break;
      case "stock-locations":
        setStockLocationsModalOpen(true);
        break;
      case "products":
        setProductsModalOpen(true);
        break;
      case "units":
        setUnitsListModalOpen(true);
        break;
      case "product-categories":
        setProductCategoriesModalOpen(true);
        break;
      case "product-config":
        setProductConfigModalOpen(true);
        break;
      case "storage":
        setStorageConfigModalOpen(true);
        break;
      case "email-templates":
        setEmailTemplateModalOpen(true);
        break;
      case "ai-config":
        setAiModalOpen(true);
        break;
      case "smtp-config":
        setSmtpModalOpen(true);
        break;
      case "oauth-google":
        setOauthModalOpen(true);
        break;
      case "webhooks":
        setWebhooksModalOpen(true);
        break;
      case "api":
        setApiModalOpen(true);
        break;
      case "connected-apps":
        setAppsModalOpen(true);
        break;
      case "equipments":
        setEquipmentsListModalOpen(true);
        break;
      case "booking-channels":
        setBookingChannelsModalOpen(true);
        break;
      case "contracts":
        setContractsModalOpen(true);
        break;
      default:
        // Handle other categories
        break;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Cadastros Geral
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os cadastros do sistema em um só lugar
            </p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Layers className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{registrationCategories.length}</p>
                  <p className="text-xs text-muted-foreground">Categorias</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Registros Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">98%</p>
                  <p className="text-xs text-muted-foreground">Completude</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Settings2 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Ativo</p>
                  <p className="text-xs text-muted-foreground">Status Sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card/50 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cadastros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {filterOptions.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className={activeFilter === filter.id
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0"
                      : "border-white/10 hover:bg-white/5"
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${category.bgColor}`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-0">
                    {category.count}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-emerald-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Acessar</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum cadastro encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termo de busca
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <RoomTypesListModal open={roomTypesListModalOpen} onOpenChange={setRoomTypesListModalOpen} />
      <RoomModal open={roomModalOpen} onOpenChange={setRoomModalOpen} />
      <CompaniesListModal open={companiesListModalOpen} onOpenChange={setCompaniesListModalOpen} />
      <PaymentMethodsListModal open={paymentMethodModalOpen} onOpenChange={setPaymentMethodModalOpen} />
      <RatePlansListModal open={ratePlansListModalOpen} onOpenChange={setRatePlansListModalOpen} />
      <PromotionsListModal open={promotionsListModalOpen} onOpenChange={setPromotionsListModalOpen} />
      <SuppliersListModal open={suppliersListModalOpen} onOpenChange={setSuppliersListModalOpen} />
      <SeasonsListModal open={seasonsListModalOpen} onOpenChange={setSeasonsListModalOpen} />
      <ExtrasListModal open={extrasListModalOpen} onOpenChange={setExtrasListModalOpen} />
      <MealsModal open={mealsListModalOpen} onOpenChange={setMealsListModalOpen} />
      <ParkingModal open={parkingListModalOpen} onOpenChange={setParkingListModalOpen} />
      <AmenitiesModal open={amenitiesListModalOpen} onOpenChange={setAmenitiesListModalOpen} />
      <PoliciesModal open={policiesModalOpen} onOpenChange={setPoliciesModalOpen} />
      <DocumentsModal open={documentsModalOpen} onOpenChange={setDocumentsModalOpen} />
      <GeneralSettingsModal open={generalSettingsModalOpen} onOpenChange={setGeneralSettingsModalOpen} />
      <WebCheckinModal open={webCheckinModalOpen} onOpenChange={setWebCheckinModalOpen} />
      <DayUseListModal open={dayUseListModalOpen} onOpenChange={setDayUseListModalOpen} />
      <BookingEngineModal open={bookingEngineModalOpen} onOpenChange={setBookingEngineModalOpen} />
      <ChartOfAccountsModal open={chartOfAccountsModalOpen} onOpenChange={setChartOfAccountsModalOpen} />
      <FinancialCategoryModal open={financialCategoryModalOpen} onOpenChange={setFinancialCategoryModalOpen} />
      <InvoiceParamsModal open={invoiceParamsModalOpen} onOpenChange={setInvoiceParamsModalOpen} />
      <FiscalParamsModal open={fiscalParamsModalOpen} onOpenChange={setFiscalParamsModalOpen} />
      <StockConfigModal open={stockConfigModalOpen} onOpenChange={setStockConfigModalOpen} />
      <StorageLocationsModal open={stockLocationsModalOpen} onOpenChange={setStockLocationsModalOpen} />
      <ProductsModal open={productsModalOpen} onOpenChange={setProductsModalOpen} />
      <UnitsModal open={unitsListModalOpen} onOpenChange={setUnitsListModalOpen} />
      <ProductCategoriesModal open={productCategoriesModalOpen} onOpenChange={setProductCategoriesModalOpen} />
      <ProductConfigModal open={productConfigModalOpen} onOpenChange={setProductConfigModalOpen} />
      <EquipmentsListModal open={equipmentsListModalOpen} onOpenChange={setEquipmentsListModalOpen} />
      <StorageConfigModal open={storageConfigModalOpen} onOpenChange={setStorageConfigModalOpen} />
      <EmailTemplateModal open={emailTemplateModalOpen} onOpenChange={setEmailTemplateModalOpen} />
      <AIModal open={aiModalOpen} onOpenChange={setAiModalOpen} />
      <SMTPConfigModal open={smtpModalOpen} onOpenChange={setSmtpModalOpen} />
      <OAuthGoogleModal open={oauthModalOpen} onOpenChange={setOauthModalOpen} />
      <WebhooksModal open={webhooksModalOpen} onOpenChange={setWebhooksModalOpen} />
      <APIConfigModal open={apiModalOpen} onOpenChange={setApiModalOpen} />
      <ConnectedAppsModal open={appsModalOpen} onOpenChange={setAppsModalOpen} />
      <SalesChannelsModal open={bookingChannelsModalOpen} onOpenChange={setBookingChannelsModalOpen} />
      <ContractsModal open={contractsModalOpen} onOpenChange={setContractsModalOpen} />
      <BankAccountsModal open={bankAccountsModalOpen} onOpenChange={setBankAccountsModalOpen} />
      <NewRegistrationModal open={newRegistrationModalOpen} onOpenChange={setNewRegistrationModalOpen} />
    </DashboardLayout>
  );
}
