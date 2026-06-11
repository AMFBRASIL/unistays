import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Hotel, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

export default function GuestPortalResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const t = searchParams.get("token")?.trim() || "";
        setToken(t);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast({
                title: "Link inválido",
                description: "Abra o link completo enviado por e-mail ou solicite um novo.",
                variant: "destructive",
            });
            return;
        }
        if (newPassword.length < 6) {
            toast({
                title: "Senha curta",
                description: "Use no mínimo 6 caracteres.",
                variant: "destructive",
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({
                title: "Senhas diferentes",
                description: "Confirme a mesma senha nos dois campos.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.guestResetPasswordWithToken({
                token,
                newPassword,
                confirmPassword,
            });
            if (response.success && response.data) {
                toast({
                    title: "Senha definida!",
                    description: (response.data as { message?: string }).message || "Faça login com seu e-mail.",
                });
                navigate("/guest-portal/login", { replace: true });
            } else {
                toast({
                    title: "Não foi possível salvar",
                    description: response.error?.message || "Solicite um novo link na tela de login.",
                    variant: "destructive",
                });
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Tente novamente.";
            toast({ title: "Erro", description: msg, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-md">
                <div className="flex justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Hotel className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-bold">Uni | Stays</h1>
                        <p className="text-muted-foreground text-sm">Nova senha do portal</p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle>Criar nova senha</CardTitle>
                        <CardDescription>
                            Defina uma senha para acessar o portal com seu e-mail. O link expira em 1 hora.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!token ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Nenhum token encontrado no link. Solicite um novo e-mail na página de login, aba
                                    &quot;Criar senha&quot;.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/guest-portal/login">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Voltar ao login
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="np">Nova senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="np"
                                            type={showPw ? "text" : "password"}
                                            className="pl-10 pr-10"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            minLength={6}
                                            required
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            onClick={() => setShowPw(!showPw)}
                                        >
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cp">Confirmar senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="cp"
                                            type={showPw ? "text" : "password"}
                                            className="pl-10"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={6}
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar senha"
                                    )}
                                </Button>
                                <Button variant="ghost" className="w-full" type="button" asChild>
                                    <Link to="/guest-portal/login">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Voltar ao login
                                    </Link>
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
