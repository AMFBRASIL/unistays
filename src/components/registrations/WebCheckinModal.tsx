import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MonitorSmartphone,
  Smartphone,
  FileText,
  Camera,
  Shield,
  Clock,
  Check,
  Info,
  Sparkles,
  User,
  Calendar,
  CreditCard,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface WebCheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebCheckinModal({ open, onOpenChange }: WebCheckinModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    enabled: true,
    allowAdvanceCheckin: true,
    advanceCheckinDays: "7",
    requireDocuments: true,
    requirePhoto: false,
    requirePayment: true,
    requireTerms: true,
    sendReminder: true,
    reminderHours: "24",
    autoAssignRoom: false,
    showRoomSelection: true,
    welcomeMessage: "",
    termsText: "",
    allowedPaymentMethods: ["credit", "debit", "pix"],
    language: "pt-BR",
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    toast.success("Configurações Salvas", {
      description: "As configurações de Web Check-in foram atualizadas!",
    });
    handleClose();
  };

  const paymentMethods = [
    { id: "credit", label: "Cartão de Crédito" },
    { id: "debit", label: "Cartão de Débito" },
    { id: "pix", label: "PIX" },
    { id: "bank_slip", label: "Boleto" },
  ];

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPaymentMethods: prev.allowedPaymentMethods.includes(method)
        ? prev.allowedPaymentMethods.filter(m => m !== method)
        : [...prev.allowedPaymentMethods, method]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-cyan-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Smartphone className="h-32 w-32 text-cyan-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <MonitorSmartphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-cyan-600">Web Check-in</DialogTitle>
                <p className="text-sm font-normal text-cyan-500 mt-1">
                  Configure o sistema de check-in digital para hóspedes
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="requirements">Requisitos</TabsTrigger>
                <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                <TabsTrigger value="messages">Mensagens</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                      <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                        <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-1">
                          Configurações Gerais
                        </h4>
                        <p className="text-sm text-cyan-700 dark:text-cyan-300">
                          Ative e configure o sistema de check-in digital para seus hóspedes.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                            <MonitorSmartphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Web Check-in Ativado</Label>
                            <p className="text-xs text-muted-foreground">Habilitar check-in digital</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                    </div>

                    {formData.enabled && (
                      <>
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                                <Calendar className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-semibold">Check-in Antecipado</Label>
                                <p className="text-xs text-muted-foreground">Permitir check-in antes da data</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.allowAdvanceCheckin}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowAdvanceCheckin: checked }))}
                            />
                          </div>
                          {formData.allowAdvanceCheckin && (
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="advanceCheckinDays">Dias de Antecedência Máxima</Label>
                              <Input
                                id="advanceCheckinDays"
                                type="number"
                                min="1"
                                max="30"
                                value={formData.advanceCheckinDays}
                                onChange={(e) => setFormData(prev => ({ ...prev, advanceCheckinDays: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                                  <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <Label className="text-base font-semibold">Seleção de Quarto</Label>
                                  <p className="text-xs text-muted-foreground">Permitir escolha de quarto</p>
                                </div>
                              </div>
                              <Switch
                                checked={formData.showRoomSelection}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showRoomSelection: checked }))}
                              />
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <Label className="text-base font-semibold">Atribuição Automática</Label>
                                  <p className="text-xs text-muted-foreground">Atribuir quarto automaticamente</p>
                                </div>
                              </div>
                              <Switch
                                checked={formData.autoAssignRoom}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAssignRoom: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                                <Bell className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-semibold">Enviar Lembrete</Label>
                                <p className="text-xs text-muted-foreground">Enviar lembrete de check-in</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.sendReminder}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendReminder: checked }))}
                            />
                          </div>
                          {formData.sendReminder && (
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="reminderHours">Horas Antes do Check-in</Label>
                              <Input
                                id="reminderHours"
                                type="number"
                                min="1"
                                max="168"
                                value={formData.reminderHours}
                                onChange={(e) => setFormData(prev => ({ ...prev, reminderHours: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Requisitos e Documentos
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure quais documentos e informações são obrigatórios no check-in.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Documentos Obrigatórios</Label>
                              <p className="text-xs text-muted-foreground">Exigir upload de documentos</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requireDocuments}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireDocuments: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Foto do Hóspede</Label>
                              <p className="text-xs text-muted-foreground">Exigir foto do hóspede</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requirePhoto}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requirePhoto: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Aceitar Termos</Label>
                              <p className="text-xs text-muted-foreground">Exigir aceite de termos</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requireTerms}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireTerms: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          Pagamento no Check-in
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Configure métodos de pagamento disponíveis no web check-in.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Exigir Pagamento</Label>
                            <p className="text-xs text-muted-foreground">Exigir pagamento no check-in</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.requirePayment}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requirePayment: checked }))}
                        />
                      </div>

                      {formData.requirePayment && (
                        <div className="mt-4">
                          <Label className="text-base font-semibold mb-3 block">Métodos de Pagamento Aceitos</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {paymentMethods.map((method) => (
                              <button
                                key={method.id}
                                onClick={() => togglePaymentMethod(method.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  formData.allowedPaymentMethods.includes(method.id)
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-border hover:border-emerald-300 bg-card"
                                }`}
                              >
                                <p className="font-medium text-sm text-center">{method.label}</p>
                                {formData.allowedPaymentMethods.includes(method.id) && (
                                  <Check className="h-4 w-4 text-emerald-500 mx-auto mt-2" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                        <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Mensagens e Textos
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Personalize mensagens e termos exibidos durante o check-in.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                      <Textarea
                        id="welcomeMessage"
                        placeholder="Bem-vindo! Complete seu check-in digital..."
                        value={formData.welcomeMessage}
                        onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                        className="bg-background min-h-[100px]"
                      />
                    </div>

                    {formData.requireTerms && (
                      <div className="space-y-2">
                        <Label htmlFor="termsText">Texto dos Termos</Label>
                        <Textarea
                          id="termsText"
                          placeholder="Ao prosseguir, você concorda com nossos termos..."
                          value={formData.termsText}
                          onChange={(e) => setFormData(prev => ({ ...prev, termsText: e.target.value }))}
                          className="bg-background min-h-[150px]"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma Padrão</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>O link de check-in será gerado automaticamente</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            >
              <Check className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
