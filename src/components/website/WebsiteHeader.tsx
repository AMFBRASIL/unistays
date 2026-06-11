import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Layers, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const features = [
  { title: "Reservas", description: "Gestão completa de reservas", href: "/features#reservas" },
  { title: "Ocupação", description: "Mapa de ocupação em tempo real", href: "/features#ocupacao" },
  { title: "Financeiro", description: "Controle financeiro integrado", href: "/features#financeiro" },
  { title: "CRM", description: "Gestão de relacionamento", href: "/features#crm" },
  { title: "Integrações", description: "Channel managers e APIs", href: "/features#integracoes" },
  { title: "IA & Automação", description: "Inteligência artificial", href: "/features#ia" },
];

export function WebsiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Uni<span className="text-blue-600 mx-1">|</span>Stays
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-slate-100 data-[state=open]:bg-slate-100">
                    Recursos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {features.map((feature) => (
                        <li key={feature.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={feature.href}
                              className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                            >
                              <div className="text-sm font-medium leading-none text-slate-900">
                                {feature.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                                {feature.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/pricing"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
                        isActive("/pricing") && "bg-slate-100"
                      )}
                    >
                      Preços
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/screenshots"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
                        isActive("/screenshots") && "bg-slate-100"
                      )}
                    >
                      Screenshots
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/videos"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
                        isActive("/videos") && "bg-slate-100"
                      )}
                    >
                      Vídeos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/contato"
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
                        isActive("/contato") && "bg-slate-100"
                      )}
                    >
                      Contato
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Entrar
              </Button>
            </Link>
            <Link to="/contato">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50">
            <div className="flex flex-col gap-2">
              <Link
                to="/features"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link
                to="/pricing"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </Link>
              <Link
                to="/screenshots"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Screenshots
              </Link>
              <Link
                to="/videos"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vídeos
              </Link>
              <Link
                to="/contato"
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </Link>
              <div className="border-t border-slate-200/50 mt-2 pt-4 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/contato" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
