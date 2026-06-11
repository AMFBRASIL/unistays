import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface TestEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId: number | null;
  defaultEmail?: string;
  onTestComplete?: () => void;
}

export function TestEmailModal({
  open,
  onOpenChange,
  configId,
  defaultEmail = "",
  onTestComplete,
}: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleClose = () => {
    if (!isSubmitting) {
      setTestEmail(defaultEmail);
      setTestResult(null);
      onOpenChange(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!testEmail.trim()) {
      toast.error("E-mail obrigatório", {
        description: "Por favor, insira um endereço de e-mail para teste",
      });
      return;
    }

    if (!validateEmail(testEmail.trim())) {
      toast.error("E-mail inválido", {
        description: "Por favor, insira um endereço de e-mail válido",
      });
      return;
    }

    if (!configId) {
      toast.error("Configuração não encontrada", {
        description: "Salve a configuração antes de testar",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setTestResult(null);

      const { api } = await import("@/lib/api");
      const response = await api.testEmailConfig(configId, testEmail.trim());

      if (response.success) {
        setTestResult("success");
        toast.success("E-mail de teste enviado!", {
          description: `O e-mail foi enviado com sucesso para ${testEmail.trim()}`,
        });
        
        // Callback para recarregar configuração
        if (onTestComplete) {
          setTimeout(() => {
            onTestComplete();
          }, 1000);
        }

        // Fechar modal após 2 segundos
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setTestResult("error");
        toast.error("Falha ao enviar e-mail", {
          description: response.error?.message || "Verifique a configuração e tente novamente",
        });
      }
    } catch (error: any) {
      setTestResult("error");
      console.error("Erro ao enviar e-mail de teste:", error);
      toast.error("Erro ao enviar e-mail", {
        description: error?.message || "Ocorreu um erro inesperado",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-background">
        {/* Header com gradiente moderno */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-indigo-600/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Enviar E-mail de Teste
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Envie um e-mail de teste para verificar a configuração
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Card informativo */}
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Como funciona?
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Um e-mail de teste será enviado para o endereço informado usando as configurações salvas. 
                    Verifique sua caixa de entrada (e spam) após alguns segundos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campo de e-mail */}
          <div className="space-y-2">
            <Label htmlFor="testEmail" className="text-sm font-medium">
              E-mail para teste *
            </Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting) {
                  handleSubmit();
                }
              }}
              disabled={isSubmitting}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              O e-mail de teste será enviado para este endereço
            </p>
          </div>

          {/* Resultado do teste */}
          {testResult && (
            <Card className={`border-2 ${
              testResult === "success"
                ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {testResult === "success" ? (
                    <>
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                          E-mail enviado com sucesso!
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          Verifique sua caixa de entrada em alguns instantes
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Falha ao enviar e-mail
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Verifique as configurações e tente novamente
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Badges informativos */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Envio instantâneo</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs">
              <Sparkles className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground">Teste seguro</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !testEmail.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Teste
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
