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
  Hotel,
  Globe,
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  Settings2,
  Shield,
  Check,
  Info,
  Sparkles,
  Eye,
  Smartphone,
  Monitor,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface BookingEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingEngineModal({ open, onOpenChange }: BookingEngineModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    enabled: true,
    websiteUrl: "",
    bookingUrl: "",
    enableInstantBooking: true,
    requirePayment: true,
    requireDeposit: false,
    depositPercentage: "30",
    minAdvanceBooking: "0",
    maxAdvanceBooking: "365",
    defaultCurrency: "BRL" as "BRL" | "USD" | "EUR",
    availableLanguages: ["pt-BR"] as string[],
    enableSearchFilters: true,
    showPriceInclusive: false,
    enableGuestReviews: true,
    enableRecommendations: true,
    mobileOptimized: true,
    enableGoogleAnalytics: false,
    googleAnalyticsId: "",
  });

  // Carregar configurações quando o modal abrir
  useEffect(() => {
    if (open) {
      loadBookingEngineConfig();
    }
  }, [open]);

  const loadBookingEngineConfig = async () => {
    try {
      setIsLoading(true);
      const response = await api.getBookingEngineConfig(); // Global (sem propertyId)

      if (response.success && response.data) {
        const config = response.data;
        setFormData({
          enabled: config.enabled ?? true,
          websiteUrl: config.websiteUrl || "",
          bookingUrl: config.bookingUrl || "",
          enableInstantBooking: config.enableInstantBooking ?? true,
          requirePayment: config.requirePayment ?? true,
          requireDeposit: config.requireDeposit ?? false,
          depositPercentage: config.depositPercentage?.toString() || "30",
          minAdvanceBooking: config.minAdvanceBooking?.toString() || "0",
          maxAdvanceBooking: config.maxAdvanceBooking?.toString() || "365",
          defaultCurrency: config.defaultCurrency || "BRL",
          availableLanguages: config.availableLanguages || ["pt-BR"],
          enableSearchFilters: config.enableSearchFilters ?? true,
          showPriceInclusive: config.showPriceInclusive ?? false,
          enableGuestReviews: config.enableGuestReviews ?? true,
          enableRecommendations: config.enableRecommendations ?? true,
          mobileOptimized: config.mobileOptimized ?? true,
          enableGoogleAnalytics: config.enableGoogleAnalytics ?? false,
          googleAnalyticsId: config.googleAnalyticsId || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do motor de reserva:", error);
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

      const submitData = {
        propertyId: null, // Configuração global
        enabled: formData.enabled,
        websiteUrl: formData.websiteUrl.trim() || null,
        bookingUrl: formData.bookingUrl.trim() || null,
        defaultCurrency: formData.defaultCurrency,
        availableLanguages: formData.availableLanguages.length > 0 ? formData.availableLanguages : null,
        enableInstantBooking: formData.enableInstantBooking,
        minAdvanceBooking: formData.minAdvanceBooking ? parseInt(formData.minAdvanceBooking, 10) : 0,
        maxAdvanceBooking: formData.maxAdvanceBooking ? parseInt(formData.maxAdvanceBooking, 10) : 365,
        requirePayment: formData.requirePayment,
        requireDeposit: formData.requireDeposit,
        depositPercentage: formData.depositPercentage ? parseFloat(formData.depositPercentage) : null,
        enableSearchFilters: formData.enableSearchFilters,
        showPriceInclusive: formData.showPriceInclusive,
        enableGuestReviews: formData.enableGuestReviews,
        enableRecommendations: formData.enableRecommendations,
        mobileOptimized: formData.mobileOptimized,
        enableGoogleAnalytics: formData.enableGoogleAnalytics,
        googleAnalyticsId: formData.googleAnalyticsId.trim() || null,
      };

      const response = await api.createOrUpdateBookingEngineConfig(submitData);

      if (response.success) {
        toast.success("Configurações Salvas", {
          description: "Os parâmetros do Motor de Reserva foram atualizados com sucesso!",
        });
        handleClose();
      } else {
        throw new Error(response.error?.message || "Erro ao salvar configurações");
      }
    } catch (error: any) {
      console.error("Erro ao salvar configurações do motor de reserva:", error);
      toast.error("Erro ao salvar configurações", {
        description: error.message || "Ocorreu um erro ao salvar as configurações",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-blue-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Hotel className="h-32 w-32 text-blue-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                <Hotel className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-blue-600">Motor de Reserva</DialogTitle>
                <p className="text-sm font-normal text-blue-500 mt-1">
                  Configure o sistema de reservas online e booking engine
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-muted/50 p-1">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="booking">Reservas</TabsTrigger>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
                <TabsTrigger value="display">Exibição</TabsTrigger>
                <TabsTrigger value="integration">Integrações</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Configurações Gerais
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure URLs, moeda padrão e idiomas do motor de reservas.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                            <Hotel className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Motor Ativado</Label>
                            <p className="text-xs text-muted-foreground">Habilitar sistema de reservas online</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="websiteUrl">URL do Website</Label>
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://www.hotel.com"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bookingUrl">URL do Booking</Label>
                        <Input
                          id="bookingUrl"
                          type="url"
                          placeholder="https://book.hotel.com"
                          value={formData.bookingUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, bookingUrl: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultCurrency">Moeda Padrão</Label>
                        <Select 
                          value={formData.defaultCurrency} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, defaultCurrency: v }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                            <SelectItem value="USD">USD - Dólar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Booking Tab */}
              <TabsContent value="booking" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          Regras de Reserva
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Configure prazos e regras para reservas online.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minAdvanceBooking">Reserva Mínima (dias)</Label>
                        <Input
                          id="minAdvanceBooking"
                          type="number"
                          min="0"
                          value={formData.minAdvanceBooking}
                          onChange={(e) => setFormData(prev => ({ ...prev, minAdvanceBooking: e.target.value }))}
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Dias mínimos de antecedência</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAdvanceBooking">Reserva Máxima (dias)</Label>
                        <Input
                          id="maxAdvanceBooking"
                          type="number"
                          min="1"
                          value={formData.maxAdvanceBooking}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxAdvanceBooking: e.target.value }))}
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Dias máximos de antecedência</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Reserva Instantânea</Label>
                            <p className="text-xs text-muted-foreground">Confirmar reservas automaticamente</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enableInstantBooking}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableInstantBooking: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                        <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Pagamento
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Configure regras de pagamento e caução.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                              <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Exigir Pagamento</Label>
                              <p className="text-xs text-muted-foreground">Solicitar pagamento no momento da reserva</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requirePayment}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requirePayment: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Exigir Caução</Label>
                              <p className="text-xs text-muted-foreground">Solicitar depósito de garantia</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requireDeposit}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireDeposit: checked }))}
                          />
                        </div>
                        {formData.requireDeposit && (
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="depositPercentage">Percentual de Caução (%)</Label>
                            <Input
                              id="depositPercentage"
                              type="number"
                              min="0"
                              max="100"
                              value={formData.depositPercentage}
                              onChange={(e) => setFormData(prev => ({ ...prev, depositPercentage: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Display Tab */}
              <TabsContent value="display" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Filtros de Busca</Label>
                              <p className="text-xs text-muted-foreground">Ativar filtros avançados</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableSearchFilters}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSearchFilters: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <DollarSign className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Preço Inclusivo</Label>
                              <p className="text-xs text-muted-foreground">Exibir preço com impostos inclusos</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.showPriceInclusive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPriceInclusive: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Avaliações de Hóspedes</Label>
                              <p className="text-xs text-muted-foreground">Exibir avaliações e comentários</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableGuestReviews}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableGuestReviews: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-pink-500/5 to-rose-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500">
                              <Search className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Recomendações</Label>
                              <p className="text-xs text-muted-foreground">Mostrar recomendações personalizadas</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.enableRecommendations}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableRecommendations: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                              <Smartphone className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Otimizado para Mobile</Label>
                              <p className="text-xs text-muted-foreground">Interface responsiva para dispositivos móveis</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.mobileOptimized}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mobileOptimized: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900">
                        <Settings2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-violet-900 dark:text-violet-100 mb-1">
                          Integrações e Analytics
                        </h4>
                        <p className="text-sm text-violet-700 dark:text-violet-300">
                          Configure integrações e análises do motor de reservas.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-violet-500/5 to-purple-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                            <Globe className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Google Analytics</Label>
                            <p className="text-xs text-muted-foreground">Rastrear visitas e conversões</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enableGoogleAnalytics}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableGoogleAnalytics: checked }))}
                        />
                      </div>
                      {formData.enableGoogleAnalytics && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="googleAnalyticsId">ID do Google Analytics</Label>
                          <Input
                            id="googleAnalyticsId"
                            placeholder="G-XXXXXXXXXX"
                            value={formData.googleAnalyticsId}
                            onChange={(e) => setFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>O motor de reservas estará disponível na URL configurada</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25"
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
