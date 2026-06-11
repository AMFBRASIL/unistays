import { Link } from "react-router-dom";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Star,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  Calendar,
  CreditCard,
  BarChart3,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Globe,
  ChevronRight,
  Quote,
  Award,
  Rocket,
  Heart,
  Target,
  Hotel,
  Home,
  Building,
  Palmtree,
  Layers,
  Settings2,
  Wallet,
  CalendarDays,
} from "lucide-react";

// Import images
import heroDashboard from "@/assets/website-hero-dashboard.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";

// Stats data
const stats = [
  { value: "500+", label: "Hotéis Ativos", icon: Building2, color: "from-blue-500 to-cyan-500" },
  { value: "1M+", label: "Reservas/mês", icon: Calendar, color: "from-violet-500 to-purple-500" },
  { value: "99.9%", label: "Uptime Garantido", icon: Shield, color: "from-emerald-500 to-teal-500" },
  { value: "24/7", label: "Suporte Premium", icon: Clock, color: "from-orange-500 to-amber-500" },
];

// Features data
const features = [
  {
    icon: Calendar,
    title: "Gestão de Reservas",
    description: "Reservas individuais, grupos e corporativas com check-in digital e gestão completa de disponibilidade.",
    color: "from-blue-500 to-cyan-500",
    image: hotelLobby,
  },
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description: "Métricas em tempo real: ocupação, ADR, RevPAR, receita por canal e previsão de demanda com IA.",
    color: "from-violet-500 to-purple-500",
    image: heroDashboard,
  },
  {
    icon: CreditCard,
    title: "Financeiro Integrado",
    description: "Faturamento automático, contas a pagar/receber, relatórios fiscais e split de pagamentos.",
    color: "from-emerald-500 to-teal-500",
    image: staffTablet,
  },
  {
    icon: MessageSquare,
    title: "CRM Completo",
    description: "Histórico de hóspedes, automação de mensagens via WhatsApp, email e SMS, NPS e reviews.",
    color: "from-orange-500 to-amber-500",
    image: hotelLobby,
  },
  {
    icon: Globe,
    title: "Integrações",
    description: "Channel managers, motor de reservas próprio, gateways de pagamento, fechaduras eletrônicas e ERPs.",
    color: "from-pink-500 to-rose-500",
    image: heroDashboard,
  },
  {
    icon: Sparkles,
    title: "IA & Automação",
    description: "Precificação dinâmica, previsão de demanda, sugestões inteligentes e dashboard conversacional.",
    color: "from-indigo-500 to-blue-500",
    image: staffTablet,
  },
];

// Testimonials data
const testimonials = [
  {
    name: "Carlos Silva",
    role: "Gerente Geral",
    company: "Hotel Bella Vista",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "O Uni | Stays transformou completamente nossa operação. Reduzimos 40% do tempo em tarefas manuais e aumentamos nossa receita em 25% com a precificação dinâmica.",
    rating: 5,
  },
  {
    name: "Ana Rodrigues",
    role: "Proprietária",
    company: "Pousada Mar Azul",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "A integração com Booking e Airbnb funciona perfeitamente. Não preciso mais atualizar disponibilidade manualmente. O suporte é excepcional!",
    rating: 5,
  },
  {
    name: "Roberto Mendes",
    role: "Diretor de Operações",
    company: "Rede Comfort Hotels",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "Gerenciamos 12 propriedades com o Uni | Stays. A visão unificada e os relatórios consolidados nos dão controle total sobre todas as unidades.",
    rating: 5,
  },
];

// Pricing plans
const pricingPlans = [
  {
    name: "Starter",
    description: "Para pequenas propriedades",
    price: "R$ 197",
    period: "/mês",
    features: ["Até 20 quartos", "Reservas ilimitadas", "Motor de reservas", "Suporte por email"],
    popular: false,
  },
  {
    name: "Professional",
    description: "Para hotéis em crescimento",
    price: "R$ 397",
    period: "/mês",
    features: ["Até 50 quartos", "Tudo do Starter", "Channel manager", "CRM completo", "Relatórios avançados", "Suporte prioritário"],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para redes e grandes hotéis",
    price: "Sob consulta",
    period: "",
    features: ["Quartos ilimitados", "Tudo do Professional", "Multi-propriedade", "API personalizada", "Gerente de conta dedicado", "SLA garantido"],
    popular: false,
  },
];

