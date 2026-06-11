import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Car,
    Plus,
    MapPin,
    Clock,
    DollarSign,
    CheckCircle,
    Navigation,
    User,
    Calendar,
    Fuel,
    Settings,
    Phone,
    Timer
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const transfers = [
    { id: "TRF001", guest: "Carlos Oliveira", room: "301", type: "Aeroporto → Hotel", date: "2024-01-15", time: "14:00", vehicle: "Sedan Executivo", driver: "Pedro Silva", status: "completed", price: 180 },
    { id: "TRF002", guest: "Maria Santos", room: "512", type: "Hotel → Aeroporto", date: "2024-01-16", time: "06:00", vehicle: "Van Executiva", driver: "João Carlos", status: "scheduled", price: 220 },
    { id: "TRF003", guest: "Ana Costa", room: "408", type: "City Tour", date: "2024-01-15", time: "09:00", vehicle: "SUV Premium", driver: "Roberto Alves", status: "in_progress", price: 450 },
    { id: "TRF004", guest: "João Pedro", room: "205", type: "Hotel → Restaurante", date: "2024-01-15", time: "19:30", vehicle: "Sedan Executivo", driver: "Pedro Silva", status: "scheduled", price: 80 },
];

const vehicles = [
    { id: 1, name: "Sedan Executivo 01", model: "Toyota Corolla 2024", plate: "ABC-1234", status: "available", fuel: 85, km: 15420, nextMaintenance: "2024-02-15" },
    { id: 2, name: "SUV Premium", model: "BMW X5 2024", plate: "DEF-5678", status: "in_use", fuel: 60, km: 8320, nextMaintenance: "2024-03-01" },
    { id: 3, name: "Van Executiva", model: "Mercedes V-Class 2023", plate: "GHI-9012", status: "available", fuel: 92, km: 22150, nextMaintenance: "2024-01-25" },
    { id: 4, name: "Sedan Executivo 02", model: "Honda Accord 2024", plate: "JKL-3456", status: "maintenance", fuel: 45, km: 31200, nextMaintenance: "Em manutenção" },
];

