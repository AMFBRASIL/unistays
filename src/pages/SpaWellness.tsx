import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Flower2,
    Plus,
    Calendar,
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    User,
    Star,
    Sparkles,
    Heart,
    Timer
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const appointments = [
    { id: 1, time: "09:00", guest: "Maria Santos", room: "301", service: "Massagem Relaxante", therapist: "Ana", duration: 60, price: 180, status: "confirmed" },
    { id: 2, time: "10:00", guest: "Carlos Oliveira", room: "512", service: "Day Spa Completo", therapist: "Paula", duration: 180, price: 450, status: "in_progress" },
    { id: 3, time: "11:00", guest: "João Pedro", room: "205", service: "Hidratação Facial", therapist: "Carla", duration: 45, price: 120, status: "confirmed" },
    { id: 4, time: "14:00", guest: "Ana Costa", room: "408", service: "Massagem Tailandesa", therapist: "Ana", duration: 90, price: 250, status: "pending" },
    { id: 5, time: "15:30", guest: "Pedro Alves", room: "602", service: "Ritual Ayurvédico", therapist: "Paula", duration: 120, price: 380, status: "confirmed" },
];

const therapists = [
    { id: 1, name: "Ana Silva", specialty: "Massagens", rating: 4.9, appointments: 8, revenue: 1440 },
    { id: 2, name: "Paula Santos", specialty: "Day Spa", rating: 4.8, appointments: 5, revenue: 1850 },
    { id: 3, name: "Carla Costa", specialty: "Tratamentos Faciais", rating: 4.7, appointments: 6, revenue: 720 },
];

const packages = [
    { id: 1, name: "Day Spa Romance", services: ["Massagem Casal", "Champagne", "Jacuzzi"], price: 890, duration: 180 },
    { id: 2, name: "Detox Premium", services: ["Drenagem", "Esfoliação", "Hidratação"], price: 520, duration: 150 },
    { id: 3, name: "Relaxamento Total", services: ["Massagem 90min", "Aromaterapia", "Chá"], price: 380, duration: 120 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const SpaWellness = () => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
            case "in_progress":
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Timer className="h-3 w-3 mr-1" />Em Andamento</Badge>;
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
            case "completed":
                return <Badge variant="secondary">Concluído</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const totalRevenue = appointments.reduce((sum, a) => sum + a.price, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Spa & Wellness</h1>
                        <p className="text-muted-foreground">
                            Agendamento, gestão de terapeutas e pacotes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Ver Agenda
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Agendamento
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                                    <p className="text-2xl font-bold">{appointments.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-primary" />
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
                                    <p className="text-sm text-muted-foreground">Terapeutas Ativos</p>
                                    <p className="text-2xl font-bold">{therapists.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Avaliação Média</p>
                                    <p className="text-2xl font-bold">4.8 ⭐</p>
                                </div>
                                <Star className="h-8 w-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="schedule" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="schedule">Agenda do Dia</TabsTrigger>
                        <TabsTrigger value="therapists">Terapeutas</TabsTrigger>
                        <TabsTrigger value="packages">Pacotes</TabsTrigger>
                        <TabsTrigger value="billing">Cobrança no Quarto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agendamentos de Hoje</CardTitle>
                                <CardDescription>15 de Janeiro de 2024</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Horário</TableHead>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>Quarto</TableHead>
                                            <TableHead>Serviço</TableHead>
                                            <TableHead>Terapeuta</TableHead>
                                            <TableHead>Duração</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                <TableCell className="font-bold">{appointment.time}</TableCell>
                                                <TableCell>{appointment.guest}</TableCell>
                                                <TableCell>{appointment.room}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Flower2 className="h-4 w-4 text-primary" />
                                                        {appointment.service}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{appointment.therapist}</TableCell>
                                                <TableCell>{appointment.duration} min</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(appointment.price)}</TableCell>
                                                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="therapists" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {therapists.map((therapist) => (
                                <Card key={therapist.id}>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                                <User className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg">{therapist.name}</h3>
                                            <p className="text-muted-foreground">{therapist.specialty}</p>
                                            <div className="flex items-center justify-center gap-1 mt-2">
                                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                <span className="font-bold">{therapist.rating}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                                <div>
                                                    <p className="text-2xl font-bold">{therapist.appointments}</p>
                                                    <p className="text-xs text-muted-foreground">Atendimentos Hoje</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-emerald-500">{formatCurrency(therapist.revenue)}</p>
                                                    <p className="text-xs text-muted-foreground">Receita</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="packages" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packages.map((pkg) => (
                                <Card key={pkg.id} className="hover:border-primary transition-colors cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {pkg.services.map((service, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <Heart className="h-3 w-3 text-primary" />
                                                    {service}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                            <div className="text-sm text-muted-foreground">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                {pkg.duration} min
                                            </div>
                                            <span className="text-2xl font-bold">{formatCurrency(pkg.price)}</span>
                                        </div>
                                        <Button className="w-full mt-4">Reservar</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="billing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cobrança no Quarto</CardTitle>
                                <CardDescription>Serviços para débito na conta do hóspede</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quarto</TableHead>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>Serviço</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ação</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.slice(0, 3).map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                <TableCell className="font-bold">{appointment.room}</TableCell>
                                                <TableCell>{appointment.guest}</TableCell>
                                                <TableCell>{appointment.service}</TableCell>
                                                <TableCell>15/01/2024</TableCell>
                                                <TableCell className="font-bold">{formatCurrency(appointment.price)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">Pendente</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm">Debitar</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default SpaWellness;
