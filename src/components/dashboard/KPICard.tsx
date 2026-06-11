import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border p-3 sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/20 group",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className={cn("p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10", iconColor.replace("text-", "bg-").replace(/\/\d+/, "/10"))}>
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
          </div>
          <div
            className={cn(
              "flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg",
              isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : (
              <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            {Math.abs(change)}%
          </div>
        </div>

        <div>
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-foreground tracking-tight">{value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 truncate">{changeLabel}</p>
        </div>
      </div>
    </div>
  );
}
