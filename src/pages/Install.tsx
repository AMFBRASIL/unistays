import { useState, useEffect } from "react";
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Check, 
  Apple, 
  Chrome,
  Layers,
  Wifi,
  WifiOff,
  Bell,
  Shield,
  Zap,
  ArrowRight,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Zap,
      title: "Acesso Rápido",
      description: "Abra direto da tela inicial sem navegador",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      icon: WifiOff,
      title: "Funciona Offline",
      description: "Acesse dados mesmo sem internet",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Receba alertas em tempo real",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      icon: Shield,
      title: "Seguro",
      description: "Dados protegidos e criptografados",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Uni | Stays</h1>
            <p className="text-slate-400 mt-1">Sistema Unificado de Hotelaria</p>
          </div>
          <Badge 
            variant="outline" 
            className={`${isOnline ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"}`}
          >
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Install Status */}
        {isInstalled ? (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">App Instalado!</h2>
              <p className="text-slate-400">
                O Uni Stays já está na sua tela inicial. Abra pelo ícone para uma experiência completa.
              </p>
              <Button className="mt-4 gap-2" onClick={() => window.location.href = "/dashboard"}>
                Abrir App
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Install Button - Android/Desktop */}
            {deferredPrompt && (
              <Card className="bg-indigo-500/10 border-indigo-500/30">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                    <Download className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Instalar Aplicativo</h2>
                  <p className="text-slate-400 mb-4">
                    Adicione o Uni Stays à sua tela inicial para acesso rápido
                  </p>
                  <Button 
                    onClick={handleInstall}
                    className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    size="lg"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Agora
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && !deferredPrompt && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <Apple className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Instalar no iPhone/iPad</h3>
                      <p className="text-sm text-slate-400">Siga os passos abaixo</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                      <div>
                        <p className="text-white text-sm">Toque no botão <strong>Compartilhar</strong></p>
                        <Share className="w-5 h-5 text-blue-400 mt-1" />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                      <div>
                        <p className="text-white text-sm">Role e toque em <strong>"Adicionar à Tela de Início"</strong></p>
                        <div className="flex items-center gap-1 mt-1">
                          <Plus className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400 text-xs">Adicionar à Tela de Início</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                      <p className="text-white text-sm">Toque em <strong>"Adicionar"</strong> no canto superior direito</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions (fallback) */}
            {isAndroid && !deferredPrompt && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <Chrome className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Instalar no Android</h3>
                      <p className="text-sm text-slate-400">Siga os passos abaixo</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
                      <p className="text-white text-sm">Toque no menu <strong>⋮</strong> do navegador (canto superior direito)</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
                      <p className="text-white text-sm">Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></p>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
                      <p className="text-white text-sm">Confirme tocando em <strong>"Instalar"</strong></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* QR Code for Desktop */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Escaneie para instalar no celular</h3>
                  </div>
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QRCodeSVG 
                      value={currentUrl + "/install"} 
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-slate-400 text-sm mt-4">
                    Aponte a câmera do seu celular para o QR Code
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-slate-800/30 border-slate-700/50">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-2`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back to App */}
        <div className="text-center">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => window.location.href = "/dashboard"}>
            Continuar no navegador
          </Button>
        </div>
      </div>
    </div>
  );
}
