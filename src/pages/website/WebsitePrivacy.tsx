import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar } from "lucide-react";

const sections = [
  { title: "1. Informações que Coletamos", content: "Coletamos informações que você nos fornece diretamente, como nome, e-mail, telefone e dados de pagamento ao criar uma conta ou contratar nossos serviços. Também coletamos dados de uso automaticamente, incluindo endereço IP, tipo de navegador, páginas visitadas e horários de acesso." },
  { title: "2. Como Usamos suas Informações", content: "Utilizamos suas informações para: fornecer e melhorar nossos serviços; processar transações e enviar notificações; personalizar sua experiência; enviar comunicações de marketing (com seu consentimento); cumprir obrigações legais e regulatórias; proteger contra fraudes e atividades maliciosas." },
  { title: "3. Compartilhamento de Dados", content: "Não vendemos suas informações pessoais. Compartilhamos dados apenas com: prestadores de serviço que nos auxiliam na operação; parceiros de pagamento para processamento de transações; autoridades quando exigido por lei; em caso de fusão ou aquisição, com as devidas proteções." },
  { title: "4. Segurança dos Dados", content: "Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia em trânsito e em repouso, controles de acesso rigorosos, monitoramento contínuo e backups regulares. Seguimos as melhores práticas da indústria (ISO 27001, SOC 2)." },
  { title: "5. Retenção de Dados", content: "Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Dados de conta são mantidos enquanto a conta estiver ativa. Após encerramento, os dados são retidos por até 5 anos para fins legais, sendo anonimizados ou excluídos após este período." },
  { title: "6. Seus Direitos", content: "Você tem direito a: acessar seus dados pessoais; solicitar correção de dados incorretos; solicitar a exclusão de seus dados; portabilidade dos dados; revogar consentimento a qualquer momento; opor-se ao tratamento de dados. Para exercer seus direitos, entre em contato pelo e-mail privacidade@unistays.com.br." },
  { title: "7. Cookies", content: "Utilizamos cookies essenciais para o funcionamento do site, cookies analíticos para entender o uso e cookies de marketing (com seu consentimento). Você pode gerenciar suas preferências de cookies a qualquer momento através das configurações do navegador." },
  { title: "8. Alterações nesta Política", content: "Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas por e-mail ou aviso na plataforma. A data da última atualização será sempre indicada no topo desta página." },
];

export default function WebsitePrivacy() {
  return (
    <WebsiteLayout>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><Shield className="w-3 h-3 mr-1" /> Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Política de Privacidade</h1>
          <p className="text-slate-300 flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> Última atualização: 1 de Março de 2024</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <p className="text-slate-600 text-lg mb-8">A Uni|Stays ("nós", "nosso") está comprometida em proteger sua privacidade. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.</p>
          {sections.map((s) => (
            <div key={s.title} className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h2>
              <p className="text-slate-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl">
            <h3 className="font-bold text-slate-900 mb-2">Dúvidas?</h3>
            <p className="text-slate-600">Entre em contato pelo e-mail <a href="mailto:privacidade@unistays.com.br" className="text-blue-600 hover:underline">privacidade@unistays.com.br</a> ou pelo telefone (11) 99999-9999.</p>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
