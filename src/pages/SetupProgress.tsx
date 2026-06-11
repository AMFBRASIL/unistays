import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Star,
  Building2,
  Package,
  DollarSign,
  Plug,
  Users,
  Mail,
  CreditCard,
  Shield,
  BedDouble,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trophy,
  Sparkles,
  Target,
  Zap,
  Crown,
  Wrench,
  Clock3,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import PropertyModal from "@/components/properties/PropertyModal";
import { RoomModal } from "@/components/registrations/RoomModal";
import { RoomTypesListModal } from "@/components/registrations/RoomTypesListModal";
import { RatePlansListModal } from "@/components/registrations/RatePlansListModal";
import { SeasonsListModal } from "@/components/registrations/SeasonsListModal";
import { PoliciesModal } from "@/components/registrations/PoliciesModal";
import { PromotionsListModal } from "@/components/registrations/PromotionsListModal";
import { ProductCategoriesModal } from "@/components/registrations/ProductCategoriesModal";
import { ProductsModal } from "@/components/registrations/ProductsModal";
import { StockConfigModal } from "@/components/registrations/StockConfigModal";
import { SuppliersListModal } from "@/components/registrations/SuppliersListModal";
import { PaymentMethodsListModal } from "@/components/registrations/PaymentMethodsListModal";
import { ConnectedAppsModal } from "@/components/registrations/ConnectedAppsModal";
import { InvoiceParamsModal } from "@/components/registrations/InvoiceParamsModal";
import { FiscalParamsModal } from "@/components/registrations/FiscalParamsModal";
import { SMTPConfigModal } from "@/components/registrations/SMTPConfigModal";
import { SalesChannelsModal } from "@/components/registrations/BookingChannelsListModal";
import { EquipmentsListModal } from "@/components/registrations/EquipmentsListModal";
import { WebhooksModal } from "@/components/registrations/WebhooksModal";
import { EmailTemplateModal } from "@/components/registrations/EmailTemplateModal";
import { NewAutomationModal } from "@/components/email/NewAutomationModal";
import { NewGroupModal } from "@/components/usergroups/NewGroupModal";
import { SETUP_PROGRESS_QUERY_KEY } from "@/lib/setupProgressShared";

type SetupPriority = "critical" | "important" | "recommended" | "optional";

type SetupQuickAction =
  | { kind: "modal"; modal: string }
  | { kind: "route"; path: string };

interface SetupItemDef {
  id: string;
  name: string;
  description: string;
  points: number;
  priority: SetupPriority;
  action: SetupQuickAction;
}

interface SetupCategoryDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  items: SetupItemDef[];
}

