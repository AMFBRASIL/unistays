import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Calendar, Clock, User, Search, Tag, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";
import heroDashboard from "@/assets/website-hero-dashboard.jpg";

const categories = ["Todos", "Tecnologia", "Gestão", "Revenue", "Tendências", "Cases", "Dicas"];

const featuredPost = {
  title: "Como a IA está revolucionando a gestão hoteleira em 2024",
  excerpt: "Descubra como inteligência artificial pode automatizar processos, prever demanda e personalizar a experiência dos hóspedes.",
  author: "Mariana Costa",
  date: "28 Fev 2024",
  readTime: "8 min",
  category: "Tecnologia",
  image: heroDashboard,
};

const posts = [
  { title: "10 estratégias de Revenue Management para hotéis", excerpt: "Maximize sua receita com técnicas comprovadas de gestão de tarifas dinâmicas.", author: "Ricardo Santos", date: "25 Fev 2024", readTime: "6 min", category: "Revenue", image: hotelLobby },
  { title: "Guia completo: Check-in digital para hotéis", excerpt: "Implemente check-in sem contato e melhore a experiência dos hóspedes.", author: "Felipe Oliveira", date: "20 Fev 2024", readTime: "5 min", category: "Tecnologia", image: staffTablet },
  { title: "Tendências da hotelaria para 2025", excerpt: "O que esperar do setor hoteleiro nos próximos anos e como se preparar.", author: "Ana Lima", date: "15 Fev 2024", readTime: "7 min", category: "Tendências", image: resortAerial },
  { title: "Como reduzir no-shows em até 40%", excerpt: "Estratégias práticas para diminuir cancelamentos e faltas.", author: "Carlos Eduardo", date: "10 Fev 2024", readTime: "4 min", category: "Gestão", image: hotelLobby },
  { title: "Case: Hotel Florença aumentou receita em 35%", excerpt: "Saiba como a implementação do Uni|Stays transformou a operação.", author: "Julia Ferreira", date: "5 Fev 2024", readTime: "6 min", category: "Cases", image: staffTablet },
  { title: "Automação de e-mail marketing para hotéis", excerpt: "Crie campanhas que convertem com segmentação inteligente.", author: "Mariana Costa", date: "1 Fev 2024", readTime: "5 min", category: "Dicas", image: resortAerial },
];

export default function WebsiteBlog() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><Sparkles className="w-3 h-3 mr-1" /> Blog</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Insights & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Novidades</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Conteúdo exclusivo sobre gestão hoteleira, tecnologia e tendências do setor.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Buscar artigos..." className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c, i) => (
              <Badge key={c} variant={i === 0 ? "default" : "outline"} className="cursor-pointer whitespace-nowrap px-4 py-2">{c}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-blue-100 text-blue-700">{featuredPost.category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{featuredPost.title}</h2>
                <p className="text-slate-500 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" />{featuredPost.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{featuredPost.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{featuredPost.readTime}</span>
                </div>
                <Button className="w-fit">Ler Artigo <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((p) => (
              <Card key={p.title} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{p.category}</Badge>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{p.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">Carregar Mais Artigos</Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Receba nossos conteúdos</h2>
          <p className="text-blue-100 mb-8">Assine nossa newsletter e receba semanalmente os melhores insights do setor hoteleiro.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input placeholder="Seu melhor e-mail" className="bg-white/10 border-white/20 text-white placeholder:text-blue-200" />
            <Button className="bg-white text-blue-600 hover:bg-blue-50">Assinar</Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
