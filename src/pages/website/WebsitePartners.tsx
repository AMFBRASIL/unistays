import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Handshake, ArrowRight, Sparkles, Globe, Users, TrendingUp, Award,
  CheckCircle2, Building2, Zap, DollarSign, BookOpen, Headphones,
} from "lucide-react";
import { Link } from "react-router-dom";
import resortAerial from "@/assets/website-resort-aerial.jpg";

const partnerTypes = [
  { icon: Building2, title: "Revendedores", desc: "Revenda o Uni|Stays e tenha comissões recorrentes para sua base de clientes.", color: "from-blue-500 to-cyan-500", benefits: ["Comissão recorrente de até 30%", "Treinamento completo", "Material de vendas", "Suporte dedicado"] },
  { icon: Zap, title: "Integradores", desc: "Integre suas soluções ao Uni|Stays via API e amplie o ecossistema hoteleiro.", color: "from-violet-500 to-purple-500", benefits: ["API completa e documentada", "Sandbox de testes", "Listagem no marketplace", "Co-marketing"] },
  { icon: BookOpen, title: "Consultores", desc: "Recomende o Uni|Stays aos seus clientes e ganhe por cada indicação.", color: "from-emerald-500 to-teal-500", benefits: ["Bônus por indicação", "Certificação gratuita", "Acesso antecipado", "Rede de parceiros"] },
];

const stats = [
  { value: "200+", label: "Parceiros Ativos" },
  { value: "35%", label: "Receita via Parceiros" },
  { value: "15", label: "Países" },
  { value: "98%", label: "Satisfação" },
];

export default function WebsitePartners() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${resortAerial})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><Handshake className="w-3 h-3 mr-1" /> Parceiros</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Cresça <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">conosco</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Junte-se ao ecossistema Uni|Stays e amplie suas oportunidades de negócio no setor hoteleiro.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                <div className="text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Programas</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Escolha seu programa</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((p) => (
              <Card key={p.title} className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-6`}>
                    <p.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-500 mb-6">{p.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full">Candidatar-se <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para ser um parceiro?</h2>
          <p className="text-emerald-100 text-lg mb-8">Entre em contato e descubra como podemos crescer juntos.</p>
          <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
            <Link to="/contato">Fale Conosco <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </WebsiteLayout>
  );
}
