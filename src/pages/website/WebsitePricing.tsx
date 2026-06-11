import { useState } from "react";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  X,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Zap,
  Shield,
  Clock,
  Headphones,
  Award,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import images
import resortAerial from "@/assets/website-resort-aerial.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para pequenas pousadas e B&Bs",
    monthlyPrice: 197,
    yearlyPrice: 167,
    icon: Building2,
    color: "from-slate-500 to-slate-600",
    features: {
      quartos: "Até 20 quartos",
      reservas: "Ilimitadas",
      usuarios: "2 usuários",
      motorReservas: true,
      channelManager: false,
      crm: "Básico",
      relatorios: "Essenciais",
      suporte: "Email",
      api: false,
      ia: false,
      multiPropriedade: false,
      treinamento: "Online",
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Para hotéis em crescimento",
    monthlyPrice: 397,
    yearlyPrice: 337,
    icon: Users,
    color: "from-blue-500 to-indigo-500",
    popular: true,
    features: {
      quartos: "Até 50 quartos",
      reservas: "Ilimitadas",
      usuarios: "10 usuários",
      motorReservas: true,
      channelManager: true,
      crm: "Completo",
      relatorios: "Avançados",
      suporte: "Prioritário (Chat + Email)",
      api: true,
      ia: "Básico",
      multiPropriedade: false,
      treinamento: "Online + 2h presencial",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para redes e grandes hotéis",
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Zap,
    color: "from-violet-500 to-purple-500",
    features: {
      quartos: "Ilimitados",
      reservas: "Ilimitadas",
      usuarios: "Ilimitados",
      motorReservas: true,
      channelManager: true,
      crm: "Completo + Automações",
      relatorios: "BI Completo",
      suporte: "Dedicado 24/7",
      api: true,
      ia: "Completo",
      multiPropriedade: true,
      treinamento: "Personalizado",
    },
  },
];

const featureLabels: Record<string, { label: string; tooltip: string }> = {
  quartos: { label: "Quartos", tooltip: "Número máximo de quartos/unidades" },
  reservas: { label: "Reservas", tooltip: "Quantidade de reservas por mês" },
  usuarios: { label: "Usuários", tooltip: "Número de contas de usuário" },
  motorReservas: { label: "Motor de Reservas", tooltip: "Widget de reservas para seu site" },
  channelManager: { label: "Channel Manager", tooltip: "Integração com Booking, Airbnb, Expedia" },
  crm: { label: "CRM", tooltip: "Gestão de relacionamento com hóspedes" },
  relatorios: { label: "Relatórios", tooltip: "Tipos de relatórios disponíveis" },
  suporte: { label: "Suporte", tooltip: "Canais e prioridade de atendimento" },
  api: { label: "API", tooltip: "Acesso à API para integrações customizadas" },
  ia: { label: "IA & Automação", tooltip: "Recursos de inteligência artificial" },
  multiPropriedade: { label: "Multi-propriedade", tooltip: "Gestão de múltiplas unidades" },
  treinamento: { label: "Treinamento", tooltip: "Tipo de onboarding oferecido" },
};

const faqs = [
  {
    question: "Posso trocar de plano a qualquer momento?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será calculado proporcionalmente ao período restante.",
  },
  {
    question: "Existe fidelidade ou multa de cancelamento?",
    answer: "Não. Nossos planos são sem fidelidade. Você pode cancelar a qualquer momento sem multas ou taxas adicionais.",
  },
  {
    question: "O teste grátis inclui todas as funcionalidades?",
    answer: "Sim! Durante os 14 dias de teste, você tem acesso completo ao plano Professional para avaliar todas as funcionalidades.",
  },
  {
    question: "Como funciona o pagamento?",
    answer: "Aceitamos cartão de crédito, boleto bancário e PIX. Para planos anuais, oferecemos parcelamento em até 12x sem juros no cartão.",
  },
  {
    question: "Vocês oferecem desconto para ONGs ou entidades sem fins lucrativos?",
    answer: "Sim! Entre em contato conosco para conhecer nosso programa de descontos especiais para organizações sem fins lucrativos.",
  },
];

const guarantees = [
  { icon: Shield, label: "Garantia de 30 dias", description: "Dinheiro de volta" },
  { icon: Clock, label: "Setup em 24h", description: "Configuração rápida" },
  { icon: Headphones, label: "Suporte em PT-BR", description: "Time local" },
  { icon: Award, label: "99.9% Uptime", description: "Alta disponibilidade" },
];

export default function WebsitePricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <WebsiteLayout>
      <TooltipProvider>
        {/* Hero with Background */}
        <section className="relative py-24 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${resortAerial})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-white" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              Preços Transparentes
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Planos que crescem{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                com seu negócio
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Comece com 14 dias grátis. Sem cartão de crédito. Cancele quando quiser.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <span className={`text-sm ${!isYearly ? "text-white font-medium" : "text-slate-400"}`}>
                Mensal
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-emerald-500"
              />
              <span className={`text-sm ${isYearly ? "text-white font-medium" : "text-slate-400"}`}>
                Anual
              </span>
              {isYearly && (
                <Badge className="bg-emerald-500 text-white border-0">
                  Economize 15%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 bg-white -mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all hover:shadow-2xl ${
                    plan.popular
                      ? "border-blue-500 shadow-xl shadow-blue-500/10 scale-105"
                      : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-4 py-1 shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-8">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-slate-500 text-sm">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6 pb-6 border-b border-slate-100">
                      {plan.monthlyPrice ? (
                        <>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-slate-900">
                              R$ {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                            </span>
                            <span className="text-slate-500">/mês</span>
                          </div>
                          {isYearly && (
                            <p className="text-sm text-emerald-600 mt-2 font-medium">
                              Economia de R$ {(plan.monthlyPrice - plan.yearlyPrice) * 12}/ano
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-3xl font-bold text-slate-900">
                          Sob consulta
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">
                              {featureLabels[key]?.label || key}
                            </span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{featureLabels[key]?.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-medium text-slate-900">
                            {typeof value === "boolean" ? (
                              value ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <X className="w-5 h-5 text-slate-300" />
                              )
                            ) : (
                              value
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link to="/contato">
                      <Button
                        className={`w-full text-lg py-6 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                            : "bg-slate-900 hover:bg-slate-800"
                        }`}
                      >
                        {plan.monthlyPrice ? "Começar Teste Grátis" : "Falar com Vendas"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {guarantees.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-bold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
                FAQ
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2 text-lg">
                      {faq.question}
                    </h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">
                Ainda tem dúvidas? Fale com nosso time.
              </p>
              <Link to="/contato">
                <Button variant="outline" size="lg" className="border-slate-300">
                  Entrar em Contato
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hotelLobby})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Comece seu teste grátis hoje
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              14 dias para experimentar todas as funcionalidades. Sem compromisso.
            </p>
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6"
              >
                Criar Conta Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </TooltipProvider>
    </WebsiteLayout>
  );
}
