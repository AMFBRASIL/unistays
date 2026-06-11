import { useState } from "react";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import {
  Play,
  Clock,
  Eye,
  ArrowRight,
  X,
  BookOpen,
  Rocket,
  Zap,
  Users,
  Video,
  Sparkles,
} from "lucide-react";

// Import images
import heroDashboard from "@/assets/website-hero-dashboard.jpg";
import hotelLobby from "@/assets/website-hotel-lobby.jpg";
import staffTablet from "@/assets/website-staff-tablet.jpg";
import resortAerial from "@/assets/website-resort-aerial.jpg";
import featuresHero from "@/assets/website-features-hero.jpg";

const videoCategories = [
  { id: "all", label: "Todos", icon: Play },
  { id: "getting-started", label: "Primeiros Passos", icon: Rocket },
  { id: "features", label: "Funcionalidades", icon: Zap },
  { id: "tutorials", label: "Tutoriais", icon: BookOpen },
  { id: "webinars", label: "Webinars", icon: Users },
];

const videos = [
  {
    id: 1,
    title: "Tour Completo pelo Uni | Stays",
    description: "Conheça todas as funcionalidades do sistema em uma visão geral de 10 minutos",
    category: "getting-started",
    duration: "10:32",
    views: "12.5K",
    thumbnail: heroDashboard,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true,
  },
  {
    id: 2,
    title: "Como Configurar sua Primeira Propriedade",
    description: "Passo a passo para configurar seu hotel do zero no sistema",
    category: "getting-started",
    duration: "8:45",
    views: "8.2K",
    thumbnail: hotelLobby,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "Gestão de Reservas: Do Básico ao Avançado",
    description: "Aprenda a criar, editar e gerenciar reservas de forma eficiente",
    category: "features",
    duration: "15:20",
    views: "6.8K",
    thumbnail: staffTablet,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 4,
    title: "Mapa de Ocupação: Arrastar e Soltar",
    description: "Como usar o mapa de ocupação visual para gerenciar reservas",
    category: "features",
    duration: "7:15",
    views: "5.4K",
    thumbnail: featuresHero,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 5,
    title: "Precificação Dinâmica com IA",
    description: "Como configurar e usar a precificação automática baseada em IA",
    category: "features",
    duration: "12:48",
    views: "9.1K",
    thumbnail: heroDashboard,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 6,
    title: "Integrando com Booking.com",
    description: "Tutorial completo de integração com o channel manager",
    category: "tutorials",
    duration: "18:30",
    views: "7.2K",
    thumbnail: staffTablet,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 7,
    title: "Automatizando Mensagens com CRM",
    description: "Configure automações de WhatsApp, Email e SMS para seus hóspedes",
    category: "tutorials",
    duration: "14:22",
    views: "4.5K",
    thumbnail: hotelLobby,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 8,
    title: "Webinar: Tendências da Hotelaria 2024",
    description: "Especialistas discutem as principais tendências do setor hoteleiro",
    category: "webinars",
    duration: "58:45",
    views: "3.2K",
    thumbnail: resortAerial,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: 9,
    title: "Webinar: Revenue Management na Prática",
    description: "Como maximizar sua receita com estratégias de revenue management",
    category: "webinars",
    duration: "45:30",
    views: "2.8K",
    thumbnail: featuresHero,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export default function WebsiteVideos() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);

  const filteredVideos =
    selectedCategory === "all"
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  const featuredVideo = videos.find((v) => v.featured);

  return (
    <WebsiteLayout>
      {/* Hero with Background */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resortAerial})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-white" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-rose-500/20 text-rose-300 border-rose-500/30">
            <Video className="w-3.5 h-3.5 mr-1.5" />
            Central de Vídeos
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Aprenda a usar o{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Uni | Stays
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Tutoriais, demonstrações e webinars para você dominar todas as funcionalidades do sistema.
          </p>
        </div>
      </section>

      {/* Featured Video */}
      {featuredVideo && (
        <section className="py-16 bg-white -mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
                onClick={() => setSelectedVideo(featuredVideo)}
              >
                <img
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/50 transition-colors flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-10 h-10 text-blue-600 ml-1" />
                  </div>
                </div>
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-sm font-medium">
                  {featuredVideo.duration}
                </div>
              </div>
              <div>
                <Badge className="mb-4 bg-slate-100 text-slate-700">
                  Primeiros Passos
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  {featuredVideo.title}
                </h2>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  {featuredVideo.description}
                </p>
                <div className="flex items-center gap-6 text-sm text-slate-500 mb-8">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {featuredVideo.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {featuredVideo.views} visualizações
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-lg px-8 py-6"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Assistir Agora
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Library */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white border border-slate-200 p-1 shadow-lg">
                {videoCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white px-6 py-3"
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos
                  .filter((v) => !v.featured || selectedCategory !== "all")
                  .map((video) => (
                    <Card
                      key={video.id}
                      className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer bg-white"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                              <Play className="w-7 h-7 text-blue-600 ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-sm font-medium">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {video.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                            {video.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              {video.views}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-5xl p-0 bg-slate-900 border-slate-800">
          <div className="relative">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video">
              <iframe
                src={selectedVideo?.videoUrl}
                title={selectedVideo?.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6 bg-slate-800">
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedVideo?.title}
              </h3>
              <p className="text-slate-400 text-lg">{selectedVideo?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hotelLobby})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 to-indigo-600/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experimente o Uni | Stays gratuitamente por 14 dias.
          </p>
          <Link to="/contato">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 py-6"
            >
              Começar Teste Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </WebsiteLayout>
  );
}
