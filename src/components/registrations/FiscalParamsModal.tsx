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
  Calculator,
  Percent,
  Receipt,
  Check,
  Info,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface FiscalParamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FiscalParamsModal({ open, onOpenChange }: FiscalParamsModalProps) {
  const [activeTab, setActiveTab] = useState("taxes");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    icmsRate: "",
    ipiRate: "",
    pisRate: "",
    cofinsRate: "",
    issRate: "",
    icmsIncluded: true,
    ipiIncluded: false,
    pisIncluded: true,
    cofinsIncluded: true,
    issIncluded: true,
    taxRegime: "simples_nacional" as "simples_nacional" | "lucro_presumido" | "lucro_real",
  });

  // Carregar configurações quando o modal abrir
  useEffect(() => {
    if (open) {
      loadFiscalParams();
    }
  }, [open]);

  const loadFiscalParams = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFiscalParams(); // Global (sem propertyId)

      if (response.success && response.data) {
        const params = response.data;
        setFormData({
          icmsRate: params.icmsRate !== null && params.icmsRate !== undefined ? params.icmsRate.toString() : "",
          ipiRate: params.ipiRate !== null && params.ipiRate !== undefined ? params.ipiRate.toString() : "",
          pisRate: params.pisRate !== null && params.pisRate !== undefined ? params.pisRate.toString() : "",
          cofinsRate: params.cofinsRate !== null && params.cofinsRate !== undefined ? params.cofinsRate.toString() : "",
          issRate: params.issRate !== null && params.issRate !== undefined ? params.issRate.toString() : "",
          icmsIncluded: params.icmsIncluded ?? true,
          ipiIncluded: params.ipiIncluded ?? false,
          pisIncluded: params.pisIncluded ?? true,
          cofinsIncluded: params.cofinsIncluded ?? true,
          issIncluded: params.issIncluded ?? true,
          taxRegime: params.taxRegime || "simples_nacional",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar parâmetros fiscais:", error);
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

      // Preparar dados para envio (converter strings vazias para null e números para números)
      const submitData = {
        propertyId: null, // Configuração global
        taxRegime: formData.taxRegime,
        icmsRate: formData.icmsRate && formData.icmsRate.trim() !== "" ? parseFloat(formData.icmsRate) : null,
        icmsIncluded: formData.icmsIncluded,
        ipiRate: formData.ipiRate && formData.ipiRate.trim() !== "" ? parseFloat(formData.ipiRate) : null,
        ipiIncluded: formData.ipiIncluded,
        pisRate: formData.pisRate && formData.pisRate.trim() !== "" ? parseFloat(formData.pisRate) : null,
        pisIncluded: formData.pisIncluded,
        cofinsRate: formData.cofinsRate && formData.cofinsRate.trim() !== "" ? parseFloat(formData.cofinsRate) : null,
        cofinsIncluded: formData.cofinsIncluded,
        issRate: formData.issRate && formData.issRate.trim() !== "" ? parseFloat(formData.issRate) : null,
        issIncluded: formData.issIncluded,
      };

      const response = await api.createOrUpdateFiscalParams(submitData);

      if (response.success) {
        toast.success("Configurações Salvas", {
          description: "Parâmetros fiscais atualizados com sucesso!",
        });
        handleClose();
      } else {
        throw new Error(response.error?.message || "Erro ao salvar parâmetros fiscais");
      }
    } catch (error: any) {
      console.error("Erro ao salvar parâmetros fiscais:", error);
      toast.error("Erro ao salvar parâmetros fiscais", {
        description: error.message || "Ocorreu um erro ao salvar as configurações",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <Calculator className="h-32 w-32 text-amber-500" />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-amber-500 to-yellow-500">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-amber-600">Parâmetros Fiscais</DialogTitle>
                <p className="text-sm font-normal text-amber-500 mt-1">
                  Configure impostos e regime tributário
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                  <TabsTrigger value="taxes">Impostos</TabsTrigger>
                  <TabsTrigger value="regime">Regime</TabsTrigger>
                </TabsList>

                <TabsContent value="taxes" className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                          <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                            Alíquotas de Impostos
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Configure as alíquotas dos principais impostos.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: "icms", label: "ICMS", rate: formData.icmsRate, included: formData.icmsIncluded },
                          { id: "ipi", label: "IPI", rate: formData.ipiRate, included: formData.ipiIncluded },
                          { id: "pis", label: "PIS", rate: formData.pisRate, included: formData.pisIncluded },
                          { id: "cofins", label: "COFINS", rate: formData.cofinsRate, included: formData.cofinsIncluded },
                          { id: "iss", label: "ISS", rate: formData.issRate, included: formData.issIncluded },
                        ].map((tax) => (
                          <div key={tax.id} className="p-4 rounded-xl border bg-card">
                            <div className="flex items-center justify-between mb-3">
                              <Label className="font-semibold">{tax.label}</Label>
                              <Switch
                                checked={tax.included}
                                onCheckedChange={(checked) => {
                                  setFormData(prev => ({ ...prev, [`${tax.id}Included`]: checked } as any));
                                }}
                              />
                            </div>
                            {tax.included && (
                              <div className="space-y-2">
                                <Label htmlFor={`${tax.id}Rate`}>Alíquota (%)</Label>
                                <Input
                                  id={`${tax.id}Rate`}
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={tax.rate}
                                  onChange={(e) => {
                                    setFormData(prev => ({ ...prev, [`${tax.id}Rate`]: e.target.value } as any));
                                  }}
                                  className="bg-background"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="regime" className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="taxRegime">Regime Tributário</Label>
                        <Select 
                          value={formData.taxRegime} 
                          onValueChange={(v) => setFormData(prev => ({ ...prev, taxRegime: v }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                            <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                            <SelectItem value="lucro_real">Lucro Real</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Consulte um contador para alíquotas corretas</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/25"
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
