import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Briefcase, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface QuickGuestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (guest: any) => void;
}

export function QuickGuestModal({ open, onOpenChange, onSuccess }: QuickGuestModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        birthdate: "",
        nationality: "Brasileiro",
        address: "",
        addressNumber: "",
        complement: "",
        zipCode: "",
        city: "",
        state: "",
        country: "Brasil",
        company: "",
        occupation: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.email) {
            toast.error("Preencha os campos obrigatórios (Nome e E-mail)");
            return;
        }

        onSuccess(formData);
        onOpenChange(false);
        toast.success("Hóspede cadastrado com sucesso!");
        setFormData({
            name: "",
            email: "",
            phone: "",
            cpf: "",
            birthdate: "",
            nationality: "Brasileiro",
            address: "",
            addressNumber: "",
            complement: "",
            zipCode: "",
            city: "",
            state: "",
            country: "Brasil",
            company: "",
            occupation: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        <User className="w-5 h-5 text-emerald-400" />
                        Novo Hóspede Rápido
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="w-4 h-4" /> Dados Pessoais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Nome Completo *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Nome do hóspede"
                                />
                            </div>
                            <div>
                                <Label>E-mail *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Telefone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>CPF</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={formData.cpf}
                                        onChange={(e) => handleChange("cpf", e.target.value)}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Data de Nascimento</Label>
                                <Input
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={(e) => handleChange("birthdate", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Endereço
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <Label>CEP</Label>
                                <Input
                                    value={formData.zipCode}
                                    onChange={(e) => handleChange("zipCode", e.target.value)}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Label>Endereço</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    placeholder="Rua, Avenida..."
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label>Número</Label>
                                <Input
                                    value={formData.addressNumber}
                                    onChange={(e) => handleChange("addressNumber", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Cidade</Label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label>UF</Label>
                                <Input
                                    value={formData.state}
                                    onChange={(e) => handleChange("state", e.target.value)}
                                    maxLength={2}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <Label>País</Label>
                                <Input
                                    value={formData.country}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Profissional
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Empresa</Label>
                                <Input
                                    value={formData.company}
                                    onChange={(e) => handleChange("company", e.target.value)}
                                    placeholder="Nome da empresa"
                                />
                            </div>
                            <div>
                                <Label>Profissão</Label>
                                <Input
                                    value={formData.occupation}
                                    onChange={(e) => handleChange("occupation", e.target.value)}
                                    placeholder="Cargo ou profissão"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
                        Salvar Hóspede
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
