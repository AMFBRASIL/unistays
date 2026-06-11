import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import {
  Mail,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Send,
  Sparkles,
  FileText,
  Calendar,
  CreditCard,
  UserCheck,
  Bell,
  Gift,
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  Palette,
  Languages,
  Variable,
  Wand2,
  Save,
  ArrowLeft,
  LayoutTemplate,
  Globe,
  Zap,
  Settings2,
  Image,
  Link2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  FolderTree,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { EmailCategoryModal, type EmailCategory } from "@/components/workflows/EmailCategoryModal";

interface EmailTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  categoryName?: string;
  language: string;
  isActive: boolean;
  lastModified: string;
  usageCount: number;
  content: string;
}

interface CategoryFromApi {
  id: string;
  name: string;
  description?: string | null;
  icon?: string;
  color?: string;
  bgColor?: string;
  sortOrder?: number;
  templateCount?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Mail,
  UserCheck,
  CreditCard,
  Bell,
  Gift,
  Star,
  MessageSquare,
  Settings2,
  FileText,
};

const languages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "es-ES", name: "Español", flag: "🇪🇸" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
];

// Variáveis dinâmicas usadas pelo WorkflowService ao enviar e-mail (formato [var] — ver backend/docs/EMAIL_TEMPLATE_VARIABLES.md)
const defaultDynamicVariables: { group: string; variables: { key: string; label: string }[] }[] = [
  {
    group: "Hóspede / Cliente",
    variables: [
      { key: "[nome]", label: "Nome (primeiro)" },
      { key: "[cliente]", label: "Cliente" },
      { key: "[nome-completo]", label: "Nome completo" },
      { key: "[sobrenome]", label: "Sobrenome" },
      { key: "[email]", label: "E-mail" },
      { key: "[telefone]", label: "Telefone" },
      { key: "[cpf]", label: "CPF / Documento" },
    ],
  },
  {
    group: "Reserva",
    variables: [
      { key: "[numero-reserva]", label: "Número da reserva" },
      { key: "[protocolo]", label: "Protocolo" },
      { key: "[data-checkin]", label: "Data check-in" },
      { key: "[data-checkout]", label: "Data check-out" },
      { key: "[hora-checkin]", label: "Hora check-in" },
      { key: "[hora-checkout]", label: "Hora check-out" },
      { key: "[noites]", label: "Noites" },
      { key: "[numero-quarto]", label: "Número do quarto" },
      { key: "[tipo-quarto]", label: "Tipo do quarto" },
      { key: "[adultos]", label: "Adultos" },
      { key: "[criancas]", label: "Crianças" },
    ],
  },
  {
    group: "Financeiro",
    variables: [
      { key: "[valor-total]", label: "Valor total" },
      { key: "[valor]", label: "Valor" },
      { key: "[valor-pago]", label: "Valor pago" },
      { key: "[valor-pendente]", label: "Valor pendente" },
      { key: "[valor-diaria]", label: "Valor diária" },
      { key: "[moeda]", label: "Moeda" },
    ],
  },
  {
    group: "Hotel / Propriedade",
    variables: [
      { key: "[nome-hotel]", label: "Nome do hotel" },
      { key: "[endereco-hotel]", label: "Endereço" },
      { key: "[telefone-hotel]", label: "Telefone" },
      { key: "[email-hotel]", label: "E-mail" },
      { key: "[site-hotel]", label: "Site" },
      { key: "[cnpj-hotel]", label: "CNPJ" },
    ],
  },
];

