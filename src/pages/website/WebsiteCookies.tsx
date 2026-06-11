import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Calendar, CheckCircle2, Settings, BarChart3, Target } from "lucide-react";

const cookieTypes = [
  { icon: CheckCircle2, title: "Cookies Essenciais", desc: "Necessários para o funcionamento básico do site. Não podem ser desativados.", examples: ["Sessão de login", "Preferências de idioma", "Token CSRF"], required: true, color: "from-emerald-500 to-teal-500" },
  { icon: BarChart3, title: "Cookies Analíticos", desc: "Nos ajudam a entender como os visitantes usam o site.", examples: ["Google Analytics", "Hotjar", "Métricas de performance"], required: false, color: "from-blue-500 to-cyan-500" },
  { icon: Settings, title: "Cookies Funcionais", desc: "Permitem funcionalidades personalizadas como chat ao vivo.", examples: ["Intercom", "Preferências de tema", "Configurações de notificação"], required: false, color: "from-violet-500 to-purple-500" },
  { icon: Target, title: "Cookies de Marketing", desc: "Usados para exibir anúncios relevantes para você.", examples: ["Google Ads", "Facebook Pixel", "LinkedIn Insight"], required: false, color: "from-orange-500 to-amber-500" },
];

export default function WebsiteCookies() {
  return (
    <WebsiteLayout>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><Cookie className="w-3 h-3 mr-1" /> Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Política de Cookies</h1>
          <p className="text-slate-300 flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> Última atualização: 1 de Março de 2024</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none mb-12">
            <p className="text-slate-600 text-lg">Esta política explica como a Uni|Stays utiliza cookies e tecnologias semelhantes para reconhecer você quando visita nosso site e utiliza nossos serviços.</p>
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">O que são Cookies?</h2>
            <p className="text-slate-600">Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site. Eles são amplamente utilizados para fazer sites funcionarem de forma eficiente e fornecer informações aos proprietários do site.</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-8">Tipos de Cookies que Utilizamos</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {cookieTypes.map((c) => (
              <Card key={c.title} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                      <c.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{c.title}</h3>
                      {c.required && <Badge className="bg-emerald-100 text-emerald-700 text-xs">Obrigatório</Badge>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-3">{c.desc}</p>
                  <ul className="space-y-1">
                    {c.examples.map((e) => (
                      <li key={e} className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-300" />{e}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl prose prose-slate max-w-none">
            <h3 className="font-bold text-slate-900 mb-2">Como Gerenciar Cookies</h3>
            <p className="text-slate-600">Você pode controlar e gerenciar cookies através das configurações do seu navegador. A maioria dos navegadores permite que você recuse cookies, exclua cookies existentes e configure alertas antes de aceitar cookies. Note que desativar cookies essenciais pode afetar a funcionalidade do site.</p>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
