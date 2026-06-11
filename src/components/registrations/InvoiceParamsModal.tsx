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
  FileSpreadsheet,
  Building2,
  Key,
  Check,
  Info,
  Shield,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface InvoiceParamsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceParamsModal({ open, onOpenChange }: InvoiceParamsModalProps) {
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    stateRegistration: "",
    municipalRegistration: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    nfProvider: "sefaz" as "sefaz" | "nfcom",
    certificatePath: "",
    certificatePassword: "",
    serie: "1",
    environment: "homologation" as "production" | "homologation",
    autoEmit: false,
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

  // Função para formatar CEP
  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  // Carregar configurações quando o modal abrir
  useEffect(() => {
    if (open) {
      loadInvoiceParams();
    }
  }, [open]);

  const loadInvoiceParams = async () => {
    try {
      setIsLoading(true);
      const response = await api.getInvoiceParams();
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          companyName: data.companyName || "",
          cnpj: data.cnpj ? formatCNPJ(data.cnpj.replace(/\D/g, '')) : "",
          stateRegistration: data.stateRegistration || "",
          municipalRegistration: data.municipalRegistration || "",
          address: data.address || "",
          number: data.number || "",
          complement: data.complement || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode ? formatCEP(data.zipCode.replace(/\D/g, '')) : "",
          phone: data.phone || "",
          email: data.email || "",
          nfProvider: data.nfProvider || "sefaz",
          certificatePath: data.certificatePath || "",
          certificatePassword: data.certificatePassword === "***" ? "" : (data.certificatePassword || ""), // Se for "***", deixar vazio (mantém a senha existente)
          serie: data.serie || "1",
          environment: data.environment || "homologation",
          autoEmit: data.autoEmit || false,
        });
        // Se já existe certificado carregado, marcar como arquivo
        if (data.certificatePath) {
          setCertificateFile(null); // Reset, será mostrado pelo caminho
        }
      }
    } catch (error) {
      console.error("Erro ao carregar parâmetros de nota fiscal:", error);
      // Não mostrar erro se não houver configuração ainda (é normal na primeira vez)
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar CEP via API
  const fetchCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
            zipCode: formatCEP(cleanCEP), // Garantir formato correto
          }));
          toast.success("CEP encontrado e campos preenchidos");
        } else {
          toast.error("CEP não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Erro ao buscar CEP");
      }
    }
  };

  const handleCertificateUpload = async (file: File) => {
    // Validar extensão
    const allowedExtensions = ['.pfx', '.p12', '.cer', '.pem', '.crt', '.key'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Tipo de arquivo não permitido. Apenas certificados digitais (.pfx, .p12, .cer, .pem, .crt) são aceitos.');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    try {
      setIsUploadingCertificate(true);
      setCertificateFile(file);

      const response = await api.uploadCertificate(file);

      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          certificatePath: response.data.path,
        }));
        toast.success("Certificado Digital Enviado", {
          description: "Certificado carregado com sucesso!",
        });
      } else {
        toast.error(response.error?.message || "Erro ao fazer upload do certificado");
        setCertificateFile(null);
      }
    } catch (error: any) {
      console.error("Erro ao fazer upload do certificado:", error);
      toast.error("Erro ao fazer upload do certificado");
      setCertificateFile(null);
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  const handleRemoveCertificate = () => {
    setCertificateFile(null);
    setFormData(prev => ({
      ...prev,
      certificatePath: "",
    }));
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const data = {
        companyName: formData.companyName.trim() || null,
        cnpj: formData.cnpj.trim() || null,
        stateRegistration: formData.stateRegistration.trim() || null,
        municipalRegistration: formData.municipalRegistration.trim() || null,
        address: formData.address.trim() || null,
        number: formData.number.trim() || null,
        complement: formData.complement.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.replace(/\D/g, '') || null, // Enviar apenas números
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        nfProvider: formData.nfProvider,
        certificatePath: formData.certificatePath.trim() || null,
        certificatePassword: formData.certificatePassword.trim() || null, // Se vazio, manter a existente no backend
        serie: formData.serie.trim() || "1",
        environment: formData.environment,
        autoEmit: formData.autoEmit,
      };

      const response = await api.createOrUpdateInvoiceParams(data);

      if (response.success) {
        toast.success("Configurações Salvas", {
          description: "Parâmetros de Nota Fiscal atualizados com sucesso!",
        });
        handleClose();
      } else {
        toast.error(response.error?.message || "Erro ao salvar configurações");
      }
    } catch (error: any) {
      console.error("Erro ao salvar parâmetros de nota fiscal:", error);
      toast.error("Erro ao salvar parâmetros de nota fiscal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-orange-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <FileSpreadsheet className="h-32 w-32 text-orange-500" />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-orange-600">Parâmetros de Nota Fiscal</DialogTitle>
                <p className="text-sm font-normal text-orange-500 mt-1">
                  Configure emissão de notas fiscais eletrônicas
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="certificate">Certificado</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                        <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                          Dados da Empresa
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Informações da empresa para emissão de NF-e.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Razão Social</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          className="bg-background"
                        />
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
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
                        <Input
                          id="stateRegistration"
                          value={formData.stateRegistration}
                          onChange={(e) => setFormData(prev => ({ ...prev, stateRegistration: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
                        <Input
                          id="municipalRegistration"
                          value={formData.municipalRegistration}
                          onChange={(e) => setFormData(prev => ({ ...prev, municipalRegistration: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="zipCode"
                          placeholder="00000-000"
                          value={formData.zipCode}
                          onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            setFormData(prev => ({ ...prev, zipCode: formatted }));
                          }}
                          onBlur={(e) => {
                            const cleanCEP = e.target.value.replace(/\D/g, '');
                            if (cleanCEP.length === 8) {
                              fetchCEP(cleanCEP);
                            }
                          }}
                          maxLength={9}
                          className="bg-background flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const cleanCEP = formData.zipCode.replace(/\D/g, '');
                            if (cleanCEP.length === 8) {
                              fetchCEP(cleanCEP);
                            } else {
                              toast.error("CEP deve ter 8 dígitos");
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Buscar"
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço (Rua, Avenida, etc.)</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                          id="number"
                          value={formData.number}
                          onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          placeholder="Apt, Bloco, etc."
                          value={formData.complement}
                          onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado (UF)</Label>
                        <Input
                          id="state"
                          placeholder="SP, RJ, MG..."
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          placeholder="(00) 0000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contato@empresa.com.br"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificate" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Certificado Digital
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure o certificado digital A1 ou A3 para assinatura.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Certificado Digital</Label>
                        <p className="text-xs text-muted-foreground mb-4">
                          Faça upload do arquivo do certificado digital (.pfx, .p12, .cer, .pem, .crt)
                        </p>
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isUploadingCertificate
                              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 cursor-wait'
                              : formData.certificatePath || certificateFile
                              ? 'border-green-400 bg-green-50 dark:bg-green-950/20 cursor-default'
                              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 cursor-pointer'
                          }`}
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files.length > 0) {
                              handleCertificateUpload(files[0]);
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onClick={() => {
                            if (!isUploadingCertificate && !formData.certificatePath && !certificateFile) {
                              document.getElementById('certificate-upload')?.click();
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept=".pfx,.p12,.cer,.pem,.crt,.key"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                handleCertificateUpload(files[0]);
                              }
                            }}
                            disabled={isUploadingCertificate}
                            className="hidden"
                            id="certificate-upload"
                          />
                          {isUploadingCertificate ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                              <span className="text-sm text-muted-foreground">
                                Enviando certificado...
                              </span>
                            </div>
                          ) : (formData.certificatePath || certificateFile) ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Shield className="h-8 w-8 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {certificateFile?.name || (formData.certificatePath ? formData.certificatePath.split('/').pop() : 'Certificado carregado')}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCertificate();
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Upload className="h-8 w-8 text-blue-500" />
                              <span className="text-sm font-medium text-blue-600">
                                Clique ou arraste o certificado aqui
                              </span>
                              <span className="text-xs text-muted-foreground">
                                .pfx, .p12, .cer, .pem, .crt (máx. 10MB)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="certificatePassword" className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-blue-400" />
                          Senha do Certificado
                        </Label>
                        <Input
                          id="certificatePassword"
                          type="password"
                          placeholder="Digite a senha do certificado"
                          value={formData.certificatePassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, certificatePassword: e.target.value }))}
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                          A senha será criptografada e armazenada com segurança
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nfProvider">Provedor NF-e</Label>
                        <Select 
                          value={formData.nfProvider} 
                          onValueChange={(v: "sefaz" | "nfcom") => setFormData(prev => ({ ...prev, nfProvider: v }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sefaz">SEFAZ</SelectItem>
                            <SelectItem value="nfcom">NFCom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serie">Série</Label>
                        <Input
                          id="serie"
                          value={formData.serie}
                          onChange={(e) => setFormData(prev => ({ ...prev, serie: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="environment">Ambiente</Label>
                        <Select 
                          value={formData.environment} 
                          onValueChange={(v: "production" | "homologation") => setFormData(prev => ({ ...prev, environment: v }))}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="homologation">Homologação</SelectItem>
                            <SelectItem value="production">Produção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Emissão Automática</Label>
                            <p className="text-xs text-muted-foreground">Emitir NF automaticamente</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.autoEmit}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoEmit: checked }))}
                        />
                      </div>
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
            <span>Certifique-se de que o certificado digital está válido</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
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