const drivers = [
    { id: 1, name: "Pedro Silva", phone: "(11) 98765-4321", status: "available", trips: 45, rating: 4.9 },
    { id: 2, name: "João Carlos", phone: "(11) 91234-5678", status: "on_trip", trips: 38, rating: 4.8 },
    { id: 3, name: "Roberto Alves", phone: "(11) 99876-5432", status: "on_trip", trips: 52, rating: 4.9 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const TransferFleet = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
            case "scheduled":
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="h-3 w-3 mr-1" />Agendado</Badge>;
            case "in_progress":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Navigation className="h-3 w-3 mr-1" />Em Andamento</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getVehicleStatus = (status: string) => {
        switch (status) {
            case "available":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Disponível</Badge>;
            case "in_use":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Em Uso</Badge>;
            case "maintenance":
                return <Badge className="bg-amber-500 hover:bg-amber-600">Manutenção</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDriverStatus = (status: string) => {
        switch (status) {
            case "available":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Disponível</Badge>;
            case "on_trip":
                return <Badge className="bg-blue-500 hover:bg-blue-600">Em Viagem</Badge>;
            case "off":
                return <Badge variant="secondary">Folga</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalRevenue = transfers.reduce((sum, t) => sum + t.price, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Transfers & Frotas</h1>
                        <p className="text-muted-foreground">
                            Gestão de veículos e agendamento de transfers
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Ver Agenda
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Transfer
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Transfers Hoje</p>
                                    <p className="text-2xl font-bold">{transfers.length}</p>
                                </div>
                                <Car className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Receita Hoje</p>
                                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Veículos Disponíveis</p>
                                    <p className="text-2xl font-bold">{vehicles.filter(v => v.status === "available").length}/{vehicles.length}</p>
                                </div>
                                <Car className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Motoristas Ativos</p>
                                    <p className="text-2xl font-bold">{drivers.length}</p>
                                </div>
                                <User className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="transfers" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="transfers">Transfers</TabsTrigger>
                        <TabsTrigger value="vehicles">Veículos</TabsTrigger>
                        <TabsTrigger value="drivers">Motoristas</TabsTrigger>
                        <TabsTrigger value="integrations">Integrações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transfers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transfers Agendados</CardTitle>
                                <CardDescription>Lista de todos os transfers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>Trajeto</TableHead>
                                            <TableHead>Data/Hora</TableHead>
                                            <TableHead>Veículo</TableHead>
                                            <TableHead>Motorista</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfers.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="font-mono">{transfer.id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{transfer.guest}</p>
                                                        <p className="text-sm text-muted-foreground">Quarto {transfer.room}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Navigation className="h-4 w-4 text-primary" />
                                                        {transfer.type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p>{transfer.date}</p>
                                                        <p className="text-sm text-muted-foreground">{transfer.time}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{transfer.vehicle}</TableCell>
                                                <TableCell>{transfer.driver}</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(transfer.price)}</TableCell>
                                                <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vehicles" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehicles.map((vehicle) => (
                                <Card key={vehicle.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                                <p className="text-muted-foreground">{vehicle.model}</p>
                                                <p className="text-sm font-mono mt-1">{vehicle.plate}</p>
                                            </div>
                                            {getVehicleStatus(vehicle.status)}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <Fuel className="h-5 w-5 mx-auto mb-1 text-primary" />
                                                <p className="text-lg font-bold">{vehicle.fuel}%</p>
                                                <p className="text-xs text-muted-foreground">Combustível</p>
                                            </div>
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <Timer className="h-5 w-5 mx-auto mb-1 text-primary" />
                                                <p className="text-lg font-bold">{(vehicle.km / 1000).toFixed(1)}k</p>
                                                <p className="text-xs text-muted-foreground">Km Rodados</p>
                                            </div>
                                            <div className="text-center p-3 bg-muted rounded-lg">
                                                <Settings className="h-5 w-5 mx-auto mb-1 text-primary" />
                                                <p className="text-xs font-medium">{vehicle.nextMaintenance}</p>
                                                <p className="text-xs text-muted-foreground">Próx. Revisão</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="drivers" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Motoristas</CardTitle>
                                <CardDescription>Equipe de motoristas cadastrados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {drivers.map((driver) => (
                                        <Card key={driver.id}>
                                            <CardContent className="pt-6">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                                        <User className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <h3 className="font-semibold text-lg">{driver.name}</h3>
                                                    <div className="flex items-center justify-center gap-1 text-muted-foreground mt-1">
                                                        <Phone className="h-3 w-3" />
                                                        <span className="text-sm">{driver.phone}</span>
                                                    </div>
                                                    <div className="mt-3">
                                                        {getDriverStatus(driver.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                                        <div>
                                                            <p className="text-2xl font-bold">{driver.trips}</p>
                                                            <p className="text-xs text-muted-foreground">Viagens</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-2xl font-bold">{driver.rating} ⭐</p>
                                                            <p className="text-xs text-muted-foreground">Avaliação</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="integrations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Integrações com Apps de Mobilidade</CardTitle>
                                <CardDescription>Conecte com serviços de transporte externos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="hover:border-primary transition-colors cursor-pointer">
                                        <CardContent className="pt-6 text-center">
                                            <div className="text-4xl mb-4">🚕</div>
                                            <h3 className="font-semibold">Uber</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Solicite corridas para hóspedes</p>
                                            <Badge className="mt-3 bg-emerald-500">Conectado</Badge>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:border-primary transition-colors cursor-pointer">
                                        <CardContent className="pt-6 text-center">
                                            <div className="text-4xl mb-4">🚗</div>
                                            <h3 className="font-semibold">99</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Integração com 99 Taxi</p>
                                            <Badge variant="outline" className="mt-3">Disponível</Badge>
                                        </CardContent>
                                    </Card>
                                    <Card className="hover:border-primary transition-colors cursor-pointer">
                                        <CardContent className="pt-6 text-center">
                                            <div className="text-4xl mb-4">✈️</div>
                                            <h3 className="font-semibold">Transfer Aero</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Transfers aeroportuários</p>
                                            <Badge variant="outline" className="mt-3">Disponível</Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default TransferFleet;
