import { Link } from "react-router-dom";
import { Layers, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Recursos", href: "/features" },
    { label: "Preços", href: "/pricing" },
    { label: "Screenshots", href: "/screenshots" },
    { label: "Vídeos", href: "/videos" },
    { label: "Integrações", href: "/features#integracoes" },
  ],
  empresa: [
    { label: "Sobre Nós", href: "/sobre-nos" },
    { label: "Blog", href: "/blog" },
    { label: "Carreiras", href: "/carreiras" },
    { label: "Parceiros", href: "/parceiros" },
    { label: "Contato", href: "/contato" },
  ],
  suporte: [
    { label: "Central de Ajuda", href: "/central-de-ajuda" },
    { label: "Documentação", href: "/documentacao" },
    { label: "API", href: "/api" },
    { label: "Status", href: "/status" },
    { label: "Comunidade", href: "/comunidade" },
  ],
  legal: [
    { label: "Privacidade", href: "/privacidade" },
    { label: "Termos de Uso", href: "/termos-de-uso" },
    { label: "Cookies", href: "/cookies" },
    { label: "LGPD", href: "/lgpd" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function WebsiteFooter() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Uni<span className="text-blue-400 mx-1">|</span>Stays</span>
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              O sistema unificado de gestão hoteleira. Todas as ferramentas que você precisa em uma única plataforma inteligente.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:contato@hotelflow.com.br"
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                contato@hotelflow.com.br
              </a>
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                São Paulo, SP - Brasil
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Suporte</h4>
            <ul className="space-y-3">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Uni|Stays. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
