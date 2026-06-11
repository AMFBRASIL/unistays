import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, BookOpen, MessageSquare, Video, FileText, ArrowRight, Sparkles,
  Calendar, CreditCard, Settings, Users, BarChart3, Shield, HelpCircle,
  ChevronRight, Headphones, Mail, Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { icon: Calendar, title: "Reservas", desc: "Gestão de reservas, check-in e check-out.", articles: 24, color: "from-blue-500 to-cyan-500" },
  { icon: CreditCard, title: "Financeiro", desc: "Faturamento, pagamentos e relatórios.", articles: 18, color: "from-emerald-500 to-teal-500" },
  { icon: Settings, title: "Configurações", desc: "Configuração da plataforma e preferências.", articles: 15, color: "from-violet-500 to-purple-500" },
  { icon: Users, title: "Hóspedes & CRM", desc: "Gestão de hóspedes e relacionamento.", articles: 12, color: "from-orange-500 to-amber-500" },
  { icon: BarChart3, title: "Relatórios", desc: "Dashboards, análises e exportações.", articles: 20, color: "from-rose-500 to-pink-500" },
  { icon: Shield, title: "Segurança", desc: "Permissões, acessos e proteção de dados.", articles: 10, color: "from-indigo-500 to-blue-500" },
];

const popularArticles = [
  "Como criar uma nova reserva",
  "Configurar tarifas dinâmicas",
  "Integrar com Booking.com",
  "Gerar relatório de ocupação",
  "Configurar check-in automático",
  "Gerenciar permissões de usuários",
];

export default function WebsiteHelp() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><HelpCircle className="w-3 h-3 mr-1" /> Central de Ajuda</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Como podemos ajudar?</h1>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Buscar artigos, tutoriais e FAQs..." className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Explorar por Categoria</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Card key={c.title} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
                    <c.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{c.title}</h3>
                    <p className="text-slate-500 text-sm mb-2">{c.desc}</p>
                    <span className="text-xs text-slate-400">{c.articles} artigos</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Artigos Populares</h2>
          <div className="space-y-3">
            {popularArticles.map((a) => (
              <Card key={a} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="flex-1 text-slate-700 group-hover:text-blue-600 transition-colors">{a}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <Video className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Vídeo Tutoriais</h3>
                <p className="text-slate-500 text-sm mb-4">Aprenda visualmente com tutoriais passo a passo.</p>
                <Button variant="outline" asChild><Link to="/videos">Assistir <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <BookOpen className="w-10 h-10 text-violet-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Documentação</h3>
                <p className="text-slate-500 text-sm mb-4">Documentação técnica completa e atualizada.</p>
                <Button variant="outline" asChild><Link to="/documentacao">Explorar <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <MessageSquare className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">Comunidade</h3>
                <p className="text-slate-500 text-sm mb-4">Conecte-se com outros hoteleiros e troque experiências.</p>
                <Button variant="outline" asChild><Link to="/comunidade">Participar <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Headphones className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Precisa de mais ajuda?</h2>
          <p className="text-blue-100 text-lg mb-8">Nossa equipe de suporte está disponível para ajudar você.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"><Mail className="w-4 h-4 mr-2" /> Enviar Email</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10"><Phone className="w-4 h-4 mr-2" /> Ligar</Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
