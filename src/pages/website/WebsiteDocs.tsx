import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, BookOpen, Code2, Database, Shield, Zap, ArrowRight, Sparkles,
  FileText, ChevronRight, Rocket, Settings, Globe,
} from "lucide-react";

const sections = [
  { icon: Rocket, title: "Guia de Início Rápido", desc: "Configure o Uni|Stays em minutos.", articles: 8, color: "from-blue-500 to-cyan-500" },
  { icon: BookOpen, title: "Guia do Usuário", desc: "Aprenda a usar todas as funcionalidades.", articles: 45, color: "from-violet-500 to-purple-500" },
  { icon: Code2, title: "API Reference", desc: "Documentação completa da REST API.", articles: 30, color: "from-emerald-500 to-teal-500" },
  { icon: Database, title: "Integrações", desc: "Conecte com OTAs, gateways e mais.", articles: 22, color: "from-orange-500 to-amber-500" },
  { icon: Shield, title: "Segurança", desc: "Boas práticas e conformidade.", articles: 12, color: "from-rose-500 to-pink-500" },
  { icon: Settings, title: "Administração", desc: "Configuração avançada do sistema.", articles: 18, color: "from-indigo-500 to-blue-500" },
];

const recentUpdates = [
  { title: "Novo módulo de Yield Management", date: "28 Fev 2024", type: "Novo" },
  { title: "API v3.2 - Endpoints de Grupos", date: "25 Fev 2024", type: "Atualização" },
  { title: "Integração com Google Hotel Ads", date: "20 Fev 2024", type: "Novo" },
  { title: "Melhorias no Channel Manager", date: "15 Fev 2024", type: "Atualização" },
];

export default function WebsiteDocs() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><BookOpen className="w-3 h-3 mr-1" /> Documentação</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Documentação Técnica</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">Tudo que você precisa para configurar, integrar e aproveitar ao máximo o Uni|Stays.</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Buscar na documentação..." className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((s) => (
              <Card key={s.title} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{s.desc}</p>
                  <span className="text-xs text-slate-400">{s.articles} artigos</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Atualizações Recentes</h2>
          <div className="space-y-3">
            {recentUpdates.map((u) => (
              <Card key={u.title} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <Badge variant={u.type === "Novo" ? "default" : "secondary"} className="text-xs">{u.type}</Badge>
                  <span className="flex-1 text-slate-700 group-hover:text-blue-600 transition-colors">{u.title}</span>
                  <span className="text-sm text-slate-400">{u.date}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
