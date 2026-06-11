import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";

const sections = [
  { title: "1. Aceitação dos Termos", content: "Ao acessar ou utilizar os serviços da Uni|Stays, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá acessar ou utilizar nossos serviços." },
  { title: "2. Descrição do Serviço", content: "A Uni|Stays é uma plataforma de gestão hoteleira (PMS) que oferece ferramentas para gerenciamento de reservas, operações, finanças, comunicação e análise de dados. O serviço é fornecido como SaaS (Software as a Service) mediante assinatura." },
  { title: "3. Cadastro e Conta", content: "Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta." },
  { title: "4. Planos e Pagamento", content: "Os serviços estão disponíveis em diferentes planos de assinatura. Os preços e funcionalidades de cada plano estão descritos em nossa página de preços. O pagamento é cobrado mensalmente ou anualmente, conforme o plano escolhido." },
  { title: "5. Uso Aceitável", content: "Você concorda em utilizar nossos serviços apenas para fins legais e de acordo com estes termos. É proibido: usar o serviço para atividades ilegais; tentar acessar dados de outros usuários; realizar engenharia reversa; sobrecarregar intencionalmente a infraestrutura." },
  { title: "6. Propriedade Intelectual", content: "Todo o conteúdo, design, código-fonte e tecnologia da Uni|Stays são de propriedade exclusiva da empresa e protegidos por leis de propriedade intelectual. Sua assinatura concede uma licença limitada e não exclusiva de uso." },
  { title: "7. Limitação de Responsabilidade", content: "A Uni|Stays não será responsável por danos indiretos, incidentais, especiais ou consequentes resultantes do uso ou incapacidade de uso dos serviços. Nossa responsabilidade total não excederá o valor pago nos últimos 12 meses." },
  { title: "8. Rescisão", content: "Qualquer das partes pode rescindir estes termos a qualquer momento. Após a rescisão, seu acesso aos serviços será encerrado. Dados serão mantidos por 30 dias para backup, após o qual serão permanentemente excluídos." },
  { title: "9. Lei Aplicável", content: "Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo, SP." },
];

export default function WebsiteTerms() {
  return (
    <WebsiteLayout>
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30"><FileText className="w-3 h-3 mr-1" /> Legal</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Termos de Uso</h1>
          <p className="text-slate-300 flex items-center justify-center gap-2"><Calendar className="w-4 h-4" /> Última atualização: 1 de Março de 2024</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <p className="text-slate-600 text-lg mb-8">Leia atentamente estes Termos de Uso antes de utilizar os serviços da Uni|Stays.</p>
          {sections.map((s) => (
            <div key={s.title} className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h2>
              <p className="text-slate-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl">
            <h3 className="font-bold text-slate-900 mb-2">Dúvidas sobre os Termos?</h3>
            <p className="text-slate-600">Entre em contato pelo e-mail <a href="mailto:juridico@unistays.com.br" className="text-blue-600 hover:underline">juridico@unistays.com.br</a>.</p>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
