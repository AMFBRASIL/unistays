import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/use-pwa";
import { useState, useEffect } from "react";

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // Show prompt after 30 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsDismissed(true);
    }
  };

  if (!isInstallable || isInstalled || isDismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-indigo-500/30 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">Instalar Uni Stays</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acesse mais rápido direto da tela inicial
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                className="gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Download className="w-4 h-4" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                Agora não
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