const setupCategoryDefs: SetupCategoryDef[] = [
  {
    id: "properties",
    title: "Propriedades",
    description: "Configure seus empreendimentos",
    icon: Building2,
    route: "/properties",
    color: "from-blue-500 to-blue-600",
    items: [
      {
        id: "prop-1",
        name: "Criar primeira propriedade",
        description: "Adicione seu primeiro empreendimento",
        points: 15,
        priority: "critical",
        action: { kind: "modal", modal: "property" },
      },
      {
        id: "prop-2",
        name: "Configurar endereço",
        description: "Endereço completo da propriedade",
        points: 5,
        priority: "important",
        action: { kind: "modal", modal: "property" },
      },
      {
        id: "prop-3",
        name: "Definir horários",
        description: "Check-in e check-out padrão",
        points: 5,
        priority: "important",
        action: { kind: "modal", modal: "property" },
      },
      {
        id: "prop-4",
        name: "Adicionar fotos",
        description: "Galeria de imagens do local",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "property" },
      },
    ],
  },
  {
    id: "units",
    title: "Unidades",
    description: "Quartos, apartamentos e espaços",
    icon: BedDouble,
    route: "/rooms",
    color: "from-purple-500 to-purple-600",
    items: [
      {
        id: "unit-1",
        name: "Criar unidades",
        description: "Adicione quartos ou apartamentos",
        points: 15,
        priority: "critical",
        action: { kind: "modal", modal: "room" },
      },
      {
        id: "unit-2",
        name: "Definir capacidades",
        description: "Número de hóspedes por unidade",
        points: 5,
        priority: "important",
        action: { kind: "modal", modal: "room" },
      },
      {
        id: "unit-3",
        name: "Configurar amenidades",
        description: "Comodidades por tipo de quarto",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "roomTypes" },
      },
      {
        id: "unit-4",
        name: "Fotos das unidades",
        description: "Imagens de cada espaço",
        points: 5,
        priority: "optional",
        action: { kind: "modal", modal: "room" },
      },
    ],
  },
  {
    id: "rates",
    title: "Tarifas",
    description: "Planos de preços e temporadas",
    icon: DollarSign,
    route: "/rate-plans",
    color: "from-green-500 to-green-600",
    items: [
      {
        id: "rate-1",
        name: "Criar tarifa base",
        description: "Preço padrão das unidades",
        points: 15,
        priority: "critical",
        action: { kind: "modal", modal: "ratePlans" },
      },
      {
        id: "rate-2",
        name: "Configurar temporadas",
        description: "Alta e baixa temporada",
        points: 10,
        priority: "important",
        action: { kind: "modal", modal: "seasons" },
      },
      {
        id: "rate-3",
        name: "Políticas de cancelamento",
        description: "Regras de reembolso",
        points: 5,
        priority: "important",
        action: { kind: "modal", modal: "policies" },
      },
      {
        id: "rate-4",
        name: "Tarifas promocionais",
        description: "Descontos e ofertas especiais",
        points: 5,
        priority: "optional",
        action: { kind: "modal", modal: "promotions" },
      },
    ],
  },
  {
    id: "inventory",
    title: "Estoque",
    description: "Produtos e inventário",
    icon: Package,
    route: "/inventory",
    color: "from-orange-500 to-orange-600",
    items: [
      {
        id: "inv-1",
        name: "Cadastrar categorias",
        description: "Organize seus produtos",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "productCategories" },
      },
      {
        id: "inv-2",
        name: "Adicionar produtos",
        description: "Itens do estoque",
        points: 10,
        priority: "recommended",
        action: { kind: "modal", modal: "products" },
      },
      {
        id: "inv-3",
        name: "Definir alertas",
        description: "Estoque mínimo por empreendimento",
        points: 5,
        priority: "optional",
        action: { kind: "modal", modal: "stockConfig" },
      },
      {
        id: "inv-4",
        name: "Fornecedores",
        description: "Cadastro de fornecedores",
        points: 5,
        priority: "optional",
        action: { kind: "modal", modal: "suppliers" },
      },
    ],
  },
  {
    id: "payments",
    title: "Pagamentos",
    description: "Formas de pagamento e gateway",
    icon: CreditCard,
    route: "/financial",
    color: "from-emerald-500 to-emerald-600",
    items: [
      {
        id: "pay-1",
        name: "Formas de pagamento",
        description: "PIX, cartão, boleto",
        points: 10,
        priority: "critical",
        action: { kind: "modal", modal: "paymentMethods" },
      },
      {
        id: "pay-2",
        name: "Gateway de pagamento",
        description: "Integração com processador / detalhes nos métodos",
        points: 15,
        priority: "important",
        action: { kind: "modal", modal: "connectedApps" },
      },
      {
        id: "pay-3",
        name: "Conta bancária",
        description: "Dados fiscais e recebimento",
        points: 5,
        priority: "important",
        action: { kind: "modal", modal: "invoiceParams" },
      },
      {
        id: "pay-4",
        name: "Nota fiscal",
        description: "Configuração fiscal",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "fiscalParams" },
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrações",
    description: "Conecte serviços externos",
    icon: Plug,
    route: "/registrations",
    color: "from-pink-500 to-pink-600",
    items: [
      {
        id: "int-1",
        name: "Configurar SMTP",
        description: "Envio de e-mails",
        points: 10,
        priority: "important",
        action: { kind: "modal", modal: "smtp" },
      },
      {
        id: "int-2",
        name: "Channel Manager",
        description: "Credenciais nos canais OTA",
        points: 15,
        priority: "recommended",
        action: { kind: "modal", modal: "bookingChannels" },
      },
      {
        id: "int-3",
        name: "Smart Locks",
        description: "Equipamentos e fechaduras",
        points: 10,
        priority: "optional",
        action: { kind: "modal", modal: "equipments" },
      },
      {
        id: "int-4",
        name: "Webhooks",
        description: "Automações externas",
        points: 5,
        priority: "optional",
        action: { kind: "modal", modal: "webhooks" },
      },
    ],
  },
  {
    id: "users",
    title: "Usuários",
    description: "Equipe e permissões",
    icon: Users,
    route: "/users",
    color: "from-indigo-500 to-indigo-600",
    items: [
      {
        id: "user-1",
        name: "Criar usuários",
        description: "Membros da equipe",
        points: 10,
        priority: "important",
        action: { kind: "route", path: "/users" },
      },
      {
        id: "user-2",
        name: "Definir papéis",
        description: "Funções e acessos",
        points: 5,
        priority: "important",
        action: { kind: "route", path: "/user-groups" },
      },
      {
        id: "user-3",
        name: "Grupos de usuários",
        description: "Organize por departamento",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "newUserGroup" },
      },
    ],
  },
  {
    id: "communication",
    title: "Comunicação",
    description: "E-mails e notificações",
    icon: Mail,
    route: "/communication",
    color: "from-cyan-500 to-cyan-600",
    items: [
      {
        id: "com-1",
        name: "Templates de e-mail",
        description: "Modelos personalizados",
        points: 10,
        priority: "important",
        action: { kind: "modal", modal: "emailTemplates" },
      },
      {
        id: "com-2",
        name: "Notificações automáticas",
        description: "Automações de e-mail",
        points: 5,
        priority: "recommended",
        action: { kind: "modal", modal: "emailAutomation" },
      },
      {
        id: "com-3",
        name: "WhatsApp Business",
        description: "Metadados no canal WhatsApp",
        points: 10,
        priority: "optional",
        action: { kind: "modal", modal: "bookingChannels" },
      },
    ],
  },
];

