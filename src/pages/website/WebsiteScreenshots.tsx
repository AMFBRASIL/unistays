import { useState } from "react";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  CreditCard,
  MessageSquare,
  Building2,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ZoomIn,
  Monitor,
  Sparkles,
} from "lucide-react";

// Import images
import heroDashboard from "@/assets/website-hero-dashboard.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";
import featuresHero from "@/assets/website-features-hero.jpg";

const screenshots = [
  {
    id: 1,
    title: "Dashboard Principal",
    description: "Visão geral completa com métricas em tempo real, gráficos de ocupação e receita",
    category: "Dashboard",
    icon: BarChart3,
    image: heroDashboard,
  },
  {
    id: 2,
    title: "Mapa de Ocupação",
    description: "Timeline visual com arrastar e soltar para gestão de reservas",
    category: "Reservas",
    icon: Calendar,
    image: featuresHero,
  },
  {
    id: 3,
    title: "Gestão de Quartos",
    description: "Visualização em grid ou lista com status em tempo real",
    category: "Operacional",
    icon: Building2,
    image: hotelLobby,
  },
  {
    id: 4,
    title: "Módulo Financeiro",
    description: "Faturamento, contas a pagar/receber e relatórios fiscais",
    category: "Financeiro",
    icon: CreditCard,
    image: staffTablet,
  },
  {
    id: 5,
    title: "CRM e Hóspedes",
    description: "Perfil completo, histórico de estadias e comunicação automatizada",
    category: "CRM",
    icon: MessageSquare,
    image: featuresHero,
  },
  {
    id: 6,
    title: "Configurações",
    description: "Personalização completa do sistema e integrações",
    category: "Sistema",
    icon: Settings,
    image: heroDashboard,
  },
];

const categories = ["Todos", "Dashboard", "Reservas", "Operacional", "Financeiro", "CRM", "Sistema"];

export default function WebsiteScreenshots() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredScreenshots =
    selectedCategory === "Todos"
      ? screenshots
      : screenshots.filter((s) => s.category === selectedCategory);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const navigate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentIndex((prev) =>
        prev === 0 ? filteredScreenshots.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex((prev) =>
        prev === filteredScreenshots.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <WebsiteLayout>
      {/* Hero with Background */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroDashboard})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-50" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30">
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            Galeria de Screenshots
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Conheça a interface do{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Uni | Stays
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Design moderno e intuitivo que seus funcionários vão adorar usar. 
            Clique nas imagens para ampliar.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white border-b border-slate-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    : "border-slate-200 hover:border-slate-300"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredScreenshots.map((screenshot, index) => (
              <Card
                key={screenshot.id}
                className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer bg-white"
                onClick={() => openLightbox(index)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={screenshot.image}
                      alt={screenshot.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <screenshot.icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {screenshot.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">
                      {screenshot.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {screenshot.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-6xl p-0 bg-slate-900 border-slate-800">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={() => navigate("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={() => navigate("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-7 h-7" />
            </button>

            {/* Image */}
            <div className="aspect-video">
              <img
                src={filteredScreenshots[currentIndex]?.image}
                alt={filteredScreenshots[currentIndex]?.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-6 bg-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                  {filteredScreenshots[currentIndex]?.category}
                </Badge>
                <span className="text-sm text-slate-500">
                  {currentIndex + 1} de {filteredScreenshots.length}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {filteredScreenshots[currentIndex]?.title}
              </h3>
              <p className="text-slate-400 text-lg">
                {filteredScreenshots[currentIndex]?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Quer ver o sistema em ação?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Agende uma demonstração personalizada com nosso time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contato">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6"
              >
                Agendar Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/videos">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                Ver Vídeos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </WebsiteLayout>
  );
}