/** Remove scripts e vetores de execução para pré-visualização no iframe (evita "Blocked script execution in about:srcdoc") */
function sanitizeHtmlForPreview(html: string): string {
  if (!html?.trim()) return "";
  let out = html;
  // Remove blocos <script>...</script> (qualquer atributo, multiline)
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  // Remove tags <script> auto-fechadas ou sem conteúdo
  out = out.replace(/<script\b[^>]*\s*\/?>/gi, "");
  // Remove atributos de evento inline (onclick, onload, onerror, etc.)
  out = out.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  // Remove javascript: e vbscript: de href e src (substitui por #)
  out = out.replace(/\s+(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, ' $1="#"');
  out = out.replace(/\s+(href|src)\s*=\s*["']\s*vbscript:[^"']*["']/gi, ' $1="#"');
  return out.trim();
}

export function EmailTemplateModal({ open, onOpenChange }: EmailTemplateModalProps) {
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);
  const [dynamicVariables, setDynamicVariables] = useState(defaultDynamicVariables);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Editor state
  const [editorTab, setEditorTab] = useState("visual");
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [templateIsActive, setTemplateIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.getEmailTemplateCategories(),
      api.getEmailTemplateVariableGroups(),
      api.getEmailTemplates(selectedCategory || undefined),
    ])
      .then(([catRes, varRes, tplRes]) => {
        if (cancelled) return;
        if (catRes.success && catRes.data?.categories) setCategories(catRes.data.categories);
        // Só usa variáveis da API se estiverem no formato correto [var] (compatível com WorkflowService)
        if (varRes.success && varRes.data?.variables?.length) {
          const apiVars = varRes.data.variables as { group: string; variables: { key: string; label: string }[] }[];
          const firstKey = apiVars[0]?.variables?.[0]?.key ?? "";
          if (firstKey.startsWith("[")) setDynamicVariables(apiVars);
        }
        if (tplRes.success && tplRes.data?.templates) {
          setTemplates(
            (tplRes.data.templates as { id: string; name: string; subject?: string; categoryId: string; category?: { name?: string }; isActive?: boolean; usageCount?: number; updatedAt?: string; contentHtml?: string }[]).map((t) => ({
              id: t.id,
              name: t.name,
              subject: t.subject || "",
              category: t.categoryId,
              categoryName: t.category?.name,
              language: "pt-BR",
              isActive: t.isActive !== false,
              lastModified: t.updatedAt ? new Date(t.updatedAt).toISOString().split("T")[0] : "",
              usageCount: t.usageCount || 0,
              content: t.contentHtml || "",
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Erro ao carregar dados");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, selectedCategory]);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const templateCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: iconMap[c.icon || "Mail"] || FileText,
    color: c.color || "text-blue-400",
    bgColor: c.bgColor || "bg-blue-500/10",
  }));

  const categoriesForCategoryModal: EmailCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    icon: c.icon ?? "Mail",
    color: c.color ?? "text-blue-400",
    bgColor: c.bgColor ?? "bg-blue-500/10",
    isSystem: false,
    templateCount: c.templateCount ?? 0,
  }));

  const handleCategoriesChange = (updated: EmailCategory[]) => {
    setCategories(
      updated.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || null,
        icon: c.icon,
        color: c.color,
        bgColor: c.bgColor,
        templateCount: c.templateCount,
      }))
    );
  };

  /** Mapeia nome/assunto do template para o tipo esperado pela API de IA */
  const getTemplateTypeForAI = (): string => {
    const name = (templateName || templateSubject || "").toLowerCase();
    if (/confirmação|confirmation|reserva|reservation/.test(name)) return "reservation_confirmation";
    if (/check-in|checkin|digital/.test(name)) return "checkin_digital";
    if (/pagamento|payment|pago|received/.test(name)) return "payment_received";
    if (/check-out|checkout|lembrete|reminder/.test(name)) return "checkout_reminder";
    if (/avaliação|review|feedback|pós-estadia/.test(name)) return "post_stay_review";
    if (/senha|password|reset|recuperação/.test(name)) return "password_reset";
    if (/boas-vindas|welcome|bem-vindo/.test(name)) return "welcome";
    if (/cancelamento|cancellation/.test(name)) return "booking_cancellation";
    return "reservation_confirmation";
  };

  const handleGenerateWithAI = async () => {
    setAiGenerating(true);
    try {
      const templateType = getTemplateTypeForAI();
      const categoryName = categories.find((c) => c.id === templateCategory)?.name ?? "";
      // Enviar dados do próprio formulário (Nome + Categoria + Assunto) para a IA entender o contexto do HTML
      const res = await api.generateEmailTemplate({
        templateType,
        templateName: templateName?.trim() || undefined,
        categoryName: categoryName || undefined,
        subject: templateSubject?.trim() || undefined,
      });
      if (res.success && res.data?.bodyHtml) {
        setTemplateContent(res.data.bodyHtml);
        if (res.data.subject) setTemplateSubject(res.data.subject);
        toast.success("Template gerado pela IA e colocado no corpo do e-mail.");
      } else {
        toast.error(res.error?.message ?? "Não foi possível gerar o template. Verifique se a IA está configurada.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar template com IA.");
    } finally {
      setAiGenerating(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return templateCategories.find((c) => c.id === categoryId);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateName("");
    setTemplateSubject("");
    setTemplateCategory(categories[0]?.id || "");
    setTemplateContent("");
    setTemplateIsActive(true);
    setIsEditing(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateCategory(template.category);
    setTemplateContent(template.content);
    setTemplateIsActive(template.isActive);
    setSelectedLanguage(template.language);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }
    if (!templateSubject.trim()) {
      toast.error("Assunto é obrigatório");
      return;
    }
    if (!templateCategory) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!templateContent.trim()) {
      toast.error("Conteúdo HTML é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: templateName.trim(),
        subject: templateSubject.trim(),
        categoryId: templateCategory,
        contentHtml: templateContent.trim(),
        contentText: templateContent.trim().replace(/<[^>]*>/g, "").slice(0, 5000) || null,
        isActive: templateIsActive,
      };
      if (editingTemplate) {
        const res = await api.updateEmailTemplate(editingTemplate.id, payload);
        if (res.success) {
          toast.success("Template atualizado com sucesso");
          const updated = res.data?.template;
          if (updated) {
            setTemplates((prev) =>
              prev.map((t) =>
                t.id === editingTemplate.id
                  ? {
                      ...t,
                      name: updated.name,
                      subject: updated.subject,
                      category: updated.categoryId,
                      categoryName: updated.category?.name,
                      content: updated.contentHtml || "",
                      isActive: updated.isActive !== false,
                      lastModified: updated.updatedAt ? new Date(updated.updatedAt).toISOString().split("T")[0] : t.lastModified,
                    }
                  : t
              )
            );
          }
          setIsEditing(false);
        } else {
          toast.error(res.error?.message || "Erro ao atualizar");
        }
      } else {
        const res = await api.createEmailTemplate(payload);
        if (res.success) {
          toast.success("Template criado com sucesso");
          const created = res.data?.template;
          if (created) {
            setTemplates((prev) => [
              ...prev,
              {
                id: created.id,
                name: created.name,
                subject: created.subject || "",
                category: created.categoryId,
                categoryName: created.category?.name,
                language: "pt-BR",
                isActive: created.isActive !== false,
                lastModified: created.updatedAt ? new Date(created.updatedAt).toISOString().split("T")[0] : "",
                usageCount: 0,
                content: created.contentHtml || "",
              },
            ]);
          }
          setIsEditing(false);
        } else {
          toast.error(res.error?.message || "Erro ao criar");
        }
      }
    } catch {
      toast.error("Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const res = await api.createEmailTemplate({
        name: `${template.name} (Cópia)`,
        subject: template.subject,
        categoryId: template.category,
        contentHtml: template.content,
        contentText: template.content.replace(/<[^>]*>/g, "").slice(0, 5000) || null,
        isActive: template.isActive,
      });
      if (res.success && res.data?.template) {
        const created = res.data.template;
        setTemplates((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            subject: created.subject || "",
            category: created.categoryId,
            categoryName: created.category?.name,
            language: "pt-BR",
            isActive: created.isActive !== false,
            lastModified: created.updatedAt ? new Date(created.updatedAt).toISOString().split("T")[0] : "",
            usageCount: 0,
            content: created.contentHtml || "",
          },
        ]);
        toast.success("Template duplicado");
      } else {
        toast.error(res.error?.message || "Erro ao duplicar");
      }
    } catch {
      toast.error("Erro ao duplicar template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const res = await api.deleteEmailTemplate(templateId);
      if (res.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        toast.success("Template excluído");
      } else {
        toast.error(res.error?.message || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir template");
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const res = await api.updateEmailTemplate(template.id, { isActive: !template.isActive });
      if (res.success && res.data?.template != null) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, isActive: res.data.template.isActive !== false } : t))
        );
        toast.success(res.data.template.isActive ? "Template ativado" : "Template desativado");
      } else {
        toast.error(res.error?.message || "Erro ao atualizar");
      }
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const insertVariable = (variable: string) => {
    setTemplateContent(prev => prev + variable);
  };

  const renderTemplatesList = () => (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <LayoutTemplate className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{templates.length}</p>
              <p className="text-xs text-muted-foreground">Templates</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{templates.filter(t => t.isActive).length}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Globe className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{languages.length}</p>
              <p className="text-xs text-muted-foreground">Idiomas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Send className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{templates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!selectedCategory ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={!selectedCategory ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" : ""}
        >
          Todos
        </Button>
        {templateCategories.map((cat) => {
          const IconComponent = cat.icon;
          return (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white" : ""}
          >
            <IconComponent className="h-4 w-4 mr-1" />
            {cat.name}
          </Button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background/50 border-border"
        />
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-2 gap-4 pr-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-muted-foreground">Carregando templates...</div>
          ) : (
          filteredTemplates.map((template) => {
            const category = getCategoryInfo(template.category);
            const CategoryIcon = category?.icon;
            return (
              <div
                key={template.id}
                className="p-4 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${category?.bgColor}`}>
                    {CategoryIcon && <CategoryIcon className={`h-5 w-5 ${category?.color}`} />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={template.isActive ? "default" : "secondary"} className={template.isActive ? "bg-emerald-500/20 text-emerald-400" : ""}>
                      {template.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {template.subject}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    {template.usageCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.lastModified}
                  </span>
                  <span className="flex items-center gap-1">
                    {languages.find(l => l.code === template.language)?.flag}
                  </span>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(template)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicateTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleActive(template)}>
                    {template.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderEditor = () => (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {editingTemplate ? "Editar Template" : "Novo Template"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Teste
          </Button>
          <Button size="sm" onClick={handleSaveTemplate} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="col-span-2 space-y-4">
          {/* Basic Info */}
          <div className="p-4 rounded-xl bg-card/50 border border-border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Confirmação de Reserva"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={templateCategory} onValueChange={setTemplateCategory}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <cat.icon className={`h-4 w-4 ${cat.color}`} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assunto do E-mail</Label>
                <Input
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Ex: Sua reserva foi confirmada - {reservation_id}"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={templateIsActive} onCheckedChange={setTemplateIsActive} />
                <Label>Template Ativo</Label>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="p-4 rounded-xl bg-card/50 border border-border space-y-4">
            <Tabs value={editorTab} onValueChange={setEditorTab}>
              <div className="flex items-center justify-between">
                <TabsList className="bg-background/50">
                  <TabsTrigger value="visual" className="gap-2">
                    <Palette className="h-4 w-4" />
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="html" className="gap-2">
                    <Code2 className="h-4 w-4" />
                    HTML
                  </TabsTrigger>
                </TabsList>

                {/* Toolbar */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm"><Bold className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Italic className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Underline className="h-4 w-4" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm"><AlignLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><AlignCenter className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><AlignRight className="h-4 w-4" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm"><List className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><ListOrdered className="h-4 w-4" /></Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button variant="ghost" size="sm"><Image className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Link2 className="h-4 w-4" /></Button>
                </div>
              </div>

              <TabsContent value="visual" className="mt-4">
                <div className="rounded-lg border border-border overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" />
                    Pré-visualização do e-mail (como o destinatário verá)
                  </div>
                  <div className="min-h-[360px] max-h-[70vh] overflow-auto bg-gray-50">
                    {templateContent.trim() ? (
                      <iframe
                        title="Pré-visualização do template"
                        srcDoc={sanitizeHtmlForPreview(templateContent)}
                        sandbox="allow-same-origin"
                        className="w-full min-h-[360px] border-0 bg-white"
                        style={{ minHeight: '360px' }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center text-muted-foreground">
                        <Palette className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm">Nenhum conteúdo para visualizar.</p>
                        <p className="text-xs mt-1">Edite o HTML na aba &quot;HTML&quot; e volte aqui para ver a pré-visualização.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="html" className="mt-4">
                <Textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="<html>...</html>"
                  className="min-h-[300px] bg-background/50 font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Assistant */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Wand2 className="h-5 w-5 text-violet-400" />
              </div>
              <h4 className="font-semibold text-foreground">Assistente IA</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Use IA para gerar ou melhorar seu template
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleGenerateWithAI}
                disabled={aiGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2 text-violet-400" />
                Gerar Template
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                <Zap className="h-4 w-4 mr-2 text-amber-400" />
                Melhorar Texto
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                <Languages className="h-4 w-4 mr-2 text-blue-400" />
                Traduzir
              </Button>
            </div>
          </div>

          {/* Dynamic Variables */}
          <div className="p-4 rounded-xl bg-card/50 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Variable className="h-5 w-5 text-cyan-400" />
              <h4 className="font-semibold text-foreground">Variáveis Dinâmicas</h4>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-4 pr-4">
                {dynamicVariables.map((group) => (
                  <div key={group.group}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                      {group.group}
                    </p>
                    <div className="space-y-1">
                      {group.variables.map((variable) => (
                        <Button
                          key={variable.key}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => insertVariable(variable.key)}
                        >
                          <code className="text-cyan-400 mr-2">{variable.key}</code>
                          <span className="text-muted-foreground truncate">{variable.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] flex flex-col bg-background border-border">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
              <Mail className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Templates de E-mail
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Gerencie templates de e-mail para uso em todo o sistema
              </DialogDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setCategoryModalOpen(true)}
                    className="gap-2 border-violet-500/50 text-violet-600 hover:bg-violet-500/10 hover:border-violet-500"
                  >
                    <FolderTree className="h-4 w-4" />
                    Gerenciar Categorias
                  </Button>
                  <Button onClick={handleNewTemplate} className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {isEditing ? renderEditor() : renderTemplatesList()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    <EmailCategoryModal
      open={categoryModalOpen}
      onOpenChange={setCategoryModalOpen}
      categories={categoriesForCategoryModal}
      onCategoriesChange={handleCategoriesChange}
    />

    {/* Modal "Produzindo com IA..." */}
    <Dialog open={aiGenerating} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm gap-4" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">Produzindo template com IA</DialogTitle>
        <DialogDescription className="sr-only">Aguarde enquanto o conteúdo é gerado pela IA.</DialogDescription>
        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="p-4 rounded-full bg-violet-500/10">
            <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-foreground">Produzindo template com IA</p>
            <p className="text-sm text-muted-foreground">Aguarde enquanto o conteúdo é gerado...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}