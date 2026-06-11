import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Wrench,
  Sparkles,
  Hotel,
  Building2,
  Home,
  Palmtree,
  FileText,
  BedDouble,
  Clock,
  Brush,
  Loader2
} from "lucide-react";
import { useRoomMapData, Room } from "@/hooks/useRoomMapData";

type PropertyType = 'all' | 'hotel' | 'apart-hotel' | 'loft' | 'temporada';

const propertyTypeConfig = {
  hotel: { label: 'Hotel', icon: Hotel, color: 'text-blue-500', bgLight: 'bg-blue-500/10' },
  'apart-hotel': { label: 'Apart', icon: Building2, color: 'text-purple-500', bgLight: 'bg-purple-500/10' },
  loft: { label: 'Loft', icon: Home, color: 'text-amber-500', bgLight: 'bg-amber-500/10' },
  temporada: { label: 'Temp.', icon: Palmtree, color: 'text-emerald-500', bgLight: 'bg-emerald-500/10' },
};

const stayTypeConfig: Record<string, { label: string; color: string }> = {
  daily: { label: 'Diária', color: 'bg-blue-500/20 text-blue-600' },
  weekly: { label: 'Semanal', color: 'bg-purple-500/20 text-purple-600' },
  monthly: { label: 'Mensal', color: 'bg-amber-500/20 text-amber-600' },
  longstay: { label: 'Long Stay', color: 'bg-emerald-500/20 text-emerald-600' },
  'long-stay': { label: 'Long Stay', color: 'bg-emerald-500/20 text-emerald-600' },
};

const statusConfig: Record<string, { label: string; className: string; icon: any; iconColor: string }> = {
  available: {
    label: "Disponível",
    className: "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500",
    icon: BedDouble,
    iconColor: "text-emerald-500",
  },
  occupied: {
    label: "Ocupado",
    className: "bg-blue-500/10 border-blue-500/30 hover:border-blue-500",
    icon: User,
    iconColor: "text-blue-500",
  },
  checkout: {
    label: "Check-out",
    className: "bg-amber-500/10 border-amber-500/30 hover:border-amber-500",
    icon: Clock,
    iconColor: "text-amber-500",
  },
  cleaning: {
    label: "Limpeza",
    className: "bg-orange-500/10 border-orange-500/30 hover:border-orange-500",
    icon: Sparkles,
    iconColor: "text-orange-500",
  },
  arrangement: {
    label: "Arrumação",
    className: "bg-purple-500/10 border-purple-500/30 hover:border-purple-500",
    icon: Brush,
    iconColor: "text-purple-500",
  },
  maintenance: {
    label: "Manutenção",
    className: "bg-red-500/10 border-red-500/30 hover:border-red-500",
    icon: Wrench,
    iconColor: "text-red-500",
  },
  blocked: {
    label: "Bloqueado",
    className: "bg-muted border-muted",
    icon: BedDouble,
    iconColor: "text-muted-foreground",
  }
};

export function RoomMap() {
  const [selectedType, setSelectedType] = useState<PropertyType>('all');
  const { data: rooms, isLoading } = useRoomMapData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 h-64 border rounded-xl bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const allRooms = rooms || [];

  const filteredRooms = allRooms.filter(
    room => selectedType === 'all' || room.propertyType === selectedType
  );

  const longStayCount = allRooms.filter(r => r.guest?.stayType === 'longstay' || r.guest?.stayType === 'long-stay' || r.guest?.stayType === 'monthly').length;

  // Group rooms by property name
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const key = room.propertyName || 'Sem Propriedade';
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  return (
    <div className="rounded-xl bg-card border border-border p-3 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-lg font-semibold text-foreground">Mapa de Unidades Híbrido</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Visão geral em tempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] sm:text-xs">
              <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              {longStayCount} Long Stay
            </Badge>
          </div>
        </div>

        {/* Property Type Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            Todos
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3.5 sm:h-4 text-[8px] sm:text-[10px] px-1">{allRooms.length}</Badge>
          </Button>
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = allRooms.filter(r => r.propertyType === type).length;

            // Only show types that have rooms
            if (count === 0 && selectedType !== type) return null;

            return (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type as PropertyType)}
                className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
              >
                <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                {config.label}
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3.5 sm:h-4 text-[8px] sm:text-[10px] px-1">{count}</Badge>
              </Button>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
              <div className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full", config.className.split(" ")[0].replace("/10", ""))} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {Object.keys(groupedRooms).length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma unidade encontrada para os filtros selecionados.</div>
        )}

        {Object.entries(groupedRooms).map(([propertyName, propertyRooms]) => {
          const firstRoom = propertyRooms[0];
          const propertyType = firstRoom?.propertyType || 'hotel';
          const typeConfig = propertyTypeConfig[propertyType as keyof typeof propertyTypeConfig] || propertyTypeConfig.hotel;
          const TypeIcon = typeConfig?.icon || Hotel;

          return (
            <div key={propertyName}>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className={cn("p-1.5 rounded-md", typeConfig?.bgLight)}>
                  <TypeIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", typeConfig?.color)} />
                </div>
                <span className="text-sm sm:text-base font-bold text-foreground uppercase tracking-tight">
                  {propertyName}
                </span>
                <Badge variant="outline" className="ml-1 text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 font-medium text-muted-foreground border-border">
                  {typeConfig?.label}
                </Badge>
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5">{propertyRooms.length} unid.</Badge>
                <div className="flex-1 h-px bg-border/50 ml-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                {propertyRooms.map((room) => {
                  const config = statusConfig[room.status] || statusConfig.available;
                  const Icon = config.icon;

                  return (
                    <div
                      key={room.id}
                      className={cn(
                        "relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                        config.className
                      )}
                    >
                      <div className="flex items-start justify-between mb-0.5 sm:mb-1">
                        <div className="flex items-center gap-0.5 sm:gap-1 overflow-hidden">
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm sm:text-base font-bold text-foreground">{room.number}</span>
                          </div>
                        </div>
                        <Icon className={cn("w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0", config.iconColor)} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate" title={room.type}>{room.type}</p>

                      {room.guest ? (
                        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border/50">
                          <p className="text-[10px] sm:text-xs font-medium text-foreground truncate" title={room.guest.name}>{room.guest.name}</p>
                          <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                            <p className="text-[8px] sm:text-[10px] text-muted-foreground">Saída: {formatDate(room.guest.checkOut)}</p>
                            {room.guest.stayType && stayTypeConfig[room.guest.stayType] && (
                              <Badge variant="outline" className={cn("text-[6px] sm:text-[8px] px-0.5 sm:px-1 py-0 h-3 sm:h-4", stayTypeConfig[room.guest.stayType].color)}>
                                {stayTypeConfig[room.guest.stayType].label}
                              </Badge>
                            )}
                          </div>
                          {room.guest.contractValue && room.guest.contractValue > 0 && (
                            <p className="text-[8px] sm:text-[10px] text-emerald-500 font-medium mt-0.5 sm:mt-1">
                              {formatCurrency(room.guest.contractValue)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border/50">
                          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Diária</p>
                          <p className="text-[10px] sm:text-xs font-bold text-foreground">{formatCurrency(room.rates.daily)}</p>
                        </div>
                      )}

                      <div
                        className={cn(
                          "absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                          "bg-gradient-to-br from-transparent via-transparent to-current/5"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