// Benefits data
const benefits = [
  {
    icon: Rocket,
    title: "Aumente sua Receita",
    description: "IA que otimiza preços em tempo real baseado em demanda, eventos e concorrência.",
    stat: "+25%",
    statLabel: "de receita média",
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description: "Automação de tarefas repetitivas e fluxos inteligentes que aceleram operações.",
    stat: "40%",
    statLabel: "menos trabalho manual",
  },
  {
    icon: Heart,
    title: "Encante Hóspedes",
    description: "Comunicação personalizada e experiência impecável do booking ao checkout.",
    stat: "4.8★",
    statLabel: "avaliação média",
  },
  {
    icon: Target,
    title: "Decisões Certeiras",
    description: "Dashboards e relatórios que transformam dados em insights acionáveis.",
    stat: "100+",
    statLabel: "métricas em tempo real",
  },
];

// Trusted logos (placeholder company names)
const trustedBy = [
  "Hotel Fasano", "Rede Accor", "Comfort Suites", "Ibis Hotels", "Blue Tree", "Intercity"
];

export default function WebsiteLanding() {
  return (
    <WebsiteLayout>
      {/* Hero Section with Full Image Background */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Badge */}
              <Badge className="mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Novo: IA para precificação dinâmica
              </Badge>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                O PMS mais{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  moderno e completo
                </span>{" "}
                do Brasil
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
                Transforme a gestão do seu hotel com inteligência artificial, automação e 
                integrações poderosas. Aumente sua receita e reduza trabalho manual.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link to="/contato">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-lg px-8 py-6"
                  >
                    Começar Teste Grátis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/videos">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Ver Demonstração
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Suporte em português</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-white/10 px-4 py-1 rounded-md text-xs text-slate-300 border border-white/10">
                      app.unistays.com.br
                    </div>
                  </div>
                </div>
                <img 
                  src={heroDashboard} 
                  alt="Dashboard Uni | Stays" 
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Cards */}
      <section className="py-16 bg-white relative -mt-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8">
            Mais de 500 propriedades confiam no Uni | Stays
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {trustedBy.map((company) => (
              <div key={company} className="text-xl font-semibold text-slate-300 hover:text-slate-400 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hybrid System Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm">
              <Layers className="w-4 h-4 mr-2" />
              Sistema Híbrido Unificado
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Uma plataforma,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                infinitas possibilidades
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              O Uni | Stays foi projetado para atender qualquer tipo de propriedade. 
              De hotéis tradicionais a casas de temporada, apart-hotéis a lofts urbanos — 
              tudo em um único sistema integrado.
            </p>
          </div>

          {/* Property Types Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[
              {
                icon: Hotel,
                title: "Hotéis",
                description: "Diárias tradicionais com gestão completa de quartos, tarifas e serviços.",
                color: "from-blue-500 to-cyan-500",
                features: ["Check-in/out diário", "Tarifas dinâmicas", "Governança integrada"]
              },
              {
                icon: Building,
                title: "Apart-Hotéis",
                description: "Flexibilidade para estadias diárias, semanais ou mensais com serviços.",
                color: "from-violet-500 to-purple-500",
                features: ["Multi-período", "Serviços extras", "Gestão de proprietários"]
              },
              {
                icon: Home,
                title: "Lofts & Studios",
                description: "Acomodações urbanas modernas com contratos flexíveis e comodidades.",
                color: "from-emerald-500 to-teal-500",
                features: ["Coworking", "Rooftop", "Limpeza programada"]
              },
              {
                icon: Palmtree,
                title: "Temporada",
                description: "Casas e propriedades para aluguel de temporada com contratos longos.",
                color: "from-orange-500 to-amber-500",
                features: ["Contratos mensais", "Split de comissões", "Multi-proprietário"]
              },
            ].map((type) => (
              <Card 
                key={type.title} 
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group overflow-hidden"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <type.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    {type.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed hidden sm:block">
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stay Types */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-6">
                  Tipos de estadia{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    flexíveis
                  </span>
                </h3>
                <p className="text-slate-300 mb-8 leading-relaxed">
                  Configure diferentes modalidades de estadia para cada propriedade. 
                  O sistema calcula automaticamente tarifas, limpezas e contratos baseado no tipo selecionado.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: CalendarDays, label: "Diária", desc: "Reservas por dia" },
                    { icon: Calendar, label: "Semanal", desc: "Mínimo 7 dias" },
                    { icon: Building2, label: "Mensal", desc: "30+ dias" },
                    { icon: Wallet, label: "Long Stay", desc: "Contratos longos" },
                  ].map((stay) => (
                    <div 
                      key={stay.label}
                      className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <stay.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm sm:text-base">{stay.label}</div>
                        <div className="text-xs text-slate-400">{stay.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Settings2,
                    title: "Configuração por Propriedade",
                    description: "Defina tipos de estadia, tarifas e serviços específicos para cada unidade."
                  },
                  {
                    icon: Users,
                    title: "Multi-Proprietário",
                    description: "Gerencie propriedades de diferentes donos com split automático de comissões."
                  },
                  {
                    icon: TrendingUp,
                    title: "Precificação Inteligente",
                    description: "Tarifas dinâmicas por tipo de estadia, temporada e demanda em tempo real."
                  },
                ].map((item) => (
                  <div 
                    key={item.title}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-white/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-400 mb-6">
              Não importa o tamanho ou tipo da sua propriedade — o Uni | Stays se adapta a você.
            </p>
            <Link to="/features">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/25"
              >
                Explorar Recursos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">
              Benefícios
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Resultados reais para seu hotel
            </h2>
            <p className="text-lg text-slate-600">
              Nossos clientes alcançam resultados expressivos nos primeiros meses de uso.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  {benefit.stat}
                </div>
                <div className="text-sm text-slate-500 mb-3">{benefit.statLabel}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">
              Recursos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-slate-600">
              Módulos integrados que trabalham juntos para otimizar cada aspecto da sua operação hoteleira.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-slate-300 overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 -mt-12 relative z-10 shadow-lg group-hover:scale-110 transition-transform border-4 border-white`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link
                    to="/features"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-4 text-sm font-medium"
                  >
                    Saiba mais
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" size="lg" className="border-slate-300">
                Ver todos os recursos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Screenshots Preview with Real Image */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
                Interface Moderna
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Design intuitivo pensado para hoteleiros
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Interface limpa e moderna que seus funcionários vão adorar usar. 
                Menos cliques, mais produtividade.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Dashboard com métricas em tempo real",
                  "Mapa de ocupação visual e interativo",
                  "Gestão de tarifas com arrastar e soltar",
                  "Relatórios personalizáveis",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/screenshots">
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  Ver Screenshots
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <img 
                  src={staffTablet} 
                  alt="Equipe usando Uni | Stays" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-200">
              Depoimentos
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-slate-600">
              Hoteleiros de todo o Brasil confiam no Uni | Stays para gerenciar suas propriedades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-slate-200 hover:shadow-lg transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardContent className="p-6">
                  <Quote className="w-10 h-10 text-blue-100 mb-4" />
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {testimonial.role} • {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Large Image Section */}
      <section className="relative h-96 lg:h-[500px] overflow-hidden">
        <img 
          src={hotelLobby} 
          alt="Lobby de hotel de luxo" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <Badge className="mb-4 bg-white/10 text-white border-white/20">
                <Award className="w-3.5 h-3.5 mr-1.5" />
                Premiado
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Tecnologia de ponta para hotéis de todos os tamanhos
              </h2>
              <p className="text-lg text-slate-300 mb-6">
                De pousadas familiares a grandes redes hoteleiras, nossa plataforma se adapta às suas necessidades.
              </p>
              <Link to="/contato">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  Agendar Demonstração
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200">
              Preços
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Planos para cada tamanho de negócio
            </h2>
            <p className="text-lg text-slate-600">
              Comece grátis e escale conforme seu hotel cresce. Sem surpresas, sem taxas escondidas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-2 transition-all hover:shadow-xl ${
                  plan.popular
                    ? "border-blue-500 shadow-lg shadow-blue-500/10"
                    : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white border-0 px-3">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        {plan.price}
                      </span>
                      <span className="text-slate-500">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
                  >
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button variant="link" className="text-blue-600">
                Comparar todos os planos
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section with Image Background */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para transformar seu hotel?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 500 propriedades que já usam o Uni | Stays para 
            otimizar suas operações e aumentar a receita.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6"
              >
                Começar Teste Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contato">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Falar com Vendas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