interface SetupCategory extends Omit<SetupCategoryDef, "items"> {
  items: (SetupItemDef & { completed: boolean })[];
}

interface PropertyForEdit {
  id: string;
  name: string;
  type: "hotel" | "apart-hotel" | "loft" | "temporada" | "other";
  address: string;
  addressNumber?: string;
  units: number;
  occupancy: number;
  rates: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  amenities: string[];
  services: {
    cleaning: string;
    coworking: boolean;
    rooftop: boolean;
  };
  status: "active" | "maintenance" | "inactive";
  checkInTime?: string;
  checkOutTime?: string;
  images?: string[];
  description?: string;
  zipCode?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  website?: string;
  settings?: Record<string, unknown>;
}

const getLevelInfo = (percentage: number) => {
  if (percentage >= 100) return { level: 5, title: "Mestre Hoteleiro", icon: Crown, color: "text-yellow-500" };
  if (percentage >= 80) return { level: 4, title: "Expert", icon: Trophy, color: "text-purple-500" };
  if (percentage >= 60) return { level: 3, title: "Profissional", icon: Target, color: "text-blue-500" };
  if (percentage >= 40) return { level: 2, title: "Intermediário", icon: Zap, color: "text-green-500" };
  if (percentage >= 20) return { level: 1, title: "Iniciante", icon: Sparkles, color: "text-orange-500" };
  return { level: 0, title: "Novato", icon: Star, color: "text-muted-foreground" };
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return (
        <Badge variant="destructive" className="text-xs">
          Crítico
        </Badge>
      );
    case "important":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
          Importante
        </Badge>
      );
    case "recommended":
      return (
        <Badge variant="secondary" className="text-xs">
          Recomendado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Opcional
        </Badge>
      );
  }
};

