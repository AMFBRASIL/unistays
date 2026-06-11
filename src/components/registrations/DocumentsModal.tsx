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
  FileText,
  FileCheck,
  Upload,
  Download,
  Check,
  AlertCircle,
  Info,
  User,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const documentTypes = [
  { id: "identity", label: "Documento de Identidade", icon: User, color: "from-blue-500 to-cyan-500", examples: "RG, CNH, Passaporte" },
  { id: "cpf", label: "CPF", icon: FileCheck, color: "from-emerald-500 to-green-500", examples: "Cadastro de Pessoa Física" },
  { id: "cnpj", label: "CNPJ", icon: Building2, color: "from-purple-500 to-violet-500", examples: "Cadastro Nacional de Pessoa Jurídica" },
  { id: "proof", label: "Comprovante", icon: FileText, color: "from-amber-500 to-orange-500", examples: "Residência, Pagamento" },
  { id: "contract", label: "Contrato", icon: FileCheck, color: "from-red-500 to-rose-500", examples: "Contratos e acordos" },
];

const validationTypes = [
  { id: "none", label: "Nenhuma", description: "Apenas upload" },
  { id: "required", label: "Obrigatório", description: "Documento obrigatório" },
  { id: "validate", label: "Validar", description: "Validar formato/validade" },
  { id: "verify", label: "Verificar", description: "Verificação manual necessária" },
];

export function DocumentsModal({ open, onOpenChange }: DocumentsModalProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    documentType: "",
    description: "",
    validationType: "required",
    expirationRequired: false,
    maxSize: "5",
    allowedFormats: ["pdf", "jpg", "png"],
    isRequired: true,
    isActive: true,
  });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setActiveTab("general");
      setFormData({
        name: "",
        code: "",
        documentType: "",
        description: "",
        validationType: "required",
        expirationRequired: false,
        maxSize: "5",
        allowedFormats: ["pdf", "jpg", "png"],
        isRequired: true,
        isActive: true,
      });
    }, 300);
  };

  const handleSubmit = () => {
    toast.success("Tipo de Documento Criado", {
      description: `${formData.name} foi cadastrado com sucesso!`,
    });
    handleClose();
  };

  const toggleFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      allowedFormats: prev.allowedFormats.includes(format)
        ? prev.allowedFormats.filter(f => f !== format)
        : [...prev.allowedFormats, format]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-gray-500/10 via-slate-500/10 to-gray-500/10">
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-gray-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <FileText className="h-32 w-32 text-gray-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-gray-500 to-slate-500">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-700">Tipos de Documentos</DialogTitle>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Configure tipos de documentos aceitos no sistema
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[calc(95vh-180px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="validation">Validação</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
                        <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Tipo de Documento
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Configure os tipos de documentos que serão aceitos e gerenciados no sistema.
                        </p>
                      </div>
                    </div>

                    {/* Document Type */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        Categoria do Documento
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {documentTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, documentType: type.id }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.documentType === type.id
                                  ? "border-gray-500 bg-gray-500/10"
                                  : "border-border hover:border-gray-300 bg-card"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-semibold text-foreground">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.examples}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome do Tipo</Label>
                        <Input
                          id="name"
                          placeholder="Ex: RG - Registro Geral"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input
                          id="code"
                          placeholder="Ex: DOC-RG-01"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        placeholder="Descreva o documento e suas especificações..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-background min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Validation Tab */}
              <TabsContent value="validation" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Validação e Verificação
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Configure regras de validação e verificação dos documentos.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Tipo de Validação</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {validationTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setFormData(prev => ({ ...prev, validationType: type.id }))}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.validationType === type.id
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-border hover:border-blue-300 bg-card"
                            }`}
                          >
                            <p className="font-semibold text-foreground">{type.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                            <FileCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Exigir Data de Validade</Label>
                            <p className="text-xs text-muted-foreground">Documento possui data de expiração</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.expirationRequired}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, expirationRequired: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                        <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                          Configurações de Upload
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Defina limites e formatos aceitos para upload de documentos.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxSize">Tamanho Máximo (MB)</Label>
                        <Input
                          id="maxSize"
                          type="number"
                          min="1"
                          max="50"
                          placeholder="5"
                          value={formData.maxSize}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxSize: e.target.value }))}
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Tamanho máximo do arquivo</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Formatos Aceitos</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["pdf", "jpg", "jpeg", "png", "doc", "docx"].map((format) => (
                          <button
                            key={format}
                            onClick={() => toggleFormat(format)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              formData.allowedFormats.includes(format)
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-border hover:border-purple-300 bg-card"
                            }`}
                          >
                            <p className="font-medium text-foreground text-sm uppercase">{format}</p>
                            {formData.allowedFormats.includes(format) && (
                              <Check className="h-4 w-4 text-purple-500 mx-auto mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                              <FileCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Documento Obrigatório</Label>
                              <p className="text-xs text-muted-foreground">Exigir upload para cadastro</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isRequired}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <Label className="text-base font-semibold">Tipo Ativo</Label>
                              <p className="text-xs text-muted-foreground">Disponível para uso</p>
                            </div>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                          />
                        </div>
                      </div>
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
            <span>Os documentos serão validados conforme as regras configuradas</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-gray-600 to-slate-500 hover:from-gray-700 hover:to-slate-600 text-white shadow-lg shadow-gray-500/25"
            >
              <Check className="h-4 w-4 mr-2" />
              Salvar Tipo de Documento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
