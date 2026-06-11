import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Bot,
    MessageSquare,
    MapPin,
    Utensils,
    Ticket,
    Star,
    Clock,
    CheckCircle,
    Send,
    Sparkles,
    ThumbsUp,
    Heart,
    Navigation
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const recommendations = [
    { id: 1, type: "restaurant", name: "Fogo de Chão", category: "Churrascaria", rating: 4.8, distance: "1.2 km", bookings: 23 },
    { id: 2, type: "restaurant", name: "Chez Claude", category: "Francesa", rating: 4.9, distance: "0.8 km", bookings: 15 },
    { id: 3, type: "tour", name: "City Tour Histórico", category: "Passeio", rating: 4.7, distance: "-", bookings: 45 },
    { id: 4, type: "experience", name: "Degustação de Vinhos", category: "Experiência", rating: 4.9, distance: "5 km", bookings: 12 },
    { id: 5, type: "restaurant", name: "Sushi Leblon", category: "Japonesa", rating: 4.6, distance: "2.1 km", bookings: 18 },
];

const guestRequests = [
    { id: "REQ001", room: "301", guest: "Carlos Oliveira", request: "Reserva para 2 no Fogo de Chão", status: "completed", time: "14:30" },
    { id: "REQ002", room: "512", guest: "Maria Santos", request: "Ingressos para teatro hoje à noite", status: "pending", time: "15:00" },
    { id: "REQ003", room: "205", guest: "João Pedro", request: "Transfer para aeroporto amanhã 6h", status: "confirmed", time: "15:15" },
    { id: "REQ004", room: "408", guest: "Ana Costa", request: "Sugestão de restaurante romântico", status: "in_progress", time: "15:30" },
];

const aiConversations = [
    { id: 1, guest: "Carlos Oliveira", room: "301", messages: 12, satisfaction: 5, lastTopic: "Restaurantes" },
    { id: 2, guest: "Maria Santos", room: "512", messages: 8, satisfaction: 5, lastTopic: "Eventos" },
    { id: 3, guest: "João Pedro", room: "205", messages: 5, satisfaction: 4, lastTopic: "Transfers" },
];

const DigitalConcierge = () => {
    const [message, setMessage] = useState("");

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
            case "confirmed":
                return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
            case "pending":
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
            case "in_progress":
                return <Badge className="bg-purple-500 hover:bg-purple-600"><Sparkles className="h-3 w-3 mr-1" />Processando</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "restaurant":
                return <Utensils className="h-4 w-4" />;
            case "tour":
                return <Navigation className="h-4 w-4" />;
            case "experience":
                return <Heart className="h-4 w-4" />;
            default:
                return <MapPin className="h-4 w-4" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Bot className="h-8 w-8 text-primary" />
                            Concierge Digital com IA
                        </h1>
                        <p className="text-muted-foreground">
                            Recomendações personalizadas, reservas e experiências
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Conversas Ativas
                        </Button>
                        <Button>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Treinar IA
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Interações Hoje</p>
                                    <p className="text-2xl font-bold">127</p>
                                </div>
                                <MessageSquare className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Reservas Realizadas</p>
                                    <p className="text-2xl font-bold">34</p>
                                </div>
                                <Ticket className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Taxa de Resolução</p>
                                    <p className="text-2xl font-bold">94%</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Satisfação</p>
                                    <p className="text-2xl font-bold">4.9 ⭐</p>
                                </div>
                                <ThumbsUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="requests" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="requests">Solicitações</TabsTrigger>
                        <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                        <TabsTrigger value="ai">IA Insights</TabsTrigger>
                        <TabsTrigger value="chat">Chat Assistente</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitações de Hóspedes</CardTitle>
                                <CardDescription>Pedidos sendo processados pelo concierge</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Quarto</TableHead>
                                            <TableHead>Hóspede</TableHead>
                                            <TableHead>Solicitação</TableHead>
                                            <TableHead>Horário</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {guestRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-mono">{request.id}</TableCell>
                                                <TableCell className="font-bold">{request.room}</TableCell>
                                                <TableCell>{request.guest}</TableCell>
                                                <TableCell>{request.request}</TableCell>
                                                <TableCell>{request.time}</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">Atender</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Parceiros e Recomendações</CardTitle>
                                <CardDescription>Restaurantes, passeios e experiências para sugerir aos hóspedes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recommendations.map((rec) => (
                                        <Card key={rec.id} className="hover:border-primary transition-colors cursor-pointer">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            {getTypeIcon(rec.type)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{rec.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{rec.category}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-4 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                        <span>{rec.rating}</span>
                                                    </div>
                                                    {rec.distance !== "-" && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{rec.distance}</span>
                                                        </div>
                                                    )}
                                                    <Badge variant="secondary">{rec.bookings} reservas</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Conversas com IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Hóspede</TableHead>
                                                <TableHead>Quarto</TableHead>
                                                <TableHead>Msgs</TableHead>
                                                <TableHead>Satisfação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aiConversations.map((conv) => (
                                                <TableRow key={conv.id}>
                                                    <TableCell className="font-medium">{conv.guest}</TableCell>
                                                    <TableCell>{conv.room}</TableCell>
                                                    <TableCell>{conv.messages}</TableCell>
                                                    <TableCell>{"⭐".repeat(conv.satisfaction)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tópicos Mais Frequentes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span>Restaurantes</span>
                                            <Badge>45%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Transfers</span>
                                            <Badge variant="secondary">22%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Passeios</span>
                                            <Badge variant="secondary">18%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Eventos</span>
                                            <Badge variant="secondary">15%</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="chat" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assistente de Concierge</CardTitle>
                                <CardDescription>Converse com a IA para obter sugestões</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] border rounded-lg p-4 mb-4 overflow-y-auto bg-muted/50">
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                            <div className="bg-background p-3 rounded-lg max-w-[80%]">
                                                <p className="text-sm">Olá! Sou o Concierge Digital. Como posso ajudá-lo hoje? Posso fazer recomendações de restaurantes, passeios, ou ajudar com reservas.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Digite sua mensagem..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <Button>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default DigitalConcierge;