export default function SetupProgress() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedPropertyForEdit, setSelectedPropertyForEdit] = useState<PropertyForEdit | null>(null);

  const invalidateSetup = () => {
    queryClient.invalidateQueries({ queryKey: [...SETUP_PROGRESS_QUERY_KEY] });
  };

  const modalProps = (key: string) => ({
    open: openModal === key,
    onOpenChange: (v: boolean) => {
      if (!v) {
        setOpenModal(null);
        if (key === "property") {
          setSelectedPropertyForEdit(null);
        }
        invalidateSetup();
      }
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: SETUP_PROGRESS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.getSetupProgress();
      if (!res.success || !res.data) throw new Error("Falha ao carregar progresso");
      return res.data.items;
    },
    staleTime: 30_000,
  });

  const { data: propertiesForSelector, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["properties", "setup-progress-selector"],
    queryFn: async () => {
      const response = await api.getProperties();
      if (!response.success || !response.data?.properties) return [] as PropertyForEdit[];

      return response.data.properties.map((property: any) => {
        const rates = property.settings?.rates || {};
        const type = (property.type || "hotel") as PropertyForEdit["type"];
        return {
          id: String(property.id),
          name: property.name || "",
          type: ["hotel", "apart-hotel", "loft", "temporada"].includes(type) ? type : "other",
          address: property.address || "",
          addressNumber: property.addressNumber || property.address_number || "",
          units: Number(property.unitsCount || property.units_count || 0),
          occupancy: Number(property.currentOccupancy || property.current_occupancy || 0),
          rates: {
            daily: Number(rates.daily || 0),
            weekly: Number(rates.weekly || 0),
            monthly: Number(rates.monthly || 0),
          },
          amenities: property.settings?.amenities || [],
          services: {
            cleaning: property.cleaningSchedule || "per-stay",
            coworking: !!property.services?.coworking,
            rooftop: !!property.services?.rooftop,
          },
          status: (property.status || "active") as PropertyForEdit["status"],
          checkInTime: property.settings?.checkInTime,
          checkOutTime: property.settings?.checkOutTime,
          images: property.images || [],
          description: property.settings?.description || "",
          zipCode: property.zipCode || property.zip_code || "",
          neighborhood: property.neighborhood || "",
          city: property.city || "",
          state: property.state || "",
          email: property.email || "",
          phone: property.phone || "",
          website: property.website || "",
          settings: property.settings || {},
        };
      });
    },
    staleTime: 30_000,
  });

  const setupCategories: SetupCategory[] = useMemo(() => {
    const flags = data ?? {};
    return setupCategoryDefs.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({
        ...item,
        completed: flags[item.id] ?? false,
      })),
    }));
  }, [data]);

  const totalPoints = setupCategories.reduce(
    (acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.points, 0),
    0
  );

  const completedPoints = setupCategories.reduce(
    (acc, cat) => acc + cat.items.filter((item) => item.completed).reduce((sum, item) => sum + item.points, 0),
    0
  );

  const percentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
  const levelInfo = getLevelInfo(percentage);
  const LevelIcon = levelInfo.icon;

  const getCategoryProgress = (category: SetupCategory) => {
    const total = category.items.reduce((sum, item) => sum + item.points, 0);
    const completed = category.items
      .filter((item) => item.completed)
      .reduce((sum, item) => sum + item.points, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getCategoryStars = (category: SetupCategory) => {
    const progress = getCategoryProgress(category);
    if (progress >= 100) return 5;
    if (progress >= 80) return 4;
    if (progress >= 60) return 3;
    if (progress >= 40) return 2;
    if (progress >= 20) return 1;
    return 0;
  };

  const pendingCritical = setupCategories.flatMap((cat) =>
    cat.items.filter((item) => !item.completed && item.priority === "critical")
  );

  const runItemAction = (item: SetupItemDef & { completed: boolean }) => {
    if (item.completed) return;
    if (item.id === "prop-3") {
      setOpenModal("property-selector");
      return;
    }
    if (item.action.kind === "route") {
      navigate(item.action.path);
      return;
    }
    if (item.action.modal === "property") {
      setSelectedPropertyForEdit(null);
    }
    setOpenModal(item.action.modal);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {isError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              Não foi possível carregar o progresso do setup. Verifique se está autenticado e tente novamente.
            </CardContent>
          </Card>
        )}

        <PropertyModal
          {...modalProps("property")}
          property={selectedPropertyForEdit as any}
          onSuccess={invalidateSetup}
        />
        <Dialog
          open={openModal === "property-selector"}
          onOpenChange={(v) => {
            if (!v) {
              setOpenModal(null);
              setSelectedPropertyForEdit(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Selecionar Propriedade para Definir Horários</DialogTitle>
              <DialogDescription>
                Escolha uma propriedade já cadastrada para editar o horário padrão de check-in e check-out.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {isLoadingProperties && (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}

              {!isLoadingProperties && (propertiesForSelector?.length || 0) === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    Nenhuma propriedade encontrada. Cadastre uma propriedade primeiro.
                  </CardContent>
                </Card>
              )}

              {(propertiesForSelector || []).map((property) => (
                <Card key={property.id} className="border-border/60">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{property.name}</p>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{property.address || "Sem endereço definido"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>
                          Check-in: {property.checkInTime || "--:--"} | Check-out: {property.checkOutTime || "--:--"}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPropertyForEdit(property);
                        setOpenModal("property");
                      }}
                    >
                      Editar horários
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <RoomModal {...modalProps("room")} />
        <RoomTypesListModal {...modalProps("roomTypes")} />
        <RatePlansListModal {...modalProps("ratePlans")} />
        <SeasonsListModal {...modalProps("seasons")} />
        <PoliciesModal {...modalProps("policies")} />
        <PromotionsListModal {...modalProps("promotions")} />
        <ProductCategoriesModal {...modalProps("productCategories")} />
        <ProductsModal {...modalProps("products")} />
        <StockConfigModal {...modalProps("stockConfig")} />
        <SuppliersListModal {...modalProps("suppliers")} />
        <PaymentMethodsListModal {...modalProps("paymentMethods")} />
        <ConnectedAppsModal {...modalProps("connectedApps")} />
        <InvoiceParamsModal {...modalProps("invoiceParams")} />
        <FiscalParamsModal {...modalProps("fiscalParams")} />
        <SMTPConfigModal {...modalProps("smtp")} />
        <SalesChannelsModal {...modalProps("bookingChannels")} />
        <EquipmentsListModal {...modalProps("equipments")} />
        <WebhooksModal {...modalProps("webhooks")} />
        <EmailTemplateModal {...modalProps("emailTemplates")} />
        <NewAutomationModal
          open={openModal === "emailAutomation"}
          onOpenChange={(v) => {
            if (!v) {
              setOpenModal(null);
              invalidateSetup();
            }
          }}
          onSuccess={invalidateSetup}
        />
        <NewGroupModal
          open={openModal === "newUserGroup"}
          onOpenChange={(v) => {
            if (!v) {
              setOpenModal(null);
              invalidateSetup();
            }
          }}
          onSuccess={invalidateSetup}
        />

        {/* Header com Progresso Geral */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

          <div className="relative p-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full max-w-xl" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-background to-muted flex items-center justify-center shadow-2xl border-4 border-primary/20">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{percentage}%</div>
                      <div className="text-sm text-muted-foreground mt-1">Completo</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                    <LevelIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      Nível {levelInfo.level}
                    </Badge>
                    <span className={`text-2xl font-bold ${levelInfo.color}`}>{levelInfo.title}</span>
                  </div>

                  <h1 className="text-3xl font-bold mb-2">Progresso da Instalação</h1>
                  <p className="text-muted-foreground mb-4 max-w-xl">
                    Indicadores calculados em tempo real com base nos seus cadastros. Itens pendentes podem ser
                    concluídos aqui mesmo, abrindo o mesmo modal usado em Cadastros.
                  </p>

                  <div className="flex items-center gap-4 justify-center lg:justify-start">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{completedPoints} pontos conquistados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{totalPoints - completedPoints} pontos restantes</span>
                    </div>
                  </div>

                  <div className="mt-6 max-w-md mx-auto lg:mx-0">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Novato</span>
                      <span>Iniciante</span>
                      <span>Intermediário</span>
                      <span>Profissional</span>
                      <span>Expert</span>
                      <span>Mestre</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {pendingCritical.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">Ações Críticas Pendentes</CardTitle>
              </div>
              <CardDescription>
                Complete estas configurações essenciais para o funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingCritical.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                    <Circle className="h-4 w-4 text-destructive" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="shrink-0"
                      onClick={() => runItemAction({ ...item, completed: false })}
                    >
                      <Wrench className="h-3.5 w-3.5 mr-1" />
                      Resolver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {setupCategories.map((category) => {
            const stars = getCategoryStars(category);
            const CategoryIcon = category.icon;

            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} mx-auto mb-3 flex items-center justify-center shadow-lg`}
                  >
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm mb-2 truncate">{category.title}</h3>
                  <div className="flex justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= stars ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getCategoryProgress(category)}%</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {setupCategories.map((category) => {
            const CategoryIcon = category.icon;
            const progress = getCategoryProgress(category);
            const stars = getCategoryStars(category);
            const isExpanded = expandedCategory === category.id;

            return (
              <Card
                key={category.id}
                className={`transition-all ${isExpanded ? "ring-2 ring-primary shadow-lg" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} shadow-lg`}>
                        <CategoryIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= stars ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 mt-3" />
                </CardHeader>

                <CardContent className="space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
                        item.completed
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium text-sm ${
                                item.completed ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            {getPriorityBadge(item.priority)}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Badge variant={item.completed ? "secondary" : "outline"}>
                          {item.completed ? "✓" : `+${item.points}`}pts
                        </Badge>
                        {!item.completed && (
                          <Button size="sm" variant="default" onClick={() => runItemAction(item)}>
                            Concluir aqui
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button className="w-full mt-4" variant="outline" onClick={() => navigate(category.route)}>
                    Ir para {category.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Conquistas</CardTitle>
            </div>
            <CardDescription>Desbloqueie recompensas ao completar marcos importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Primeiro Passo", desc: "Complete 20% do setup", unlocked: percentage >= 20, icon: Sparkles },
                { title: "Meio do Caminho", desc: "Complete 50% do setup", unlocked: percentage >= 50, icon: Zap },
                { title: "Quase Lá", desc: "Complete 80% do setup", unlocked: percentage >= 80, icon: Target },
                { title: "Setup Completo", desc: "Complete 100% do setup", unlocked: percentage >= 100, icon: Crown },
              ].map((achievement, idx) => {
                const AchievementIcon = achievement.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                        : "bg-muted/30 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        achievement.unlocked ? "bg-yellow-500/20" : "bg-muted"
                      }`}
                    >
                      <AchievementIcon
                        className={`h-6 w-6 ${
                          achievement.unlocked ? "text-yellow-500" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.desc}</p>
                    {achievement.unlocked && (
                      <Badge className="mt-2 bg-yellow-500 hover:bg-yellow-600">Desbloqueado!</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
