import { useState } from "react";
import { ScheduleDemoModal } from "@/components/website/ScheduleDemoModal";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Headphones,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

// Import images
import contactHero from "@/assets/website-contact-hero.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Resposta em até 24h",
    value: "contato@unistays.com.br",
    href: "mailto:contato@unistays.com.br",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Telefone",
    description: "Seg-Sex, 9h às 18h",
    value: "(11) 99999-9999",
    href: "tel:+5511999999999",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    description: "Atendimento rápido",
    value: "(11) 99999-9999",
    href: "https://wa.me/5511999999999",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: MapPin,
    title: "Escritório",
    description: "Visite-nos",
    value: "São Paulo, SP",
    href: "#",
    color: "from-violet-500 to-purple-500",
  },
];

const subjects = [
  { value: "demo", label: "Agendar demonstração" },
  { value: "pricing", label: "Dúvidas sobre preços" },
  { value: "support", label: "Suporte técnico" },
  { value: "partnership", label: "Parcerias" },
  { value: "other", label: "Outro assunto" },
];

const benefits = [
  { icon: Sparkles, label: "Demo personalizada", description: "30 minutos com especialista" },
  { icon: Shield, label: "Sem compromisso", description: "Cancele quando quiser" },
  { icon: Headphones, label: "Suporte em PT-BR", description: "Time 100% brasileiro" },
  { icon: Zap, label: "Setup em 24h", description: "Comece a usar rapidamente" },
];

export default function WebsiteContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  };

  return (
    <WebsiteLayout>
      {/* Hero with Background */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${contactHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              Fale Conosco
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Como podemos{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ajudar?
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Tire suas dúvidas, agende uma demonstração ou fale com nosso time de especialistas.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 bg-white -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="group"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all group-hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <method.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {method.description}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {method.value}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Envie uma mensagem
              </h2>
              <p className="text-slate-600 mb-8">
                Preencha o formulário e nossa equipe entrará em contato.
              </p>

              {submitted ? (
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl">
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Mensagem Enviada!
                    </h3>
                    <p className="text-slate-600 mb-6 text-lg">
                      Obrigado pelo contato. Nossa equipe responderá em até 24 horas úteis.
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSubmitted(false)}
                    >
                      Enviar outra mensagem
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700">Nome completo *</Label>
                          <Input
                            id="name"
                            placeholder="Seu nome"
                            required
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700">Telefone</Label>
                          <Input
                            id="phone"
                            placeholder="(11) 99999-9999"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-slate-700">Nome do hotel/empresa</Label>
                          <Input
                            id="company"
                            placeholder="Hotel Example"
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-700">Assunto *</Label>
                        <Select required>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione um assunto" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-700">Mensagem *</Label>
                        <Textarea
                          id="message"
                          placeholder="Conte-nos mais sobre suas necessidades..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 text-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Agende uma demonstração
              </h2>
              <p className="text-slate-600 mb-8">
                Veja o sistema em ação com nossos especialistas.
              </p>

              <Card className="border-0 shadow-xl mb-8 overflow-hidden">
                <div className="h-48 relative">
                  <img 
                    src={hotelLobby} 
                    alt="Demo" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <Badge className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Demo Gratuita
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 text-xl mb-3">
                    Demo Personalizada de 30 min
                  </h3>
                  <p className="text-slate-600 mb-5">
                    Agende uma demonstração gratuita com um de nossos 
                    especialistas. Mostraremos como o Uni | Stays pode transformar sua operação.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Tour completo pelo sistema",
                      "Análise das suas necessidades",
                      "Resposta a todas as dúvidas",
                      "Proposta personalizada",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-slate-600">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-12" onClick={() => setShowScheduleModal(true)}>
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Agora
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((item) => (
                  <Card key={item.label} className="border-0 shadow-lg">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Hours */}
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">
                    Horário de Atendimento
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta</span>
                    <span className="font-semibold text-slate-900">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado</span>
                    <span className="font-semibold text-slate-900">9:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo</span>
                    <span className="text-slate-400">Fechado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Prefere explorar por conta própria?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Crie sua conta e teste todas as funcionalidades gratuitamente por 14 dias.
          </p>
          <Link to="/login">
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
      <ScheduleDemoModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
    </WebsiteLayout>
  );
}
