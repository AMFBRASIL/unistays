import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  BedDouble,
  Users,
  Settings,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  rooms: number;
  rating: number;
  status: "active" | "inactive" | "maintenance";
  occupancy: number;
}

const properties: Property[] = [
  {
    id: "1",
    name: "Hotel Paraíso Resort",
    type: "Resort",
    address: "Av. Beira Mar, 1500",
    city: "Florianópolis, SC",
    phone: "(48) 3333-4444",
    email: "reservas@paraisoresort.com",
    website: "www.paraisoresort.com",
    rooms: 120,
    rating: 4.8,
    status: "active",
    occupancy: 78,
  },
  {
    id: "2",
    name: "Pousada Vista Mar",
    type: "Pousada",
    address: "Rua das Flores, 250",
    city: "Búzios, RJ",
    phone: "(22) 2222-3333",
    email: "contato@vistamar.com",
    website: "www.vistamar.com",
    rooms: 25,
    rating: 4.5,
    status: "active",
    occupancy: 92,
  },
  {
    id: "3",
    name: "Apart Hotel Central",
    type: "Apart-Hotel",
    address: "Rua Augusta, 800",
    city: "São Paulo, SP",
    phone: "(11) 4444-5555",
    email: "reservas@apartcentral.com",
    website: "www.apartcentral.com",
    rooms: 45,
    rating: 4.2,
    status: "maintenance",
    occupancy: 45,
  },
];

const statusConfig = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  inactive: { label: "Inativo", color: "bg-red-500/10 text-red-400", icon: AlertCircle },
  maintenance: { label: "Manutenção", color: "bg-amber-500/10 text-amber-400", icon: AlertCircle },
};

export default function Properties() {
  const totalRooms = properties.reduce((acc, p) => acc + p.rooms, 0);
  const avgOccupancy = Math.round(properties.reduce((acc, p) => acc + p.occupancy, 0) / properties.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Propriedades</h1>
            <p className="text-muted-foreground mt-1">Gerencie todas as suas propriedades</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nova Propriedade
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Building2 className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{properties.length}</p>
                  <p className="text-xs text-muted-foreground">Propriedades</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BedDouble className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalRooms}</p>
                  <p className="text-xs text-muted-foreground">Quartos Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgOccupancy}%</p>
                  <p className="text-xs text-muted-foreground">Ocupação Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4.5</p>
                  <p className="text-xs text-muted-foreground">Avaliação Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => {
            const status = statusConfig[property.status];
            const StatusIcon = status.icon;
            return (
              <Card key={property.id} className="bg-card/50 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                        <Building2 className="h-6 w-6 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{property.address}, {property.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{property.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{property.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{property.rooms}</p>
                        <p className="text-xs text-muted-foreground">Quartos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{property.occupancy}%</p>
                        <p className="text-xs text-muted-foreground">Ocupação</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-foreground">{property.rating}</span>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
