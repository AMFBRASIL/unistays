import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2, Users, Globe, Award, Target, Heart, Rocket, Shield,
  CheckCircle2, ArrowRight, Sparkles, Star, Calendar, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import resortAerial from "@/assets/website-resort-aerial.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";

const timeline = [
  { year: "2020", title: "Fundação", desc: "Início da jornada com a visão de unificar a gestão hoteleira." },
  { year: "2021", title: "Primeiro Cliente", desc: "Lançamento do MVP e parceria com hotéis independentes." },
  { year: "2022", title: "Expansão", desc: "100+ hotéis na plataforma e lançamento do módulo de IA." },
  { year: "2023", title: "Série A", desc: "Captação de investimento e expansão para América Latina." },
  { year: "2024", title: "Líder de Mercado", desc: "500+ propriedades e reconhecimento como melhor PMS do Brasil." },
];

const values = [
  { icon: Target, title: "Inovação", desc: "Buscamos constantemente novas tecnologias para transformar a hotelaria.", color: "from-blue-500 to-cyan-500" },
  { icon: Heart, title: "Paixão", desc: "Amamos o que fazemos e isso se reflete em cada detalhe do produto.", color: "from-rose-500 to-pink-500" },
  { icon: Users, title: "Colaboração", desc: "Trabalhamos juntos, com nossos clientes e parceiros, para crescer.", color: "from-violet-500 to-purple-500" },
  { icon: Shield, title: "Confiança", desc: "Segurança e transparência são pilares inegociáveis da nossa operação.", color: "from-emerald-500 to-teal-500" },
];

const team = [
  { name: "Ricardo Santos", role: "CEO & Co-Founder", img: "RS" },
  { name: "Mariana Costa", role: "CTO & Co-Founder", img: "MC" },
  { name: "Felipe Oliveira", role: "VP de Produto", img: "FO" },
  { name: "Ana Beatriz Lima", role: "VP de Vendas", img: "AL" },
  { name: "Carlos Eduardo", role: "Head de Engenharia", img: "CE" },
  { name: "Julia Ferreira", role: "Head de Customer Success", img: "JF" },
];

const stats = [
  { value: "500+", label: "Hotéis Ativos", icon: Building2 },
  { value: "50+", label: "Colaboradores", icon: Users },
  { value: "15", label: "Países", icon: Globe },
  { value: "12", label: "Prêmios", icon: Award },
];

export default function WebsiteAbout() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${resortAerial})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
            <Sparkles className="w-3 h-3 mr-1" /> Nossa História
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transformando a <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Hotelaria</span> com Tecnologia
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Somos uma equipe apaixonada por criar soluções que simplificam a gestão hoteleira e elevam a experiência dos hóspedes.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                <div className="text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Nossa Missão</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Democratizar a tecnologia hoteleira</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Acreditamos que todo hotel, independente do tamanho, merece acesso a ferramentas de gestão de classe mundial. Nossa missão é criar uma plataforma unificada que elimine a complexidade e potencialize resultados.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Combinamos inteligência artificial, automação e design intuitivo para que hoteleiros possam focar no que realmente importa: a experiência dos seus hóspedes.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={hotelLobby} alt="Hotel lobby" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">Nossos Valores</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">O que nos guia</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <Card key={v.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mx-auto mb-4`}>
                    <v.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-sm">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">Linha do Tempo</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Nossa Jornada</h2>
          </div>
          <div className="space-y-8">
            {timeline.map((t, i) => (
              <div key={t.year} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{t.year}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold text-slate-900">{t.title}</h3>
                  <p className="text-slate-500 mt-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">Liderança</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Nosso Time</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((t) => (
              <Card key={t.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{t.img}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                  <p className="text-slate-500">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Quer fazer parte dessa história?</h2>
          <p className="text-blue-100 text-lg mb-8">Estamos sempre buscando talentos incríveis para nosso time.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/carreiras">Ver Vagas <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/contato">Fale Conosco</Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
