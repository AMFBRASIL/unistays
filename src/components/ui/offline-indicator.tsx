import { useState, useEffect } from "react";
import { Wifi, WifiOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Show success briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50",
        "flex items-center gap-3 p-4 rounded-lg shadow-lg border",
        "transition-all duration-300 animate-in slide-in-from-bottom-4",
        isOnline
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
      )}
    >
      {isOnline ? (
        <Wifi className="w-5 h-5 shrink-0" />
      ) : (
        <WifiOff className="w-5 h-5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {isOnline ? "Conexão restaurada" : "Você está offline"}
        </p>
        <p className="text-xs opacity-80 truncate">
          {isOnline
            ? "Seus dados serão sincronizados"
            : "Algumas funções podem estar limitadas"}
        </p>
      </div>
      <button
        onClick={() => setShowBanner(false)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
