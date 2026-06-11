import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  BarChart3,
  MessageSquare,
  Globe,
  Sparkles,
  ClipboardList,
  Building2,
  ShoppingCart,
  Shield,
  ArrowRight,
  CheckCircle2,
  Play,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";

// Import images
import featuresHero from "@/assets/website-features-hero.jpg";
import heroDashboard from "@/assets/website-hero-dashboard.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";

const featureCategories = [
  {
    id: "reservas",
    title: "Gestão de Reservas",
    description: "Controle total sobre reservas individuais, grupos e corporativas com check-in digital e gestão completa de disponibilidade.",
    icon: Calendar,
    color: "from-blue-500 to-cyan-500",
    image: hotelLobby,
    features: [
      "Reservas individuais, grupos e corporativas",
      "Check-in e check-out digital",
      "Gestão de disponibilidade em tempo real",
      "Overbooking controlado",
      "Histórico completo de alterações",
      "Confirmações automáticas por email/WhatsApp",
    ],
  },
  {
    id: "ocupacao",
    title: "Mapa de Ocupação",
    description: "Visualização completa da ocupação com arrastar e soltar para gestão ágil de reservas.",
    icon: Building2,
    color: "from-violet-500 to-purple-500",
    image: heroDashboard,
    features: [
      "Timeline visual de 30+ dias",
      "Arrastar e soltar reservas",
      "Código de cores por canal",
      "Filtros por categoria e status",
      "Taxa de ocupação diária",
      "Bloqueio de quartos para manutenção",
    ],
  },
  {
    id: "financeiro",
    title: "Financeiro Integrado",
    description: "Faturamento, contas e relatórios fiscais automatizados para controle financeiro completo.",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    image: staffTablet,
    features: [
      "Faturamento automático",
      "Contas a pagar e receber",
      "Split de pagamentos para parceiros",
      "Relatórios DRE e fiscais",
      "Conciliação de canais",
      "Integração com ERPs",
    ],
  },
  {
    id: "crm",
    title: "CRM Completo",
    description: "Gestão de relacionamento com hóspedes e automação de marketing multicanal.",
    icon: MessageSquare,
    color: "from-orange-500 to-amber-500",
    image: featuresHero,
    features: [
      "Perfil completo do hóspede",
      "Histórico de estadias e preferências",
      "Automação de mensagens (WhatsApp, Email, SMS)",
      "Campanhas de marketing segmentadas",
      "NPS e gestão de reviews",
      "Programa de fidelidade integrado",
    ],
  },
  {
    id: "integracoes",
    title: "Integrações",
    description: "Conecte com os principais canais e ferramentas do mercado hoteleiro.",
    icon: Globe,
    color: "from-pink-500 to-rose-500",
    image: resortAerial,
    features: [
      "Channel managers (Booking, Airbnb, Expedia)",
      "Motor de reservas próprio",
      "Gateways de pagamento (PIX, cartões)",
      "Fechaduras eletrônicas",
      "ERPs e contabilidade",
      "APIs públicas e webhooks",
    ],
  },
  {
    id: "ia",
    title: "IA & Automação",
    description: "Inteligência artificial para otimizar receita e operações automaticamente.",
    icon: Sparkles,
    color: "from-indigo-500 to-blue-500",
    image: heroDashboard,
    features: [
      "Precificação dinâmica automática",
      "Previsão de demanda",
      "Sugestões inteligentes de pricing",
      "Dashboard conversacional",
      "Alertas preditivos",
      "Análise de concorrência",
    ],
  },
];

const highlights = [
  { icon: Zap, label: "Setup em 24h", description: "Configuração rápida" },
  { icon: Shield, label: "99.9% Uptime", description: "Alta disponibilidade" },
  { icon: Users, label: "500+ Hotéis", description: "Clientes satisfeitos" },
  { icon: TrendingUp, label: "+25% Receita", description: "Resultado médio" },
];

export default function WebsiteFeatures() {
  return (
    <WebsiteLayout>
      {/* Hero with Background Image */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featuresHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              Recursos Completos
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tudo que seu hotel precisa,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                em uma única plataforma
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Módulos integrados que cobrem desde reservas até IA, projetados para 
              otimizar cada aspecto da sua operação hoteleira.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contato">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/videos">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Strip */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-32">
            {featureCategories.map((category, index) => (
              <div
                key={category.id}
                id={category.id}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    {category.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {category.description}
                  </p>
                  <ul className="space-y-4 mb-8">
                    {category.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contato">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      Saber Mais
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                      <CardContent className="p-0">
                        <img 
                          src={category.image} 
                          alt={category.title}
                          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <Badge className={`bg-gradient-to-r ${category.color} text-white border-0`}>
                            {category.title}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Image */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para ver em ação?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Agende uma demonstração personalizada e veja como o Uni | Stays pode transformar seu hotel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
              >
                Agendar Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/screenshots">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Ver Screenshots
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
