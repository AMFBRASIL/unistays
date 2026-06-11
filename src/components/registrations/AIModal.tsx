import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Copy,
  X,
  AlertCircle,
  Info,
  TestTube,
  Settings,
  Key,
  Globe,
  Server,
  Cpu,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const aiProviders = [
  {
    id: "openai",
    name: "OpenAI",
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    description: "GPT-4, GPT-3.5 e outros modelos avançados",
    features: ["GPT-4", "GPT-3.5 Turbo", "Embeddings", "Moderação"],
    popular: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: Bot,
    color: "from-orange-500 to-amber-500",
    description: "Claude 3 - IA conversacional avançada",
    features: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    popular: true,
  },
  {
    id: "google",
    name: "Google Gemini",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    description: "Gemini Pro - Modelo multimodal do Google",
    features: ["Gemini Pro", "Gemini Ultra", "Multimodal"],
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    icon: Server,
    color: "from-blue-600 to-indigo-600",
    description: "OpenAI via Azure - Enterprise ready",
    features: ["GPT-4", "GPT-3.5", "Embeddings", "Enterprise"],
  },
  {
    id: "custom",
    name: "API Customizada",
    icon: Globe,
    color: "from-purple-500 to-pink-500",
    description: "Use sua própria API de IA",
    features: ["Endpoint customizado", "Headers personalizados"],
  },
];

const getProviderIcon = (providerId: string) => {
  const provider = aiProviders.find(p => p.id === providerId);
  return provider ? provider.icon : Sparkles;
};

const getProviderColor = (providerId: string) => {
  const provider = aiProviders.find(p => p.id === providerId);
  return provider ? provider.color : "from-gray-500 to-gray-600";
};

const getProviderName = (providerId: string) => {
  const provider = aiProviders.find(p => p.id === providerId);
  return provider ? provider.name : providerId;
};

