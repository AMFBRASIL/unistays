import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Building2,
  Hotel,
  Home,
  CheckCircle,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface NewGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type WizardStep = 1 | 2 | 3;
type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada" | "other";
type PermissionKey = "read" | "write" | "update" | "delete";

interface PropertyRow {
  id: number;
  name: string;
  type: PropertyType;
}

interface PageRow {
  key: string;
  label: string;
  route: string;
}

const propertyTypeConfig: Record<PropertyType, { label: string; icon: typeof Hotel; color: string; bgColor: string }> = {
  hotel: { label: "Hotel", icon: Hotel, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "apart-hotel": { label: "Apart-Hotel", icon: Building2, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  loft: { label: "Loft", icon: Home, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  temporada: { label: "Temporada", icon: Sparkles, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  other: { label: "Outros", icon: Building2, color: "text-slate-500", bgColor: "bg-slate-500/10" },
};

const colorOptions = [
  { value: "from-red-500 to-orange-500", label: "Vermelho" },
  { value: "from-blue-500 to-cyan-500", label: "Azul" },
  { value: "from-green-500 to-emerald-500", label: "Verde" },
  { value: "from-purple-500 to-pink-500", label: "Roxo" },
  { value: "from-amber-500 to-yellow-500", label: "Âmbar" },
  { value: "from-rose-500 to-pink-500", label: "Rosa" },
  { value: "from-teal-500 to-cyan-500", label: "Teal" },
  { value: "from-indigo-500 to-purple-500", label: "Índigo" },
];

const actionLabels: Record<string, string> = {
  read: "Visualizar",
  write: "Criar",
  update: "Editar",
  delete: "Excluir",
};

export function NewGroupModal({ open, onOpenChange, onSuccess }: NewGroupModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | "all">("all");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "from-blue-500 to-cyan-500",
    allProperties: true,
    selectedProperties: [] as number[],
    permissions: {} as Record<string, { read: boolean; write: boolean; update: boolean; delete: boolean }>,
  });

  const steps = [
    { id: 1 as WizardStep, title: "Perfil", subtitle: "Dados principais" },
    { id: 2 as WizardStep, title: "Propriedades", subtitle: "Acesso por unidade" },
    { id: 3 as WizardStep, title: "Permissões", subtitle: "Módulos do sistema" },
  ];
  const progress = (step / steps.length) * 100;

  const normalizePropertyType = (raw: unknown): PropertyType => {
    const v = String(raw ?? "").toLowerCase();
    if (v === "hotel" || v === "apart-hotel" || v === "loft" || v === "temporada") return v;
    return "other";
  };

  const mapRouteToModuleKey = (route: string) => route.replace(/^\//, "").replace(/\//g, "_") || "dashboard";

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [propsRes, pagesRes] = await Promise.all([api.getProperties(), api.getPages()]);

        const propsRaw = ((propsRes.data as { properties?: unknown[] } | undefined)?.properties ?? []) as Array<Record<string, unknown>>;
        const normalizedProps = propsRaw.map((p) => ({
          id: Number(p.id),
          name: String(p.name ?? `Propriedade ${p.id}`),
          type: normalizePropertyType(p.type),
        }));
        setProperties(normalizedProps);

        const pagesRaw = (Array.isArray(pagesRes.data)
          ? pagesRes.data
          : (((pagesRes.data as { pages?: unknown[] } | undefined)?.pages ?? []) as unknown[])) as Array<Record<string, unknown>>;
        const normalizedPages = pagesRaw.map((p) => {
          const route = String(p.route ?? "/");
          return {
            key: mapRouteToModuleKey(route),
            label: String(p.title ?? p.name ?? route),
            route,
          };
        });
        setPages(normalizedPages);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar propriedades e páginas.");
      } finally {
        setIsLoadingData(false);
      }
    };
    void loadData();
  }, [open]);

  const filteredProperties = propertyTypeFilter === "all"
    ? properties
    : properties.filter(p => p.type === propertyTypeFilter);

  const toggleProperty = (propertyId: number) => {
    setFormData(prev => ({
      ...prev,
      allProperties: false,
      selectedProperties: prev.selectedProperties.includes(propertyId)
        ? prev.selectedProperties.filter(id => id !== propertyId)
        : [...prev.selectedProperties, propertyId]
    }));
  };

  const togglePermission = (module: string, action: PermissionKey) => {
    setFormData(prev => {
      const current = prev.permissions[module] || { read: false, write: false, update: false, delete: false };
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...current,
            [action]: !current[action],
          }
        }
      };
    });
  };

  const toggleAllModulePermissions = (module: string) => {
    setFormData(prev => {
      const current = prev.permissions[module] || { read: false, write: false, update: false, delete: false };
      const allSelected = current.read && current.write && current.update && current.delete;

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            read: !allSelected,
            write: !allSelected,
            update: !allSelected,
            delete: !allSelected,
          }
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Informe o nome do perfil");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        permissions: formData.permissions,
      };
      const res = await api.createUserGroup(payload);
      if (!res.success) {
        toast.error(res.error?.message || "Erro ao criar perfil");
        return;
      }
      toast.success("Perfil criado com sucesso!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setFormData({
        name: "",
        description: "",
        color: "from-blue-500 to-cyan-500",
        allProperties: true,
        selectedProperties: [],
        permissions: {},
      });
    }, 300);
  };

  const totalPermissions = useMemo(() => {
    return Object.values(formData.permissions).reduce((sum, p) => {
      return sum + [p.read, p.write, p.update, p.delete].filter(Boolean).length;
    }, 0);
  }, [formData.permissions]);

  const stepCanContinue = useMemo(() => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.allProperties || formData.selectedProperties.length > 0;
    return true;
  }, [step, formData.name, formData.allProperties, formData.selectedProperties.length]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr] h-full">
          <aside className="relative border-r border-border/60 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent)]" />
            <div className="relative h-full p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", formData.color)}>
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Novo Perfil</p>
                  <p className="text-xs text-slate-300">Configuração guiada</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-300 mt-2">{Math.round(progress)}% concluído</p>
              </div>
              <div className="space-y-3">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(s.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-colors",
                      step === s.id ? "bg-white/15 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <p className="text-sm font-semibold">Etapa {s.id}: {s.title}</p>
                    <p className="text-xs text-slate-300">{s.subtitle}</p>
                  </button>
                ))}
              </div>
              <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                Use os cards para selecionar acessos rapidamente com dados reais do sistema.
              </div>
            </div>
          </aside>

          <section className="h-full flex flex-col min-h-0 bg-background">
            <div className="px-6 py-4 border-b border-border/60">
              <h2 className="text-xl font-semibold">Novo Perfil de Usuários</h2>
              <p className="text-sm text-muted-foreground">Etapa {step} de 3</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {isLoadingData ? (
                <div className="h-full min-h-[300px] flex items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Carregando dados do banco...
                </div>
              ) : null}

              {step === 1 && !isLoadingData && (
                <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Nome do Perfil *</Label>
                <Input
                  placeholder="Ex: Recepção, Gerência, Proprietários..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva as responsabilidades deste perfil..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Cor do Perfil</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                        formData.color === color.value
                          ? "border-primary"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded-lg bg-gradient-to-br", color.value)} />
                      <span className="text-sm">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {formData.name && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center", formData.color)}>
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{formData.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.description || "Sem descrição"}</p>
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}

              {step === 2 && !isLoadingData && (
                <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Acesso às Propriedades</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.allProperties}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          allProperties: !!checked,
                          selectedProperties: checked ? [] : prev.selectedProperties
                        }));
                      }}
                      id="all-props"
                    />
                    <label htmlFor="all-props" className="text-sm text-muted-foreground cursor-pointer">
                      Todas as propriedades
                    </label>
                  </div>
                </div>

                {/* Property Type Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant={propertyTypeFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropertyTypeFilter("all")}
                  >
                    Todas
                  </Button>
                  {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                    const config = propertyTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={propertyTypeFilter === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPropertyTypeFilter(type)}
                        className="gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Properties List */}
                <div className="max-h-60 overflow-y-auto border border-border/50 rounded-xl p-2 space-y-1 bg-muted/10">
                  {filteredProperties.length === 0 && (
                    <p className="text-sm text-muted-foreground p-4">Nenhuma propriedade encontrada.</p>
                  )}
                  {filteredProperties.map((property) => {
                    const config = propertyTypeConfig[property.type];
                    const Icon = config.icon;
                    const isSelected = formData.allProperties || formData.selectedProperties.includes(property.id);

                    return (
                      <div
                        key={property.id}
                        onClick={() => !formData.allProperties && toggleProperty(property.id)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer border",
                          isSelected
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted/50 border-border/40",
                          formData.allProperties && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={formData.allProperties}
                          className="pointer-events-none"
                        />
                        <div className={cn("p-2 rounded-lg", config.bgColor)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{property.name}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                {!formData.allProperties && formData.selectedProperties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(propertyTypeConfig) as PropertyType[]).map((type) => {
                      const config = propertyTypeConfig[type];
                      const Icon = config.icon;
                      const count = formData.selectedProperties.filter(id =>
                        properties.find(p => p.id === id)?.type === type
                      ).length;
                      if (count === 0) return null;
                      return (
                        <Badge key={type} variant="outline" className={cn("text-xs gap-1", config.color)}>
                          <Icon className="h-3 w-3" />
                          {count} {config.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
                </div>
              )}

              {step === 3 && !isLoadingData && (
                <div className="space-y-4 animate-fade-in">
              <Label className="text-base font-semibold">Permissões por Módulo</Label>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pages.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma página encontrada para configurar permissões.</p>
                )}
                {pages.map((module) => {
                  const modulePermissions = formData.permissions[module.key] || { read: false, write: false, update: false, delete: false };
                  const allSelected = modulePermissions.read && modulePermissions.write && modulePermissions.update && modulePermissions.delete;

                  return (
                    <div
                      key={module.key}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        Object.values(modulePermissions).some(Boolean)
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/20 border-border/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            Object.values(modulePermissions).some(Boolean) ? "bg-primary/10" : "bg-muted"
                          )}>
                            <FileText className={cn(
                              "h-4 w-4",
                              Object.values(modulePermissions).some(Boolean) ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{module.label}</p>
                            <p className="text-xs text-muted-foreground">{module.route}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAllModulePermissions(module.key)}
                          className="text-xs"
                        >
                          {allSelected ? "Remover todos" : "Selecionar todos"}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(actionLabels) as PermissionKey[]).map((action) => {
                          const isSelected = modulePermissions[action];
                          return (
                            <button
                              key={action}
                              type="button"
                              onClick={() => togglePermission(module.key, action)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-sm transition-all flex items-center gap-1.5",
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted/30 border-border/50 hover:border-border"
                              )}
                            >
                              {action === "read" && <Eye className="h-3 w-3" />}
                              {action === "write" && <Plus className="h-3 w-3" />}
                              {action === "update" && <Edit className="h-3 w-3" />}
                              {action === "delete" && <Trash2 className="h-3 w-3" />}
                              {actionLabels[action]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center", formData.color)}>
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{formData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.allProperties ? "Todas propriedades" : `${formData.selectedProperties.length} propriedades`} • {totalPermissions} permissões
                    </p>
                  </div>
                </div>
              </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border/60 flex justify-between">
              <Button variant="outline" onClick={step > 1 ? () => setStep((step - 1) as WizardStep) : handleClose}>
                {step > 1 ? <ChevronLeft className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                {step > 1 ? "Voltar" : "Cancelar"}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep((step + 1) as WizardStep)} disabled={!stepCanContinue || isLoadingData}>
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => void handleSubmit()} className={cn("bg-gradient-to-r", formData.color)} disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Criar Perfil
                </Button>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
