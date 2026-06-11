
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Key, Eye, EyeOff, Lock } from "lucide-react";

interface ResetPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
    userName: string;
    onSuccess?: () => void;
}

export function ResetPasswordModal({
    open,
    onOpenChange,
    userId,
    userName,
    onSuccess,
}: ResetPasswordModalProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.resetUserPassword(userId, password);

            if (response.success) {
                toast.success("Senha resetada com sucesso!");
                onOpenChange(false);
                setPassword("");
                setConfirmPassword("");
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.error?.message || "Erro ao resetar senha");
            }
        } catch (error) {
            toast.error("Erro ao resetar senha");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle>Resetar Senha</DialogTitle>
                            <DialogDescription>
                                Defina uma nova senha para <strong>{userName}</strong>.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9 pr-10"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-9 pr-10"
                                placeholder="Confirme a nova senha"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600">
                            {isSubmitting ? "Salvando..." : "Resetar Senha"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
