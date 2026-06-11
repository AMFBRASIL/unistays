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
  CalendarCheck,
  Clock,
  DollarSign,
  Users,
  Package,
  Check,
  Info,
  Sparkles,
  Calendar,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface DayUseParamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  { id: "morning", label: "Manhã", start: "08:00", end: "12:00", icon: Calendar },
  { id: "afternoon", label: "Tarde", start: "12:00", end: "18:00", icon: Clock },
  { id: "evening", label: "Noite", start: "18:00", end: "22:00", icon: Calendar },
  { id: "full", label: "Período Completo", start: "08:00", end: "22:00", icon: Calendar },
];

export function DayUseParamsModal({ open, onOpenChange }: DayUseParamsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    enabled: true,
    minDuration: "4",
    maxDuration: "12",
    defaultDuration: "8",
    startTime: "08:00",
    endTime: "18:00",
    allowedTimeSlots: ["morning", "afternoon"],
    requireAdvanceBooking: true,
    advanceBookingHours: "24",
    allowSameDay: true,
    maxGuests: "4",
    pricingModel: "fixed",
    basePrice: "",
    pricePerHour: "",
    pricePerPerson: false,
    includeMeals: false,
    mealPrice: "",
    includeParking: false,
    parkingPrice: "",
    cancellationPolicy: "flexible",
    refundPercentage: "80",
    availableDays: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    toast.success("Configurações Salvas", {
      description: "Os parâmetros de Day Use foram atualizados!",
    });
    handleClose();
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const weekDays = [
    { id: "dom", label: "Dom" },
    { id: "seg", label: "Seg" },
    { id: "ter", label: "Ter" },
    { id: "qua", label: "Qua" },
    { id: "qui", label: "Qui" },
    { id: "sex", label: "Sex" },
    { id: "sab", label: "Sáb" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-sky-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-sky-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <CalendarCheck className="h-32 w-32 text-sky-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-sky-500 to-blue-500">
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-sky-600">Parametrização Day Use</DialogTitle>
                <p className="text-sm font-normal text-sky-500 mt-1">
                  Configure o sistema de hospedagem por horas (Day Use)
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
                <TabsTrigger value="schedule">Horários</TabsTrigger>
                <TabsTrigger value="pricing">Preços</TabsTrigger>
                <TabsTrigger value="policies">Políticas</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
                      <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900">
                        <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sky-900 dark:text-sky-100 mb-1">
                          Configurações Gerais
                        </h4>
                        <p className="text-sm text-sky-700 dark:text-sky-300">
                          Ative e configure o módulo Day Use para hospedagem por horas.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-sky-500/5 to-blue-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500">
                            <Settings2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Day Use Ativado</Label>
                            <p className="text-xs text-muted-foreground">Habilitar sistema Day Use</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                    </div>

                    {formData.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="minDuration">Duração Mínima (horas)</Label>
                          <Input
                            id="minDuration"
                            type="number"
                            min="1"
                            value={formData.minDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, minDuration: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxDuration">Duração Máxima (horas)</Label>
                          <Input
                            id="maxDuration"
                            type="number"
                            min="1"
                            max="24"
                            value={formData.maxDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="defaultDuration">Duração Padrão (horas)</Label>
                          <Input
                            id="defaultDuration"
                            type="number"
                            min="1"
                            value={formData.defaultDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, defaultDuration: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="maxGuests">Máximo de Hóspedes</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        min="1"
                        value={formData.maxGuests}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Horários e Períodos
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure horários de funcionamento e períodos disponíveis.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Horário de Início</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Horário de Término</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Períodos Disponíveis</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {timeSlots.map((slot) => {
                          const Icon = slot.icon;
                          return (
                            <button
                              key={slot.id}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  allowedTimeSlots: prev.allowedTimeSlots.includes(slot.id)
                                    ? prev.allowedTimeSlots.filter(s => s !== slot.id)
                                    : [...prev.allowedTimeSlots, slot.id]
                                }));
                              }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.allowedTimeSlots.includes(slot.id)
                                  ? "border-sky-500 bg-sky-500/10"
                                  : "border-border hover:border-sky-300 bg-card"
                              }`}
                            >
                              <Icon className={`h-6 w-6 mx-auto mb-2 ${
                                formData.allowedTimeSlots.includes(slot.id) ? "text-sky-400" : "text-muted-foreground"
                              }`} />
                              <p className="font-medium text-sm text-center">{slot.label}</p>
                              <p className="text-xs text-muted-foreground text-center mt-1">
                                {slot.start} - {slot.end}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Dias da Semana Disponíveis</Label>
                      <div className="flex gap-2 flex-wrap">
                        {weekDays.map((day) => (
                          <button
                            key={day.id}
                            onClick={() => toggleDay(day.id)}
                            className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center text-sm font-medium ${
                              formData.availableDays.includes(day.id)
                                ? "border-sky-500 bg-sky-500/20 text-sky-600"
                                : "border-border bg-card text-muted-foreground hover:border-sky-300"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Reserva Antecipada</Label>
                              <p className="text-xs text-muted-foreground">Exigir reserva com antecedência</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.requireAdvanceBooking}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireAdvanceBooking: checked }))}
                          />
                        </div>
                        {formData.requireAdvanceBooking && (
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="advanceBookingHours">Horas de Antecedência Mínima</Label>
                            <Input
                              id="advanceBookingHours"
                              type="number"
                              min="1"
                              value={formData.advanceBookingHours}
                              onChange={(e) => setFormData(prev => ({ ...prev, advanceBookingHours: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Permitir Mesmo Dia</Label>
                              <p className="text-xs text-muted-foreground">Aceitar reservas no mesmo dia</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.allowSameDay}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowSameDay: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          Modelo de Precificação
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          Configure como os preços serão calculados para Day Use.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Modelo de Preço</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: "fixed", label: "Valor Fixo", description: "Preço único" },
                          { id: "hourly", label: "Por Hora", description: "Cobrado por hora" },
                          { id: "package", label: "Pacotes", description: "Pacotes pré-definidos" },
                        ].map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setFormData(prev => ({ ...prev, pricingModel: model.id }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.pricingModel === model.id
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-border hover:border-emerald-300 bg-card"
                            }`}
                          >
                            <p className="font-semibold text-foreground">{model.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.pricingModel === "fixed" && (
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Preço Fixo (R$)</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.basePrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    )}

                    {formData.pricingModel === "hourly" && (
                      <div className="space-y-2">
                        <Label htmlFor="pricePerHour">Preço por Hora (R$)</Label>
                        <Input
                          id="pricePerHour"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.pricePerHour}
                          onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    )}

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Preço por Pessoa</Label>
                            <p className="text-xs text-muted-foreground">Cobrar individualmente por hóspede</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.pricePerPerson}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pricePerPerson: checked }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Inclusões</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-semibold">Incluir Refeições</Label>
                                <p className="text-xs text-muted-foreground">Refeições inclusas no pacote</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.includeMeals}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeMeals: checked }))}
                            />
                          </div>
                          {formData.includeMeals && (
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="mealPrice">Valor das Refeições (R$)</Label>
                              <Input
                                id="mealPrice"
                                type="number"
                                step="0.01"
                                value={formData.mealPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, mealPrice: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-slate-500/5 to-gray-500/5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-base font-semibold">Incluir Estacionamento</Label>
                                <p className="text-xs text-muted-foreground">Estacionamento inclusos</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.includeParking}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeParking: checked }))}
                            />
                          </div>
                          {formData.includeParking && (
                            <div className="space-y-2 mt-4">
                              <Label htmlFor="parkingPrice">Valor do Estacionamento (R$)</Label>
                              <Input
                                id="parkingPrice"
                                type="number"
                                step="0.01"
                                value={formData.parkingPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, parkingPrice: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Policies Tab */}
              <TabsContent value="policies" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <Info className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                          Políticas de Cancelamento
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Configure políticas específicas para Day Use.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
                      <Select 
                        value={formData.cancellationPolicy} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, cancellationPolicy: v }))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Cancelamento Gratuito</SelectItem>
                          <SelectItem value="flexible">Flexível (até 24h antes)</SelectItem>
                          <SelectItem value="moderate">Moderada (até 48h antes)</SelectItem>
                          <SelectItem value="strict">Rígida (sem reembolso)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.cancellationPolicy !== "strict" && (
                      <div className="space-y-2">
                        <Label htmlFor="refundPercentage">Percentual de Reembolso (%)</Label>
                        <Input
                          id="refundPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.refundPercentage}
                          onChange={(e) => setFormData(prev => ({ ...prev, refundPercentage: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    )}
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
            <span>As configurações serão aplicadas a todas as reservas Day Use</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-700 hover:to-blue-600 text-white shadow-lg shadow-sky-500/25"
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
