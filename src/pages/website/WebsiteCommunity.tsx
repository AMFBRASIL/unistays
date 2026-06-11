import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, MessageSquare, ArrowRight, Sparkles, Trophy, Calendar, Star,
  Heart, BookOpen, Video, Globe, Zap, ThumbsUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import resortAerial from "@/assets/website-resort-aerial.jpg";

const channels = [
  { icon: MessageSquare, title: "Fórum de Discussão", desc: "Troque experiências e tire dúvidas com outros hoteleiros.", members: "2.5k", color: "from-blue-500 to-cyan-500" },
  { icon: BookOpen, title: "Base de Conhecimento", desc: "Artigos e tutoriais criados pela comunidade.", members: "500+", color: "from-violet-500 to-purple-500" },
  { icon: Video, title: "Webinars Mensais", desc: "Eventos online com especialistas do setor.", members: "1k+", color: "from-emerald-500 to-teal-500" },
  { icon: Trophy, title: "Programa de Embaixadores", desc: "Torne-se um líder da comunidade e ganhe benefícios.", members: "50", color: "from-orange-500 to-amber-500" },
];

const stats = [
  { value: "5.000+", label: "Membros" },
  { value: "10k+", label: "Discussões" },
  { value: "500+", label: "Artigos" },
  { value: "50+", label: "Eventos/ano" },
];

const recentTopics = [
  { title: "Melhores práticas para Revenue Management em baixa temporada", replies: 34, likes: 89 },
  { title: "Como configurar integrações com Booking.com", replies: 22, likes: 56 },
  { title: "Dicas de automação para check-in digital", replies: 18, likes: 45 },
  { title: "Case: Como aumentamos o RevPAR em 25%", replies: 41, likes: 112 },
  { title: "Novidades do módulo de IA - Março 2024", replies: 15, likes: 67 },
];

export default function WebsiteCommunity() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${resortAerial})`, backgroundSize: "cover" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30"><Users className="w-3 h-3 mr-1" /> Comunidade</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Conecte-se com <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">hoteleiros</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Faça parte da maior comunidade de profissionais de hotelaria do Brasil.
          </p>
          <Button size="lg" className="bg-violet-500 hover:bg-violet-600">Participar da Comunidade <ArrowRight className="w-4 h-4 ml-2" /></Button>
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

      {/* Channels */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Espaços da Comunidade</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {channels.map((c) => (
              <Card key={c.title} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mx-auto mb-4`}>
                    <c.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{c.desc}</p>
                  <span className="text-xs text-slate-400">{c.members} membros</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Topics */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Discussões em Alta</h2>
          <div className="space-y-3">
            {recentTopics.map((t) => (
              <Card key={t.title} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <MessageSquare className="w-5 h-5 text-violet-500 flex-shrink-0" />
                  <span className="flex-1 text-slate-700 group-hover:text-violet-600 transition-colors">{t.title}</span>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t.replies}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{t.likes}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Faça parte da comunidade</h2>
          <p className="text-violet-100 text-lg mb-8">Cadastre-se gratuitamente e comece a trocar experiências.</p>
          <Button size="lg" className="bg-white text-violet-600 hover:bg-violet-50">Criar Conta Gratuita <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      </section>
    </WebsiteLayout>
  );
}
