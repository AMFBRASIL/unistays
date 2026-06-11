import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import type { BookingChannelItem } from "./BookingChannelsListModal";
import { cn } from "@/lib/utils";

interface BookingChannelViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: BookingChannelItem | null;
}

export function BookingChannelViewModal({
  open,
  onOpenChange,
  channel,
}: BookingChannelViewModalProps) {
  if (!channel) return null;

  const commission = channel.defaultCommission ?? (channel as any).default_commission ?? 0;
  const colorClass = channel.color?.startsWith("bg-") ? channel.color : "bg-primary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                colorClass
              )}
            >
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">{channel.name}</DialogTitle>
              <Badge variant={channel.status === "active" ? "default" : "secondary"} className="mt-1">
                {channel.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Slug</label>
            <p className="font-mono text-sm mt-1">{channel.slug}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Cor (UI)</label>
            <p className="text-sm mt-1 flex items-center gap-2">
              <span
                className={cn("w-4 h-4 rounded-full inline-block", colorClass)}
                aria-hidden
              />
              {channel.color || "bg-primary"}
            </p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Comissão padrão (%)</label>
            <p className="text-sm font-semibold mt-1">{Number(commission)}%</p>
          </div>
          {channel.metadata != null && Object.keys(channel.metadata).length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Metadados</label>
              <pre className="text-xs bg-muted p-3 rounded-lg mt-1 overflow-auto max-h-32">
                {JSON.stringify(channel.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
