import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, Calendar, CheckCircle2, ArrowRight, Lock, Eye, Trash2,
  Download, UserCheck, Bell, FileText, Scale,
} from "lucide-react";
import { Link } from "react-router-dom";

const rights = [
  { icon: Eye, title: "Acesso", desc: "Você pode solicitar uma cópia de todos os dados pessoais que mantemos sobre você." },
  { icon: FileText, title: "Correção", desc: "Você pode solicitar a correção de dados pessoais incorretos ou incompletos." },
  { icon: Trash2, title: "Exclusão", desc: "Você pode solicitar a exclusão de seus dados pessoais quando não houver mais necessidade." },
  { icon: Download, title: "Portabilidade", desc: "Você pode solicitar a transferência de seus dados para outro fornecedor." },
  { icon: UserCheck, title: "Consentimento", desc: "Você pode revogar seu consentimento para o tratamento de dados a qualquer momento." },
  { icon: Bell, title: "Oposição", desc: "Você pode se opor ao tratamento de dados pessoais em determinadas situações." },
];

const measures = [
  "Criptografia AES-256 em repouso e TLS 1.3 em trânsito",
  "Controle de acesso baseado em funções (RBAC)",
  "Monitoramento 24/7 com detecção de anomalias",
  "Backups automáticos com retenção configurável",
  "Testes de penetração trimestrais",
  "Treinamento regular de segurança para colaboradores",
  "Data Processing Agreement (DPA) com fornecedores",
  "Registro de atividades de tratamento (ROPA)",
];

export default function WebsiteLGPD() {
  return (
    <WebsiteLayout>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><Shield className="w-3 h-3 mr-1" /> LGPD</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Conformidade com a LGPD</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            A Uni|Stays está em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Nosso Compromisso</h2>
          <p className="text-slate-600 text-lg">
            A proteção de dados pessoais é uma prioridade na Uni|Stays. Implementamos processos, tecnologias e políticas para garantir que todos os dados são tratados de forma ética, transparente e em conformidade com a LGPD.
          </p>
          <p className="text-slate-600">
            Nosso Encarregado de Proteção de Dados (DPO) é responsável por supervisionar nossa estratégia de privacidade e pode ser contatado a qualquer momento pelo e-mail <a href="mailto:dpo@unistays.com.br" className="text-blue-600 hover:underline">dpo@unistays.com.br</a>.
          </p>
        </div>
      </section>

      {/* Rights */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Seus Direitos</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Direitos do Titular de Dados</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((r) => (
              <Card key={r.title} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                    <r.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{r.title}</h3>
                  <p className="text-slate-500 text-sm">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">Segurança</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Medidas de Proteção</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {measures.map((m) => (
              <div key={m} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 text-sm">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Lock className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Exercer seus direitos</h2>
          <p className="text-emerald-100 text-lg mb-8">Entre em contato com nosso DPO para exercer qualquer um de seus direitos como titular de dados.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              <Link to="/contato">Falar com o DPO <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/privacidade">Ver Política de Privacidade</Link>
            </Button>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
