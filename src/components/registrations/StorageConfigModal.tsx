import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HardDrive,
  Cloud,
  Server,
  Check,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Key,
  Globe,
  Folder,
  Shield,
  Settings,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface StorageConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const storageProviders = [
  {
    id: "local",
    icon: HardDrive,
    label: "Armazenamento Local",
    description: "Usa o sistema de arquivos do servidor",
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "s3",
    icon: Cloud,
    label: "Amazon S3",
    description: "AWS Simple Storage Service",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "gcs",
    icon: Cloud,
    label: "Google Cloud Storage",
    description: "Google Cloud Storage",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "azure",
    icon: Cloud,
    label: "Azure Blob Storage",
    description: "Microsoft Azure Storage",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "digitalocean",
    icon: Server,
    label: "DigitalOcean Spaces",
    description: "DigitalOcean Object Storage",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "cloudflare",
    icon: Cloud,
    label: "Cloudflare R2",
    description: "Cloudflare R2 Object Storage",
    color: "from-orange-400 to-orange-500",
  },
];

export function StorageConfigModal({ open, onOpenChange }: StorageConfigModalProps): JSX.Element {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<any | null>(null);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    provider: "",
    isDefault: false,
    isActive: true,
    // Local
    baseUrl: "/uploads",
    // S3
    s3Bucket: "",
    s3Region: "",
    s3AccessKeyId: "",
    s3SecretAccessKey: "",
    s3Endpoint: "",
    s3UsePathStyle: false,
    // GCS
    gcsBucket: "",
    gcsProjectId: "",
    gcsKeyFile: "",
    // Azure
    azureAccountName: "",
    azureAccountKey: "",
    azureContainer: "",
    // DigitalOcean
    doSpaceName: "",
    doRegion: "",
    doAccessKey: "",
    doSecretKey: "",
    doEndpoint: "",
    // Cloudflare
    cfAccountId: "",
    cfAccessKeyId: "",
    cfSecretAccessKey: "",
    cfBucketName: "",
    cfEndpoint: "",
    // Geral
    maxFileSize: "10485760",
    allowedExtensions: "jpg,jpeg,png,webp,pdf",
    cdnUrl: "",
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadStorageConfigs();
      if (!editingConfig) {
        setMode("list");
      }
    }
  }, [open]);

  // Load config data when editing
  useEffect(() => {
    if (editingConfig && mode === "edit" && open) {
      loadConfigForEdit(editingConfig.id);
    }
  }, [editingConfig?.id, mode, open]);

  const loadStorageConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await api.getStorageConfigs();
      if (response.success && response.data?.storageConfigs) {
        setConfigs(response.data.storageConfigs);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações de armazenamento");
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getStorageConfigById(id);
      if (response.success && response.data?.storageConfig) {
        const config = response.data.storageConfig;
        setSelectedProvider(config.provider);
        setFormData({
          name: config.name || "",
          description: config.description || "",
          provider: config.provider || "",
          isDefault: config.isDefault || false,
          isActive: config.isActive !== false,
          baseUrl: config.baseUrl || "/uploads",
          s3Bucket: config.s3Bucket || "",
          s3Region: config.s3Region || "",
          s3AccessKeyId: config.s3AccessKeyId || "",
          s3SecretAccessKey: config.s3SecretAccessKey === "***" ? "" : config.s3SecretAccessKey || "",
          s3Endpoint: config.s3Endpoint || "",
          s3UsePathStyle: config.s3UsePathStyle || false,
          gcsBucket: config.gcsBucket || "",
          gcsProjectId: config.gcsProjectId || "",
          gcsKeyFile: config.gcsKeyFile || "",
          azureAccountName: config.azureAccountName || "",
          azureAccountKey: config.azureAccountKey === "***" ? "" : config.azureAccountKey || "",
          azureContainer: config.azureContainer || "",
          doSpaceName: config.doSpaceName || "",
          doRegion: config.doRegion || "",
          doAccessKey: config.doAccessKey || "",
          doSecretKey: config.doSecretKey === "***" ? "" : config.doSecretKey || "",
          doEndpoint: config.doEndpoint || "",
          cfAccountId: config.cfAccountId || "",
          cfAccessKeyId: config.cfAccessKeyId || "",
          cfSecretAccessKey: config.cfSecretAccessKey === "***" ? "" : config.cfSecretAccessKey || "",
          cfBucketName: config.cfBucketName || "",
          cfEndpoint: config.cfEndpoint || "",
          maxFileSize: config.maxFileSize ? config.maxFileSize.toString() : "10485760",
          allowedExtensions: config.allowedExtensions ? config.allowedExtensions.join(",") : "jpg,jpeg,png,webp",
          cdnUrl: config.cdnUrl || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
      toast.error("Erro ao carregar dados da configuração");
      setEditingConfig(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.provider) {
      toast.error("Selecione um provedor de armazenamento");
      return;
    }

    try {
      setIsSubmitting(true);

      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        provider: formData.provider,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        maxFileSize: parseInt(formData.maxFileSize) || 10485760,
        allowedExtensions: formData.allowedExtensions.split(",").map(e => e.trim()).filter(e => e),
        baseUrl: formData.baseUrl || null,
        cdnUrl: formData.cdnUrl || null,
      };

      // Adicionar campos específicos do provedor
      if (formData.provider === "s3") {
        data.s3Bucket = formData.s3Bucket || null;
        data.s3Region = formData.s3Region || null;
        data.s3AccessKeyId = formData.s3AccessKeyId || null;
        data.s3SecretAccessKey = formData.s3SecretAccessKey || null;
        data.s3Endpoint = formData.s3Endpoint || null;
        data.s3UsePathStyle = formData.s3UsePathStyle;
      } else if (formData.provider === "gcs") {
        data.gcsBucket = formData.gcsBucket || null;
        data.gcsProjectId = formData.gcsProjectId || null;
        data.gcsKeyFile = formData.gcsKeyFile || null;
      } else if (formData.provider === "azure") {
        data.azureAccountName = formData.azureAccountName || null;
        data.azureAccountKey = formData.azureAccountKey || null;
        data.azureContainer = formData.azureContainer || null;
      } else if (formData.provider === "digitalocean") {
        data.doSpaceName = formData.doSpaceName || null;
        data.doRegion = formData.doRegion || null;
        data.doAccessKey = formData.doAccessKey || null;
        data.doSecretKey = formData.doSecretKey || null;
        data.doEndpoint = formData.doEndpoint || null;
      } else if (formData.provider === "cloudflare") {
        data.cfAccountId = formData.cfAccountId || null;
        data.cfAccessKeyId = formData.cfAccessKeyId || null;
        data.cfSecretAccessKey = formData.cfSecretAccessKey || null;
        data.cfBucketName = formData.cfBucketName || null;
        data.cfEndpoint = formData.cfEndpoint || null;
      }

      let response;
      if (editingConfig) {
        response = await api.updateStorageConfig(editingConfig.id, data);
        if (response.success) {
          toast.success("Configuração Atualizada", {
            description: `Configuração ${formData.name} foi atualizada com sucesso!`,
          });
        } else {
          toast.error(response.error?.message || "Erro ao atualizar configuração");
        }
      } else {
        response = await api.createStorageConfig(data);
        if (response.success) {
          toast.success("Configuração Criada", {
            description: `Configuração ${formData.name} foi criada com sucesso!`,
          });
        } else {
          toast.error(response.error?.message || "Erro ao criar configuração");
        }
      }

      if (response.success) {
        await loadStorageConfigs();
        setMode("list");
        setEditingConfig(null);
        resetForm();
      }
    } catch (error) {
      console.error(`Erro ao ${editingConfig ? 'atualizar' : 'criar'} configuração:`, error);
      toast.error(`Erro ao ${editingConfig ? 'atualizar' : 'criar'} configuração`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider("");
    setEditingConfig(null);
    setFormData({
      name: "",
      description: "",
      provider: "",
      isDefault: false,
      isActive: true,
      baseUrl: "/uploads",
      s3Bucket: "",
      s3Region: "",
      s3AccessKeyId: "",
      s3SecretAccessKey: "",
      s3Endpoint: "",
      s3UsePathStyle: false,
      gcsBucket: "",
      gcsProjectId: "",
      gcsKeyFile: "",
      azureAccountName: "",
      azureAccountKey: "",
      azureContainer: "",
      doSpaceName: "",
      doRegion: "",
      doAccessKey: "",
      doSecretKey: "",
      doEndpoint: "",
      cfAccountId: "",
      cfAccessKeyId: "",
      cfSecretAccessKey: "",
      cfBucketName: "",
      cfEndpoint: "",
      maxFileSize: "10485760",
      allowedExtensions: "jpg,jpeg,png,webp,pdf",
      cdnUrl: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingConfig(null);
    setMode("create");
    resetForm();
  };

  const handleEditClick = (config: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConfig(config);
    setMode("edit");
  };

  const handleBackToList = () => {
    setMode("list");
    setEditingConfig(null);
    resetForm();
  };

  const handleDeleteClick = (config: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!configToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteStorageConfig(configToDelete.id);

      if (response.success) {
        toast.success("Configuração Excluída", {
          description: `Configuração ${configToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
        await loadStorageConfigs();
      } else {
        toast.error(response.error?.message || "Erro ao excluir configuração");
      }
    } catch (error) {
      console.error("Erro ao excluir configuração:", error);
      toast.error("Erro ao excluir configuração");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setFormData(prev => ({ ...prev, provider: providerId }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-slate-500/10 flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-slate-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>
          
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
            <HardDrive className="h-24 w-24 text-slate-500" />
          </div>

          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-slate-500 to-gray-500">
                  <HardDrive className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {mode === "list" 
                      ? "Armazenamento" 
                      : mode === "edit"
                      ? "Editar Configuração"
                      : "Nova Configuração"}
                  </DialogTitle>
                  <p className="text-sm font-normal text-slate-600">
                    {mode === "list" 
                      ? "Gerencie as configurações de armazenamento" 
                      : mode === "edit"
                      ? "Edite a configuração de armazenamento"
                      : "Configure um novo método de armazenamento"}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {mode === "list" ? (
              /* LIST MODE */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Configurações de Armazenamento</h3>
                    <p className="text-sm text-muted-foreground">
                      {configs.length} {configs.length === 1 ? "configuração cadastrada" : "configurações cadastradas"}
                    </p>
                  </div>
                  <Button
                    onClick={handleNewClick}
                    className="bg-gradient-to-r from-slate-600 to-gray-500 hover:from-slate-700 hover:to-gray-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Configuração
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                  </div>
                ) : configs.length === 0 ? (
                  <div className="p-12 rounded-xl border-2 border-dashed border-border text-center">
                    <HardDrive className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma configuração cadastrada</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Configure seu primeiro método de armazenamento
                    </p>
                    <Button
                      onClick={handleNewClick}
                      className="bg-gradient-to-r from-slate-600 to-gray-500 hover:from-slate-700 hover:to-gray-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Configuração
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {configs.map((config) => {
                      const providerInfo = storageProviders.find(p => p.id === config.provider);
                      const ProviderIcon = providerInfo?.icon || Cloud;
                      
                      return (
                        <div
                          key={config.id}
                          className="p-6 rounded-xl border-2 bg-card hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl bg-gradient-to-r ${providerInfo?.color || "from-gray-500 to-gray-600"}`}>
                                <ProviderIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg">{config.name}</h4>
                                <p className="text-sm text-muted-foreground">{providerInfo?.label || config.provider}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {config.isDefault && (
                                <Badge className="bg-emerald-500 text-white">Padrão</Badge>
                              )}
                              {config.isActive ? (
                                <Badge className="bg-blue-500 text-white">Ativo</Badge>
                              ) : (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </div>
                          </div>
                          {config.description && (
                            <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleEditClick(config, e)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleDeleteClick(config, e)}
                              disabled={isDeleting || config.isDefault}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* CREATE/EDIT MODE */
              <div className="space-y-6">
                {/* Provider Selection - Large Cards */}
                {!editingConfig && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-slate-400" />
                        Escolha o Método de Armazenamento *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Selecione onde os arquivos serão armazenados
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storageProviders.map((provider) => {
                        const ProviderIcon = provider.icon;
                        const isSelected = selectedProvider === provider.id;
                        
                        return (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleProviderSelect(provider.id)}
                            className={`p-6 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-slate-500 bg-slate-500/10 shadow-lg shadow-slate-500/10"
                                : "border-border hover:border-slate-300 bg-card hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${provider.color} flex items-center justify-center flex-shrink-0`}>
                                <ProviderIcon className="h-8 w-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-lg mb-1">
                                  {provider.label}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {provider.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0">
                                  <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editingConfig && (
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      <strong>Provedor:</strong> {storageProviders.find(p => p.id === editingConfig.provider)?.label || editingConfig.provider}
                    </p>
                  </div>
                )}

                {/* Basic Information */}
                {selectedProvider && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-slate-400" />
                        Informações Básicas
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome da Configuração *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Armazenamento Principal"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="provider">Provedor *</Label>
                          <Input
                            id="provider"
                            value={storageProviders.find(p => p.id === formData.provider)?.label || formData.provider}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva esta configuração..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Check className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div>
                                <Label htmlFor="isDefault">Configuração Padrão</Label>
                                <p className="text-xs text-muted-foreground">Usar como padrão do sistema</p>
                              </div>
                            </div>
                            <Switch
                              id="isDefault"
                              checked={formData.isDefault}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                            />
                          </div>
                        </div>
                        <div className="p-5 rounded-xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Shield className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <Label htmlFor="isActive">Status</Label>
                                <p className="text-xs text-muted-foreground">Configuração ativa</p>
                              </div>
                            </div>
                            <Switch
                              id="isActive"
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provider-Specific Fields */}
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Key className="h-5 w-5 text-slate-400" />
                        Configurações do Provedor
                      </h3>

                      {formData.provider === "local" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="baseUrl">URL Base</Label>
                            <Input
                              id="baseUrl"
                              placeholder="/uploads"
                              value={formData.baseUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Caminho base onde os arquivos serão armazenados
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.provider === "s3" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="s3Bucket">Bucket *</Label>
                              <Input
                                id="s3Bucket"
                                placeholder="meu-bucket"
                                value={formData.s3Bucket}
                                onChange={(e) => setFormData(prev => ({ ...prev, s3Bucket: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="s3Region">Região *</Label>
                              <Input
                                id="s3Region"
                                placeholder="us-east-1"
                                value={formData.s3Region}
                                onChange={(e) => setFormData(prev => ({ ...prev, s3Region: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="s3AccessKeyId">Access Key ID *</Label>
                              <Input
                                id="s3AccessKeyId"
                                placeholder="AKIAIOSFODNN7EXAMPLE"
                                value={formData.s3AccessKeyId}
                                onChange={(e) => setFormData(prev => ({ ...prev, s3AccessKeyId: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="s3SecretAccessKey">Secret Access Key *</Label>
                              <Input
                                id="s3SecretAccessKey"
                                type="password"
                                placeholder="••••••••••••"
                                value={formData.s3SecretAccessKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, s3SecretAccessKey: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="s3Endpoint">Endpoint (Opcional)</Label>
                            <Input
                              id="s3Endpoint"
                              placeholder="https://s3.amazonaws.com"
                              value={formData.s3Endpoint}
                              onChange={(e) => setFormData(prev => ({ ...prev, s3Endpoint: e.target.value }))}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Deixe vazio para usar o endpoint padrão da AWS
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="s3UsePathStyle"
                              checked={formData.s3UsePathStyle}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, s3UsePathStyle: checked }))}
                            />
                            <Label htmlFor="s3UsePathStyle">Usar path-style URLs</Label>
                          </div>
                        </div>
                      )}

                      {formData.provider === "gcs" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gcsBucket">Bucket *</Label>
                              <Input
                                id="gcsBucket"
                                placeholder="meu-bucket"
                                value={formData.gcsBucket}
                                onChange={(e) => setFormData(prev => ({ ...prev, gcsBucket: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gcsProjectId">Project ID *</Label>
                              <Input
                                id="gcsProjectId"
                                placeholder="meu-projeto"
                                value={formData.gcsProjectId}
                                onChange={(e) => setFormData(prev => ({ ...prev, gcsProjectId: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gcsKeyFile">Arquivo de Chave (JSON) *</Label>
                            <Textarea
                              id="gcsKeyFile"
                              placeholder="Cole o conteúdo do arquivo JSON de credenciais..."
                              value={formData.gcsKeyFile}
                              onChange={(e) => setFormData(prev => ({ ...prev, gcsKeyFile: e.target.value }))}
                              className="bg-background min-h-[120px] font-mono text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {formData.provider === "azure" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="azureAccountName">Nome da Conta *</Label>
                              <Input
                                id="azureAccountName"
                                placeholder="minhaconta"
                                value={formData.azureAccountName}
                                onChange={(e) => setFormData(prev => ({ ...prev, azureAccountName: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="azureContainer">Container *</Label>
                              <Input
                                id="azureContainer"
                                placeholder="meu-container"
                                value={formData.azureContainer}
                                onChange={(e) => setFormData(prev => ({ ...prev, azureContainer: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="azureAccountKey">Chave da Conta *</Label>
                            <Input
                              id="azureAccountKey"
                              type="password"
                              placeholder="••••••••••••"
                              value={formData.azureAccountKey}
                              onChange={(e) => setFormData(prev => ({ ...prev, azureAccountKey: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {formData.provider === "digitalocean" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="doSpaceName">Nome do Space *</Label>
                              <Input
                                id="doSpaceName"
                                placeholder="meu-space"
                                value={formData.doSpaceName}
                                onChange={(e) => setFormData(prev => ({ ...prev, doSpaceName: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="doRegion">Região *</Label>
                              <Input
                                id="doRegion"
                                placeholder="nyc3"
                                value={formData.doRegion}
                                onChange={(e) => setFormData(prev => ({ ...prev, doRegion: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="doAccessKey">Access Key *</Label>
                              <Input
                                id="doAccessKey"
                                placeholder="DO00..."
                                value={formData.doAccessKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, doAccessKey: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="doSecretKey">Secret Key *</Label>
                              <Input
                                id="doSecretKey"
                                type="password"
                                placeholder="••••••••••••"
                                value={formData.doSecretKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, doSecretKey: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="doEndpoint">Endpoint</Label>
                            <Input
                              id="doEndpoint"
                              placeholder="https://nyc3.digitaloceanspaces.com"
                              value={formData.doEndpoint}
                              onChange={(e) => setFormData(prev => ({ ...prev, doEndpoint: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {formData.provider === "cloudflare" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cfAccountId">Account ID *</Label>
                              <Input
                                id="cfAccountId"
                                placeholder="abc123..."
                                value={formData.cfAccountId}
                                onChange={(e) => setFormData(prev => ({ ...prev, cfAccountId: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cfBucketName">Bucket Name *</Label>
                              <Input
                                id="cfBucketName"
                                placeholder="meu-bucket"
                                value={formData.cfBucketName}
                                onChange={(e) => setFormData(prev => ({ ...prev, cfBucketName: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cfAccessKeyId">Access Key ID *</Label>
                              <Input
                                id="cfAccessKeyId"
                                placeholder="..."
                                value={formData.cfAccessKeyId}
                                onChange={(e) => setFormData(prev => ({ ...prev, cfAccessKeyId: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cfSecretAccessKey">Secret Access Key *</Label>
                              <Input
                                id="cfSecretAccessKey"
                                type="password"
                                placeholder="••••••••••••"
                                value={formData.cfSecretAccessKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, cfSecretAccessKey: e.target.value }))}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cfEndpoint">Endpoint</Label>
                            <Input
                              id="cfEndpoint"
                              placeholder="https://[account-id].r2.cloudflarestorage.com"
                              value={formData.cfEndpoint}
                              onChange={(e) => setFormData(prev => ({ ...prev, cfEndpoint: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {/* General Settings */}
                      <div className="space-y-4 border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Folder className="h-5 w-5 text-slate-400" />
                          Configurações Gerais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize">Tamanho Máximo (bytes)</Label>
                            <Input
                              id="maxFileSize"
                              type="number"
                              placeholder="10485760"
                              value={formData.maxFileSize}
                              onChange={(e) => setFormData(prev => ({ ...prev, maxFileSize: e.target.value }))}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              {formData.maxFileSize ? `${(parseInt(formData.maxFileSize) / 1048576).toFixed(2)} MB` : "0 MB"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="allowedExtensions">Extensões Permitidas</Label>
                            <Input
                              id="allowedExtensions"
                              placeholder="jpg,jpeg,png,webp,pdf"
                              value={formData.allowedExtensions}
                              onChange={(e) => setFormData(prev => ({ ...prev, allowedExtensions: e.target.value }))}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Separe por vírgula
                            </p>
                          </div>
                        </div>

                        {formData.provider !== "local" && (
                          <div className="space-y-2">
                            <Label htmlFor="cdnUrl">URL do CDN (Opcional)</Label>
                            <Input
                              id="cdnUrl"
                              placeholder="https://cdn.exemplo.com"
                              value={formData.cdnUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, cdnUrl: e.target.value }))}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              URL base do CDN para servir os arquivos (se aplicável)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30 flex-shrink-0">
          {mode === "list" ? (
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à Lista
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedProvider || !formData.name.trim()}
                className="bg-gradient-to-r from-slate-600 to-gray-500 hover:from-slate-700 hover:to-gray-600 text-white shadow-lg shadow-slate-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingConfig ? "Atualizando..." : "Criando..."}
                  </>
                ) : editingConfig ? (
                  "Atualizar Configuração"
                ) : (
                  "Criar Configuração"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a configuração <strong>{configToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Provedor: {storageProviders.find(p => p.id === configToDelete?.provider)?.label || configToDelete?.provider || "N/A"}
              </span>
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
