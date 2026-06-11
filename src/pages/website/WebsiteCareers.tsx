import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Rocket, MapPin, Clock, ArrowRight, Sparkles, Heart, Code2, Palette,
  BarChart3, Headphones, Building2, Users, Coffee, Dumbbell, GraduationCap, Plane,
} from "lucide-react";
import { Link } from "react-router-dom";
import staffTablet from "@/assets/website-staff-tablet.jpg";

const benefits = [
  { icon: Coffee, title: "Trabalho Remoto", desc: "Trabalhe de onde quiser, com flexibilidade total." },
  { icon: Dumbbell, title: "Saúde & Bem-estar", desc: "Plano de saúde, Gympass e acompanhamento psicológico." },
  { icon: GraduationCap, title: "Educação", desc: "Budget anual para cursos, conferências e certificações." },
  { icon: Plane, title: "Férias Flexíveis", desc: "Day-offs ilimitados e política de férias flexíveis." },
  { icon: Heart, title: "Stock Options", desc: "Participe do crescimento da empresa como sócio." },
  { icon: Rocket, title: "Crescimento", desc: "Plano de carreira claro e mentoria personalizada." },
];

const openings = [
  { title: "Senior Full-Stack Engineer", dept: "Engenharia", location: "Remoto", type: "Full-time", icon: Code2, color: "from-blue-500 to-cyan-500" },
  { title: "Product Designer", dept: "Design", location: "Remoto", type: "Full-time", icon: Palette, color: "from-violet-500 to-purple-500" },
  { title: "Data Analyst", dept: "Dados", location: "São Paulo / Remoto", type: "Full-time", icon: BarChart3, color: "from-emerald-500 to-teal-500" },
  { title: "Customer Success Manager", dept: "Customer Success", location: "São Paulo", type: "Full-time", icon: Headphones, color: "from-orange-500 to-amber-500" },
  { title: "Account Executive", dept: "Vendas", location: "São Paulo / Remoto", type: "Full-time", icon: Building2, color: "from-rose-500 to-pink-500" },
  { title: "DevOps Engineer", dept: "Infraestrutura", location: "Remoto", type: "Full-time", icon: Code2, color: "from-indigo-500 to-blue-500" },
];

export default function WebsiteCareers() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${staffTablet})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30"><Sparkles className="w-3 h-3 mr-1" /> Carreiras</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Construa o futuro da <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">hotelaria</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Junte-se a um time de pessoas incríveis que estão transformando a indústria hoteleira com tecnologia de ponta.
          </p>
          <div className="flex items-center justify-center gap-6 text-slate-300">
            <span className="flex items-center gap-2"><Users className="w-5 h-5" /> 50+ pessoas</span>
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Remote-first</span>
            <span className="flex items-center gap-2"><Rocket className="w-5 h-5" /> Startup stage</span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200">Benefícios</Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Por que trabalhar conosco</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <Card key={b.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-500 text-sm">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Vagas Abertas</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Encontre sua próxima oportunidade</h2>
          </div>
          <div className="space-y-4">
            {openings.map((o) => (
              <Card key={o.title} className="border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${o.color} flex items-center justify-center flex-shrink-0`}>
                    <o.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{o.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>{o.dept}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{o.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Não encontrou sua vaga?</h2>
          <p className="text-violet-100 text-lg mb-8">Envie seu currículo para nosso banco de talentos. Estamos sempre buscando pessoas incríveis.</p>
          <Button size="lg" className="bg-white text-violet-600 hover:bg-violet-50">Enviar Currículo <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      </section>
    </WebsiteLayout>
  );
}
