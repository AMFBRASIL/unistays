import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Activity, Clock, Globe, Server, Database, Zap, Shield } from "lucide-react";

const services = [
  { name: "Plataforma PMS", status: "operational", uptime: "99.99%", icon: Server },
  { name: "API REST", status: "operational", uptime: "99.98%", icon: Zap },
  { name: "Booking Engine", status: "operational", uptime: "99.99%", icon: Globe },
  { name: "Banco de Dados", status: "operational", uptime: "99.99%", icon: Database },
  { name: "Channel Manager", status: "operational", uptime: "99.97%", icon: Activity },
  { name: "Autenticação", status: "operational", uptime: "99.99%", icon: Shield },
];

const incidents = [
  { date: "25 Fev 2024", title: "Manutenção programada - API", desc: "Atualização de infraestrutura concluída com sucesso.", status: "resolved", duration: "15 min" },
  { date: "18 Fev 2024", title: "Lentidão no Channel Manager", desc: "Latência elevada resolvida com escalonamento automático.", status: "resolved", duration: "8 min" },
  { date: "10 Fev 2024", title: "Manutenção programada - Database", desc: "Migração de banco de dados sem downtime.", status: "resolved", duration: "0 min" },
];

const uptimeDays = Array.from({ length: 90 }, (_, i) => ({ day: i, status: Math.random() > 0.02 ? "up" : "partial" }));

const statusConfig = {
  operational: { icon: CheckCircle2, label: "Operacional", className: "text-emerald-500" },
  degraded: { icon: AlertTriangle, label: "Degradado", className: "text-amber-500" },
  down: { icon: XCircle, label: "Fora do Ar", className: "text-red-500" },
};

export default function WebsiteStatus() {
  return (
    <WebsiteLayout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-6 py-3 mb-8">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Todos os sistemas operacionais</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Status do Sistema</h1>
          <p className="text-slate-300 text-lg">Monitoramento em tempo real de todos os serviços Uni|Stays.</p>
        </div>
      </section>

      {/* Uptime Bar */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Uptime dos últimos 90 dias</h3>
            <span className="text-sm text-emerald-600 font-semibold">99.98%</span>
          </div>
          <div className="flex gap-0.5">
            {uptimeDays.map((d, i) => (
              <div key={i} className={`flex-1 h-8 rounded-sm ${d.status === "up" ? "bg-emerald-400" : "bg-amber-400"}`} title={`Dia ${90 - i}`} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>90 dias atrás</span>
            <span>Hoje</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Serviços</h2>
          <div className="space-y-3">
            {services.map((s) => {
              const config = statusConfig[s.status as keyof typeof statusConfig];
              return (
                <Card key={s.name} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <s.icon className="w-5 h-5 text-slate-400" />
                    <span className="flex-1 font-medium text-slate-900">{s.name}</span>
                    <span className="text-sm text-slate-400">{s.uptime}</span>
                    <div className={`flex items-center gap-1.5 ${config.className}`}>
                      <config.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Incidentes Recentes</h2>
          <div className="space-y-4">
            {incidents.map((inc) => (
              <Card key={inc.title} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900">{inc.title}</h3>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Resolvido</Badge>
                  </div>
                  <p className="text-slate-500 text-sm mb-2">{inc.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{inc.date}</span>
                    <span>Duração: {inc.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
