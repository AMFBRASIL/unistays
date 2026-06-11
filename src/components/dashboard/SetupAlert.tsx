import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  ArrowRight, 
  Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { computeSetupPercentage, SETUP_PROGRESS_QUERY_KEY } from "@/lib/setupProgressShared";

export function SetupAlert() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const hideForPdv = useMemo(() => {
    if (!user) return false;
    const groupName = (user.group?.name || "").toLowerCase();
    if (groupName.includes("pdv") || groupName.includes("pos terminal") || groupName.includes("pos-terminal")) {
      return true;
    }

    const perms = user.permissions || {};
    const activeModules = Object.keys(perms).filter((key) => {
      const p = perms[key];
      return !!(p?.read || p?.write || p?.update || p?.delete);
    });
    if (activeModules.length === 0) return false;

    const hasPosTerminal = activeModules.includes("pos-terminal");
    if (!hasPosTerminal) return false;

    const otherModules = activeModules.filter((k) => k !== "pos-terminal" && k !== "dashboard");
    return otherModules.length === 0;
  }, [user]);

  const { data: progressItems, isLoading, isError } = useQuery({
    queryKey: SETUP_PROGRESS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.getSetupProgress();
      if (!res.success || !res.data) throw new Error("setup progress");
      return res.data.items;
    },
    staleTime: 60_000,
    retry: 1,
    enabled: !!user && !hideForPdv,
  });

  if (hideForPdv) return null;

  const percentage = useMemo(() => {
    if (!progressItems || isError) return 0;
    return computeSetupPercentage(progressItems);
  }, [progressItems, isError]);

  const remaining = 100 - percentage;

  if (isLoading || isError) {
    return null;
  }

  if (percentage >= 100) {
    return null;
  }

  return (
    <Card 
      className="border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate("/setup-progress")}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
            <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h3 className="font-semibold text-foreground">Setup não concluído</h3>
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10 w-fit">
                  Faltam {remaining}%
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Complete a configuração inicial para desbloquear todas as funcionalidades do sistema.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Progress value={percentage} className="h-2 flex-1 sm:max-w-xs" />
                <span className="text-sm font-medium text-foreground shrink-0">{percentage}% completo</span>
              </div>
            </div>
          </div>

          <Button 
            variant="default"
            className="gap-2 shrink-0 bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/setup-progress");
            }}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Continuar Setup</span>
            <span className="sm:hidden">Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
