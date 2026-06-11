import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  DollarSign,
  MoreHorizontal,
  PartyPopper,
  Briefcase,
  Heart,
  GraduationCap,
  Music,
  Utensils,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { NewEventModal } from "@/components/events/NewEventModal";

const eventTypeIcons: Record<string, React.ElementType> = {
  corporate: Briefcase,
  wedding: Heart,
  party: PartyPopper,
  conference: GraduationCap,
  concert: Music,
  dinner: Utensils,
};

const eventTypeColors: Record<string, string> = {
  corporate: "from-blue-500 to-blue-600",
  wedding: "from-pink-500 to-rose-500",
  party: "from-purple-500 to-violet-500",
  conference: "from-amber-500 to-orange-500",
  concert: "from-emerald-500 to-green-500",
  dinner: "from-red-500 to-rose-600",
};

const mockEvents = [
  {
    id: "1",
    name: "Conferência Tech Summit 2024",
    type: "conference",
    date: "2024-01-20",
    startTime: "09:00",
    endTime: "18:00",
    guests: 150,
    space: "Salão Principal",
    status: "confirmed",
    contact: "Carlos Silva",
    company: "TechCorp",
    total: 12500,
  },
  {
    id: "2",
    name: "Casamento Marina & João",
    type: "wedding",
    date: "2024-01-25",
    startTime: "16:00",
    endTime: "00:00",
    guests: 200,
    space: "Área Externa",
    status: "confirmed",
    contact: "Marina Santos",
    total: 28000,
  },
  {
    id: "3",
    name: "Festa Corporativa Fim de Ano",
    type: "party",
    date: "2024-01-28",
    startTime: "20:00",
    endTime: "02:00",
    guests: 80,
    space: "Rooftop Lounge",
    status: "pending",
    contact: "Ana Costa",
    company: "StartupXYZ",
    total: 8500,
  },
  {
    id: "4",
    name: "Jantar Executivo",
    type: "dinner",
    date: "2024-02-05",
    startTime: "19:00",
    endTime: "23:00",
    guests: 30,
    space: "Restaurante Privativo",
    status: "confirmed",
    contact: "Roberto Lima",
    company: "FinanceGroup",
    total: 4500,
  },
  {
    id: "5",
    name: "Workshop de Liderança",
    type: "corporate",
    date: "2024-02-10",
    startTime: "08:00",
    endTime: "17:00",
    guests: 25,
    space: "Sala de Reuniões A",
    status: "pending",
    contact: "Fernanda Oliveira",
    company: "ConsultoriaABC",
    total: 3200,
  },
];

const stats = [
  { label: "Eventos este mês", value: "12", icon: CalendarDays, color: "text-primary" },
  { label: "Confirmados", value: "8", icon: CheckCircle2, color: "text-green-500" },
  { label: "Pendentes", value: "4", icon: AlertCircle, color: "text-amber-500" },
  { label: "Receita Prevista", value: "R$ 56.700", icon: TrendingUp, color: "text-emerald-500" },
];

export default function Events() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = mockEvents.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eventos</h1>
            <p className="text-muted-foreground">Gerencie eventos e reservas de espaços</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const TypeIcon = eventTypeIcons[event.type] || Calendar;
            const typeColor = eventTypeColors[event.type] || "from-gray-500 to-gray-600";

            return (
              <div
                key={event.id}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Event Type Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeColor} flex items-center justify-center shrink-0`}>
                    <TypeIcon className="w-7 h-7 text-white" />
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg truncate">{event.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.contact} {event.company && `• ${event.company}`}
                        </p>
                      </div>
                      <Badge
                        variant={event.status === "confirmed" ? "default" : "secondary"}
                        className={event.status === "confirmed" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}
                      >
                        {event.status === "confirmed" ? "Confirmado" : "Pendente"}
                      </Badge>
                    </div>

                    {/* Event Details */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{event.guests} convidados</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{event.space}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-primary">
                      R$ {event.total.toLocaleString("pt-BR")}
                    </span>
                    <div className="mt-2">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewEventModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  );
}
