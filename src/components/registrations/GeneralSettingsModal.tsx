import { useState, useEffect } from "react";
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
  Settings2,
  Globe,
  Calendar,
  DollarSign,
  Bell,
  Shield,
  Check,
  Info,
  Sparkles,
  Clock,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface GeneralSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeneralSettingsModal({ open, onOpenChange }: GeneralSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    hotelName: "",
    legalName: "",
    cnpj: "",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h" as "12h" | "24h",
    fiscalYearStart: "01",
    fiscalYearEnd: "12",
    businessHoursStart: "08:00",
    businessHoursEnd: "18:00",
    contactEmail: "",
    contactPhone: "",
    website: "",
    address: "",
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    autoBackup: true,
    backupFrequency: "daily" as "hourly" | "daily" | "weekly" | "monthly",
  });

  // Função para formatar CNPJ
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  // Função para formatar telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Carregar configurações quando o modal abrir
  useEffect(() => {
    if (open) {
      loadGeneralSettings();
    }
  }, [open]);

  const loadGeneralSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGeneralSettings();
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          hotelName: data.hotelName || "",
          legalName: data.legalName || "",
          cnpj: data.cnpj ? formatCNPJ(data.cnpj.replace(/\D/g, '')) : "",
          timezone: data.timezone || "America/Sao_Paulo",
          currency: data.currency || "BRL",
          language: data.language || "pt-BR",
          dateFormat: data.dateFormat || "DD/MM/YYYY",
          timeFormat: data.timeFormat || "24h",
          fiscalYearStart: data.fiscalYearStart || "01",
          fiscalYearEnd: data.fiscalYearEnd || "12",
          businessHoursStart: data.businessHoursStart || "08:00",
          businessHoursEnd: data.businessHoursEnd || "18:00",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone ? formatPhone(data.contactPhone.replace(/\D/g, '')) : "",
          website: data.website || "",
          address: data.address || "",
          enableNotifications: data.enableNotifications !== undefined ? data.enableNotifications : true,
          enableEmailNotifications: data.enableEmailNotifications !== undefined ? data.enableEmailNotifications : true,
          enableSmsNotifications: data.enableSmsNotifications !== undefined ? data.enableSmsNotifications : false,
          autoBackup: data.autoBackup !== undefined ? data.autoBackup : true,
          backupFrequency: data.backupFrequency || "daily",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações gerais:", error);
      // Não mostrar erro se não houver configuração ainda (é normal na primeira vez)
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const data = {
        hotelName: formData.hotelName.trim() || null,
        legalName: formData.legalName.trim() || null,
        cnpj: formData.cnpj.trim() || null,
        timezone: formData.timezone,
        currency: formData.currency,
        language: formData.language,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        fiscalYearStart: formData.fiscalYearStart,
        fiscalYearEnd: formData.fiscalYearEnd,
        businessHoursStart: formData.businessHoursStart || null,
        businessHoursEnd: formData.businessHoursEnd || null,
        contactEmail: formData.contactEmail.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        website: formData.website.trim() || null,
        address: formData.address.trim() || null,
        enableNotifications: formData.enableNotifications,
        enableEmailNotifications: formData.enableEmailNotifications,
        enableSmsNotifications: formData.enableSmsNotifications,
        autoBackup: formData.autoBackup,
        backupFrequency: formData.backupFrequency,
      };

      const response = await api.createOrUpdateGeneralSettings(data);

      if (response.success) {
        toast.success("Configurações Salvas", {
          description: "As configurações gerais foram atualizadas com sucesso!",
        });
        handleClose();
      } else {
        toast.error(response.error?.message || "Erro ao salvar configurações");
      }
    } catch (error: any) {
      console.error("Erro ao salvar configurações gerais:", error);
      toast.error("Erro ao salvar configurações gerais");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timezones = [
    { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
    { value: "America/Manaus", label: "Manaus (GMT-4)" },
    { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
    { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Settings2 className="h-32 w-32 text-purple-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Settings2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-purple-600">Configurações Gerais</DialogTitle>
                <p className="text-sm font-normal text-purple-500 mt-1">
                  Configure parâmetros gerais do sistema e hotel
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="localization">Localização</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Informações Básicas
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Configure informações básicas e de identificação do estabelecimento.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hotelName">Nome do Hotel</Label>
                        <Input
                          id="hotelName"
                          placeholder="Ex: Hotel Exemplo"
                          value={formData.hotelName}
                          onChange={(e) => setFormData(prev => ({ ...prev, hotelName: e.target.value }))}
                          className="bg-background"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="legalName">Razão Social</Label>
                        <Input
                          id="legalName"
                          placeholder="Ex: Hotel Exemplo LTDA"
                          value={formData.legalName}
                          onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                          className="bg-background"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          setFormData(prev => ({ ...prev, cnpj: formatted }));
                        }}
                        maxLength={18}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço Completo</Label>
                      <Textarea
                        id="address"
                        placeholder="Endereço completo do estabelecimento"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-background min-h-[80px]"
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Localization Tab */}
              <TabsContent value="localization" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Localização e Formatação
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure fuso horário, moeda, idioma e formatos de data/hora.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select 
                          value={formData.timezone} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Moeda</Label>
                        <Select 
                          value={formData.currency} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BRL">BRL - Real Brasileiro (R$)</SelectItem>
                            <SelectItem value="USD">USD - Dólar Americano ($)</SelectItem>
                            <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                            <SelectItem value="GBP">GBP - Libra Esterlina (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select 
                          value={formData.language} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-background" disabled={isLoading}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Formato de Data</Label>
                        <Select 
                          value={formData.dateFormat} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, dateFormat: v }))}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select 
                          value={formData.timeFormat} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, timeFormat: v as "12h" | "24h" }))}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                      <Label className="text-base font-semibold mb-4 block">Ano Fiscal</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fiscalYearStart">Mês Início</Label>
                          <Select 
                            value={formData.fiscalYearStart} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, fiscalYearStart: v }))}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                  {new Date(2000, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fiscalYearEnd">Mês Fim</Label>
                          <Select 
                            value={formData.fiscalYearEnd} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, fiscalYearEnd: v }))}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                                  {new Date(2000, month - 1).toLocaleString('pt-BR', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          Informações de Contato
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Configure dados de contato do estabelecimento.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-emerald-400" />
                          E-mail de Contato
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="contato@hotel.com"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          className="bg-background"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-400" />
                          Telefone de Contato
                        </Label>
                        <Input
                          id="contactPhone"
                          placeholder="(00) 0000-0000"
                          value={formData.contactPhone}
                          onChange={(e) => {
                            const formatted = formatPhone(e.target.value);
                            setFormData(prev => ({ ...prev, contactPhone: formatted }));
                          }}
                          maxLength={15}
                          className="bg-background"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="text"
                        placeholder="www.hotel.com ou https://www.hotel.com"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                      <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        Horário de Funcionamento
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessHoursStart">Abertura</Label>
                          <Input
                            id="businessHoursStart"
                            type="time"
                            value={formData.businessHoursStart}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessHoursStart: e.target.value }))}
                            className="bg-background"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessHoursEnd">Fechamento</Label>
                          <Input
                            id="businessHoursEnd"
                            type="time"
                            value={formData.businessHoursEnd}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessHoursEnd: e.target.value }))}
                            className="bg-background"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                        <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Notificações do Sistema
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Configure preferências de notificações e backups automáticos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                              <Bell className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Notificações Gerais</Label>
                              <p className="text-xs text-muted-foreground">Ativar notificações do sistema</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableNotifications}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableNotifications: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <Mail className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Notificações por E-mail</Label>
                              <p className="text-xs text-muted-foreground">Enviar notificações por e-mail</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableEmailNotifications}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableEmailNotifications: checked }))}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-green-500/5 to-emerald-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                              <Phone className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Notificações por SMS</Label>
                              <p className="text-xs text-muted-foreground">Enviar notificações por SMS</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableSmsNotifications}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSmsNotifications: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Backup Automático</Label>
                              <p className="text-xs text-muted-foreground">Executar backups automáticos</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.autoBackup}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoBackup: checked }))}
                            disabled={isLoading}
                          />
                        </div>
                        {formData.autoBackup && (
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="backupFrequency">Frequência do Backup</Label>
                            <Select 
                              value={formData.backupFrequency} 
                              onValueChange={(v) => setFormData(prev => ({ ...prev, backupFrequency: v as "hourly" | "daily" | "weekly" | "monthly" }))}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">A cada Hora</SelectItem>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>As configurações serão aplicadas imediatamente após salvar</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
