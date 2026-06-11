import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Layers, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Building2,
  Shield,
  Sparkles,
  CheckCircle2,
  Globe,
  Smartphone,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    acceptTerms: false
  });

  // Redirecionar se já estiver autenticado (apenas após o loading do contexto)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const success = await login(formData.email, formData.password);
        if (success) {
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1000);
        }
      } else {
        // Register
        if (!formData.name.trim()) {
          toast.error("Preencha seu nome completo.");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          toast.error("A senha deve ter no mínimo 8 caracteres.");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("As senhas não conferem.");
          setIsLoading(false);
          return;
        }

        if (!formData.acceptTerms) {
          toast.error("Você precisa aceitar os termos de uso.");
          setIsLoading(false);
          return;
        }

        const success = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.company || undefined,
        });

        if (success) {
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Building2,
      title: "Gestão Completa",
      description: "Controle total de reservas, hóspedes e propriedades"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Dashboards inteligentes com insights em tempo real"
    },
    {
      icon: Sparkles,
      title: "IA Integrada",
      description: "Automação e sugestões inteligentes para otimizar operações"
    },
    {
      icon: Globe,
      title: "Multi-Canal",
      description: "Integração com Booking, Airbnb e principais OTAs"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Acesse de qualquer dispositivo, a qualquer momento"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Dados protegidos com criptografia de ponta"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Uni | Stays</h1>
              <p className="text-white/70 text-sm">Sistema Unificado</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                A plataforma completa<br />
                para gestão hoteleira
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Gerencie reservas, hóspedes, finanças e operações em um único lugar. 
                Potencializado por inteligência artificial.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <feature.icon className="w-8 h-8 mb-3 text-white/90" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold">2.500+</div>
              <div className="text-white/70 text-sm">Propriedades ativas</div>
            </div>
            <Separator orientation="vertical" className="h-12 bg-white/20" />
            <div>
              <div className="text-3xl font-bold">150k+</div>
              <div className="text-white/70 text-sm">Reservas/mês</div>
            </div>
            <Separator orientation="vertical" className="h-12 bg-white/20" />
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-white/70 text-sm">Uptime garantido</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Layers className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Uni | Stays</h1>
              <p className="text-muted-foreground text-sm">Sistema Unificado</p>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Entre com suas credenciais para acessar o sistema" 
                : "Comece a gerenciar suas propriedades em minutos"}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-muted rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                isLogin 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                !isLogin 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      className="pl-10 h-12"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Nome da empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Nome do hotel ou empresa"
                      className="pl-10 h-12"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {isLogin ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Lembrar de mim
                  </label>
                </div>
                <button type="button" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  required={!isLogin}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  Concordo com os <span className="text-primary hover:underline">Termos de Uso</span> e{" "}
                  <span className="text-primary hover:underline">Política de Privacidade</span>
                </label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold" 
              disabled={isLoading || (!isLogin && !formData.acceptTerms)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-muted-foreground">
                ou continue com
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>LGPD Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
