import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code2, ArrowRight, Sparkles, Zap, Shield, Globe, Database, Key,
  CheckCircle2, Terminal, FileJson, Webhook, Clock, BarChart3,
} from "lucide-react";

const endpoints = [
  { method: "GET", path: "/api/v3/reservations", desc: "Listar reservas com filtros", color: "bg-emerald-100 text-emerald-700" },
  { method: "POST", path: "/api/v3/reservations", desc: "Criar nova reserva", color: "bg-blue-100 text-blue-700" },
  { method: "GET", path: "/api/v3/rooms", desc: "Listar quartos e disponibilidade", color: "bg-emerald-100 text-emerald-700" },
  { method: "PUT", path: "/api/v3/rooms/:id/status", desc: "Atualizar status do quarto", color: "bg-orange-100 text-orange-700" },
  { method: "GET", path: "/api/v3/guests", desc: "Buscar hóspedes", color: "bg-emerald-100 text-emerald-700" },
  { method: "POST", path: "/api/v3/payments", desc: "Registrar pagamento", color: "bg-blue-100 text-blue-700" },
];

const features = [
  { icon: Zap, title: "Alta Performance", desc: "Latência média de 50ms com rate limiting inteligente.", color: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "OAuth 2.0", desc: "Autenticação segura com tokens JWT e refresh tokens.", color: "from-emerald-500 to-teal-500" },
  { icon: Webhook, title: "Webhooks", desc: "Eventos em tempo real para integrações reativas.", color: "from-violet-500 to-purple-500" },
  { icon: FileJson, title: "REST + GraphQL", desc: "Suporte a ambos os padrões para máxima flexibilidade.", color: "from-orange-500 to-amber-500" },
];

const sdks = [
  { lang: "JavaScript", code: "npm install @unistays/sdk" },
  { lang: "Python", code: "pip install unistays" },
  { lang: "PHP", code: "composer require unistays/sdk" },
  { lang: "Ruby", code: "gem install unistays" },
];

export default function WebsiteAPI() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><Code2 className="w-3 h-3 mr-1" /> API</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            API <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Developer</span> Friendly
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            REST API robusta e bem documentada. Integre o Uni|Stays com qualquer sistema em minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">Começar Agora <ArrowRight className="w-4 h-4 ml-2" /></Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Ver Referência</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mx-auto mb-4`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Endpoints</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Principais Endpoints</h2>
          </div>
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {endpoints.map((e, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 ${i !== endpoints.length - 1 ? "border-b border-slate-100" : ""} hover:bg-slate-50 cursor-pointer transition-colors`}>
                  <Badge className={`${e.color} font-mono text-xs w-16 justify-center`}>{e.method}</Badge>
                  <code className="text-sm text-slate-700 font-mono flex-1">{e.path}</code>
                  <span className="text-sm text-slate-400 hidden sm:block">{e.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">SDKs</Badge>
            <h2 className="text-3xl font-bold text-slate-900">SDKs Oficiais</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {sdks.map((s) => (
              <Card key={s.lang} className="border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="font-bold text-slate-900 mb-2">{s.lang}</div>
                  <div className="bg-slate-900 rounded-lg p-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <code className="text-emerald-400 text-sm">{s.code}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Key className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para integrar?</h2>
          <p className="text-slate-300 text-lg mb-8">Crie sua API key gratuitamente e comece a integrar agora.</p>
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">Criar API Key <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      </section>
    </WebsiteLayout>
  );
}