export function AIModal({ open, onOpenChange }: AIModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<any | null>(null);
  const [editingConfig, setEditingConfig] = useState<any | null>(null);
  const [configs, setConfigs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    provider: "",
    name: "",
    apiKey: "",
    apiEndpoint: "",
    model: "",
    temperature: "0.7",
    maxTokens: "",
    organizationId: "",
    projectId: "",
    region: "",
    isActive: true,
    isDefault: false,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open && mode === "list") {
      loadConfigs();
    }
  }, [open, mode]);

  // Filter configs based on search term
  const filteredConfigs = useMemo(() => {
    return configs.filter((config) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (config.name || "").toLowerCase();
      const provider = getProviderName(config.provider).toLowerCase();
      return name.includes(search) || provider.includes(search);
    });
  }, [configs, searchTerm]);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAiConfigs();
      if (response.success && response.data?.aiConfigs) {
        setConfigs(response.data.aiConfigs);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações de IA");
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getAiConfigById(id);
      if (response.success && response.data) {
        const config = response.data;
        setEditingConfig(config);
        
        setFormData({
          provider: config.provider || "",
          name: config.name || "",
          apiKey: config.apiKey ?? "",
          apiEndpoint: config.apiEndpoint || "",
          model: config.model || "",
          temperature: config.temperature?.toString() || "0.7",
          maxTokens: config.maxTokens?.toString() || "",
          organizationId: config.organizationId || "",
          projectId: config.projectId || "",
          region: config.region || "",
          isActive: config.isActive !== false,
          isDefault: config.isDefault || false,
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
    // Validações
    if (!formData.name.trim()) {
      toast.error("Nome da configuração é obrigatório");
      return;
    }
    if (!formData.provider) {
      toast.error("Provedor é obrigatório");
      return;
    }
    if (formData.provider !== "custom" && !formData.apiKey.trim()) {
      toast.error("API Key é obrigatória");
      return;
    }
    if (formData.provider === "custom" && !formData.apiEndpoint.trim()) {
      toast.error("Endpoint é obrigatório para API customizada");
      return;
    }

    try {
      setIsSubmitting(true);

      const baseData: any = {
        provider: formData.provider,
        name: formData.name.trim(),
        apiEndpoint: formData.apiEndpoint.trim() || null,
        model: formData.model.trim() || null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        maxTokens: formData.maxTokens ? parseInt(formData.maxTokens, 10) : null,
        organizationId: formData.organizationId.trim() || null,
        projectId: formData.projectId.trim() || null,
        region: formData.region.trim() || null,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };
      // Na criação, API Key é obrigatória; na edição, só enviar se o usuário preencheu (senão mantém a atual)
      if (!editingConfig) {
        baseData.apiKey = formData.apiKey.trim() || null;
      } else if (formData.apiKey.trim()) {
        baseData.apiKey = formData.apiKey.trim();
      }

      let response;
      if (editingConfig) {
        response = await api.updateAiConfig(editingConfig.id, baseData);
        if (response.success) {
          toast.success("Configuração Atualizada", {
            description: `${formData.name} foi atualizada com sucesso!`,
          });
          await loadConfigs();
          setMode("list");
          setEditingConfig(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar configuração");
        }
      } else {
        response = await api.createAiConfig(baseData);
        if (response.success) {
          toast.success("Configuração Criada", {
            description: `${formData.name} foi criada com sucesso!`,
          });
          await loadConfigs();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao criar configuração");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      provider: "",
      name: "",
      apiKey: "",
      apiEndpoint: "",
      model: "",
      temperature: "0.7",
      maxTokens: "",
      organizationId: "",
      projectId: "",
      region: "",
      isActive: true,
      isDefault: false,
    });
    setShowApiKey(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setEditingConfig(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingConfig(null);
    setMode("create");
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (config: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingConfig(config);
    setMode("edit");
    loadConfigForEdit(config.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setEditingConfig(null);
    resetForm();
    loadConfigs();
  };

  const handleDeleteClick = (config: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!configToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteAiConfig(configToDelete.id);

      if (response.success) {
        toast.success("Configuração Excluída", {
          description: `${configToDelete.name} foi excluída com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
        await loadConfigs();
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

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConfigToDelete(null);
  };

  const handleTestConnection = async () => {
    if (!editingConfig) {
      toast.error("Salve a configuração antes de testar");
      return;
    }

    try {
      setIsTesting(true);
      const response = await api.testAiConfig(editingConfig.id);

      if (response.success) {
        toast.success("Teste de Conexão", {
          description: response.data?.message || "Conexão testada com sucesso!",
        });
        await loadConfigs();
      } else {
        toast.error(response.error?.message || "Erro ao testar conexão");
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast.error("Erro ao testar conexão");
    } finally {
      setIsTesting(false);
    }
  };

  const getModelPlaceholder = () => {
    switch (formData.provider) {
      case "openai":
        return "gpt-4, gpt-3.5-turbo, gpt-4-turbo";
      case "anthropic":
        return "claude-3-opus-20240229, claude-3-sonnet-20240229";
      case "google":
        return "gemini-pro, gemini-ultra";
      case "azure":
        return "gpt-4, gpt-35-turbo";
      default:
        return "Nome do modelo";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-5xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Sparkles className="h-24 w-24 text-purple-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Configuração de IA" 
                        : mode === "edit"
                        ? "Editar Configuração"
                        : "Nova Configuração de IA"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-purple-600">
                      {mode === "list" 
                        ? "Gerencie os provedores de IA do sistema" 
                        : mode === "edit"
                        ? "Edite a configuração de IA"
                        : "Configure um novo provedor de IA para uso no sistema"}
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
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Configurações de IA</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredConfigs.length} de {configs.length} {configs.length === 1 ? "configuração cadastrada" : "configurações cadastradas"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Configuração
                      </Button>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, provedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                  ) : configs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma configuração cadastrada</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeira Configuração
                      </Button>
                    </div>
                  ) : filteredConfigs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhuma configuração encontrada com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Configs Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredConfigs.map((config) => {
                        const ProviderIcon = getProviderIcon(config.provider);
                        const providerColor = getProviderColor(config.provider);
                        
                        return (
                          <Card 
                            key={config.id}
                            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                            onClick={() => handleEditClick(config)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${providerColor} shadow-lg`}>
                                  <ProviderIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                  <Badge 
                                    className={config.isActive ? "bg-emerald-500" : "bg-gray-500"}
                                  >
                                    {config.isActive ? "Ativa" : "Inativa"}
                                  </Badge>
                                  {config.isDefault && (
                                    <Badge variant="secondary" className="text-xs">
                                      Padrão
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <h4 className="font-semibold text-lg mb-2">{config.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {getProviderName(config.provider)}
                              </p>
                              
                              {config.model && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                  <Cpu className="h-3 w-3" />
                                  <span>{config.model}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-4 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1"
                                  onClick={(e) => handleEditClick(config, e)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => handleDeleteClick(config, e)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* CREATE/EDIT MODE */
                <div className="space-y-6">
                  {/* Provider Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Provedor de IA *
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {aiProviders.map((provider) => {
                        const ProviderIcon = provider.icon;
                        return (
                          <button
                            key={provider.id}
                            onClick={() => setFormData(prev => ({ ...prev, provider: provider.id, model: "", apiEndpoint: "" }))}
                            disabled={editingConfig !== null}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.provider === provider.id
                                ? "border-purple-500 bg-purple-500/10 shadow-md"
                                : "border-border hover:border-purple-300 bg-card"
                            } ${editingConfig ? "opacity-75 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${provider.color} flex items-center justify-center`}>
                                <ProviderIcon className="h-5 w-5 text-white" />
                              </div>
                              {provider.popular && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </div>
                            <p className="font-semibold text-sm mb-1">{provider.name}</p>
                            <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.features.slice(0, 2).map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {formData.provider === provider.id && (
                              <div className="flex justify-center mt-2">
                                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Configuração *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: OpenAI Principal"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        placeholder={getModelPlaceholder()}
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {/* API Key / Endpoint */}
                  {formData.provider === "custom" ? (
                    <div className="space-y-2">
                      <Label htmlFor="apiEndpoint">Endpoint da API *</Label>
                      <Input
                        id="apiEndpoint"
                        placeholder="https://api.exemplo.com/v1/chat"
                        value={formData.apiEndpoint}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="apiKey">API Key *</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type={showApiKey ? "text" : "password"}
                          placeholder={editingConfig ? "Deixe em branco para manter a atual" : "sk-..."}
                          value={formData.apiKey}
                          onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                          className="bg-background pr-10"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {editingConfig && (
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco para manter a API key atual
                        </p>
                      )}
                    </div>
                  )}

                  {/* Provider-specific fields */}
                  {formData.provider === "openai" && (
                    <div className="space-y-2">
                      <Label htmlFor="organizationId">Organization ID (Opcional)</Label>
                      <Input
                        id="organizationId"
                        placeholder="org-..."
                        value={formData.organizationId}
                        onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                        className="bg-background"
                      />
                    </div>
                  )}

                  {(formData.provider === "google" || formData.provider === "azure") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectId">Project ID</Label>
                        <Input
                          id="projectId"
                          placeholder="meu-projeto"
                          value={formData.projectId}
                          onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                          className="bg-background"
                        />
                      </div>
                      {formData.provider === "azure" && (
                        <div className="space-y-2">
                          <Label htmlFor="region">Região</Label>
                          <Input
                            id="region"
                            placeholder="eastus, westus2, etc"
                            value={formData.region}
                            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advanced Settings */}
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Sliders className="h-5 w-5 text-purple-400" />
                        <h4 className="font-semibold">Configurações Avançadas</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature (0.0 - 2.0)</Label>
                          <Input
                            id="temperature"
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            placeholder="0.7"
                            value={formData.temperature}
                            onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            Controla a criatividade (0.0 = determinístico, 2.0 = muito criativo)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                          <Input
                            id="maxTokens"
                            type="number"
                            min="1"
                            placeholder="1000"
                            value={formData.maxTokens}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: e.target.value }))}
                            className="bg-background"
                          />
                          <p className="text-xs text-muted-foreground">
                            Limite máximo de tokens na resposta
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Configuração Ativa</p>
                            <p className="text-sm text-muted-foreground">Disponível para uso no sistema</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-500/20">
                            <Settings className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Configuração Padrão</p>
                            <p className="text-sm text-muted-foreground">Usada automaticamente pelo sistema</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isDefault}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-medium mb-2">Como funciona:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                            <li>A configuração padrão será usada automaticamente em todo o sistema</li>
                            <li>Você pode ter múltiplas configurações e alternar entre elas</li>
                            <li>A API Key é criptografada e armazenada com segurança</li>
                            <li>Use o botão "Testar Conexão" para verificar se está funcionando</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  disabled={isSubmitting || isTesting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex gap-2">
                  {editingConfig && (
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={isSubmitting || isTesting}
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Testar Conexão
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    disabled={isSubmitting || isTesting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isTesting}
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/25"
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
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a configuração <strong>{configToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Provedor: {configToDelete ? getProviderName(configToDelete.provider) : "N/A"}
              </span>
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
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
    </>
  );
}
