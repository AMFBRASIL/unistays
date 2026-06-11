import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useGuestAuth } from "@/contexts/GuestAuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    Hotel,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Hash,
    Calendar,
    ArrowRight,
    Shield,
    Wifi,
    Coffee,
    Star,
    Gift,
    Smartphone,
    Loader2,
    KeyRound
} from "lucide-react";

export default function GuestPortalLogin() {
    const { login, loginWithReservation, guestUser, isLoading: authLoading } = useGuestAuth();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordResetEmail, setPasswordResetEmail] = useState("");
    const [activeTab, setActiveTab] = useState("email");

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        reservationCode: "",
        lastName: "",
        checkInDate: "",
        rememberMe: false
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(loginData.email, loginData.password);
            toast({
                title: "Login realizado com sucesso!",
                description: "Bem-vindo ao Portal do Hóspede.",
            });
        } catch (error: any) {
            toast({
                title: "Erro no login",
                description: error.message || "Email ou senha incorretos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReservationLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await loginWithReservation(
                loginData.reservationCode,
                loginData.lastName,
                loginData.checkInDate
            );
            toast({
                title: "Reserva encontrada!",
                description: "Bem-vindo ao Portal do Hóspede.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao buscar reserva",
                description: error.message || "Dados da reserva não encontrados.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestPasswordEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.guestRequestPasswordResetEmail({
                email: passwordResetEmail.trim().toLowerCase(),
            });
            if (response.success && response.data) {
                toast({
                    title: "Verifique seu e-mail",
                    description: (response.data as { message?: string }).message,
                });
                setPasswordResetEmail("");
                setActiveTab("email");
            } else {
                toast({
                    title: "Não foi possível enviar",
                    description: response.error?.message || "Confira o e-mail e tente novamente.",
                    variant: "destructive",
                });
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Tente novamente.";
            toast({
                title: "Erro",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: Calendar, text: "Check-in Online" },
        { icon: Coffee, text: "Room Service" },
        { icon: Wifi, text: "Serviços do Hotel" },
        { icon: Gift, text: "Programa Fidelidade" },
    ];

    if (!authLoading && guestUser) {
        return <Navigate to="/guest-portal" replace />;
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Hotel className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Uni | Stays</h1>
                            <p className="text-blue-200 text-sm">Portal do Hóspede</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Sua experiência<br />
                            <span className="text-blue-200">começa aqui</span>
                        </h2>
                        <p className="mt-4 text-blue-100 text-lg max-w-md">
                            Acesse seu portal exclusivo para gerenciar reservas, fazer check-in online e solicitar serviços.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div>
                            <p className="text-3xl font-bold text-white">50k+</p>
                            <p className="text-blue-200 text-sm">Hóspedes Ativos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">4.9</p>
                            <p className="text-blue-200 text-sm flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                Avaliação
                            </p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-blue-200 text-sm">Suporte</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm">
                        © 2024 Uni | Stays. Todos os direitos reservados.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <Hotel className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Uni | Stays</h1>
                            <p className="text-muted-foreground text-sm">Portal do Hóspede</p>
                        </div>
                    </div>

                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
                            <CardDescription>
                                E-mail, código da reserva ou receba um link para criar senha
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6 h-auto gap-1 p-1">
                                    <TabsTrigger value="email" className="gap-1 text-xs sm:text-sm px-2 py-2">
                                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        E-mail
                                    </TabsTrigger>
                                    <TabsTrigger value="reservation" className="gap-1 text-xs sm:text-sm px-2 py-2">
                                        <Hash className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        Reserva
                                    </TabsTrigger>
                                    <TabsTrigger value="setpassword" className="gap-1 text-xs sm:text-sm px-2 py-2">
                                        <KeyRound className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        Criar senha
                                    </TabsTrigger>
                                </TabsList>

                                {/* Email Login */}
                                <TabsContent value="email">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="seu@email.com"
                                                    className="pl-10"
                                                    value={loginData.email}
                                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Senha</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10"
                                                    value={loginData.password}
                                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="remember"
                                                    checked={loginData.rememberMe}
                                                    onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked as boolean })}
                                                />
                                                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                                    Lembrar de mim
                                                </Label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="px-0 text-sm"
                                                onClick={() => setActiveTab("setpassword")}
                                            >
                                                Criar / redefinir senha
                                            </Button>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Entrando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Entrar
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="mt-6">
                                        <div className="relative">
                                            <Separator />
                                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-2 text-xs text-muted-foreground">
                                                ou continue com
                                            </span>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="gap-2">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                Google
                                            </Button>
                                            <Button variant="outline" className="gap-2">
                                                <Smartphone className="w-4 h-4" />
                                                SMS
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Reservation Code Login */}
                                <TabsContent value="reservation">
                                    <form onSubmit={handleReservationLogin} className="space-y-4">
                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                                        Acesso rápido com sua reserva
                                                    </p>
                                                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                                                        Use o código de confirmação enviado por email para acessar diretamente.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reservationCode">Código da Reserva</Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="reservationCode"
                                                    type="text"
                                                    placeholder="Ex: RES-2024-12345"
                                                    className="pl-10 font-mono uppercase"
                                                    value={loginData.reservationCode}
                                                    onChange={(e) => setLoginData({ ...loginData, reservationCode: e.target.value.toUpperCase() })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Sobrenome</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="lastName"
                                                    type="text"
                                                    placeholder="Seu sobrenome"
                                                    className="pl-10"
                                                    value={loginData.lastName}
                                                    onChange={(e) => setLoginData({ ...loginData, lastName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="checkInDate">Data do Check-in</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="checkInDate"
                                                    type="date"
                                                    className="pl-10"
                                                    value={loginData.checkInDate}
                                                    onChange={(e) => setLoginData({ ...loginData, checkInDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Buscando reserva...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Acessar Reserva
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* Link por e-mail para criar/redefinir senha */}
                                <TabsContent value="setpassword">
                                    <form onSubmit={handleRequestPasswordEmail} className="space-y-4">
                                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-start gap-3">
                                                <KeyRound className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-amber-900 dark:text-amber-100">
                                                        Sem senha ou esqueceu?
                                                    </p>
                                                    <p className="text-amber-800 dark:text-amber-200 mt-1">
                                                        Informe o <strong>e-mail cadastrado</strong>. Você receberá um link seguro
                                                        (válido por 1 hora) para definir uma nova senha e entrar na aba{" "}
                                                        <strong>E-mail</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="resetEmail">E-mail do cadastro</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="resetEmail"
                                                    type="email"
                                                    placeholder="mesmo e-mail usado nas reservas"
                                                    className="pl-10"
                                                    value={passwordResetEmail}
                                                    onChange={(e) => setPasswordResetEmail(e.target.value)}
                                                    required
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Enviando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Enviar link por e-mail
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>

                            {/* Dica */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    É necessário ter <strong>e-mail cadastrado</strong> e a{" "}
                                    <strong>configuração de e-mail ativa</strong> no sistema (SMTP/API) para receber o link.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trust Badges */}
                    <div className="mt-6 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs">Conexão Segura</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs">Dados Protegidos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}