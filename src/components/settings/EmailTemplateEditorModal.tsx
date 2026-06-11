import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Mail,
  Globe,
  CheckCircle2,
  X,
  Eye,
  Save,
  Undo,
  Code,
  Type,
  Image,
  Link,
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  Sparkles,
  Variable,
  Send,
  Languages,
  Flag,
  ChevronRight,
  FileText,
  Palette,
  Copy,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicVariablesModal } from "./DynamicVariablesModal";

interface EmailTemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    id: string;
    name: string;
    desc: string;
    color: string;
  } | null;
}

type EditorStep = "language" | "editor";

const languages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", progress: 100 },
  { code: "en-US", name: "English (US)", flag: "🇺🇸", progress: 95 },
  { code: "es-ES", name: "Español", flag: "🇪🇸", progress: 88 },
  { code: "fr-FR", name: "Français", flag: "🇫🇷", progress: 45 },
];

const variables = [
  { key: "{nome}", desc: "Nome do hóspede" },
  { key: "{email}", desc: "Email do hóspede" },
  { key: "{telefone}", desc: "Telefone do hóspede" },
  { key: "{data_checkin}", desc: "Data de check-in" },
  { key: "{data_checkout}", desc: "Data de check-out" },
  { key: "{hora_checkin}", desc: "Horário de check-in" },
  { key: "{hora_checkout}", desc: "Horário de check-out" },
  { key: "{quarto}", desc: "Número do quarto" },
  { key: "{tipo_quarto}", desc: "Tipo de acomodação" },
  { key: "{valor_total}", desc: "Valor total da reserva" },
  { key: "{valor_pago}", desc: "Valor pago" },
  { key: "{valor_pendente}", desc: "Valor pendente" },
  { key: "{protocolo}", desc: "Número do protocolo" },
  { key: "{hotel_nome}", desc: "Nome do hotel" },
  { key: "{hotel_endereco}", desc: "Endereço do hotel" },
  { key: "{hotel_telefone}", desc: "Telefone do hotel" },
];

export function EmailTemplateEditorModal({ open, onOpenChange, template }: EmailTemplateEditorModalProps) {
  const [step, setStep] = useState<EditorStep>("language");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"visual" | "html">("visual");
  const [showVariables, setShowVariables] = useState(false);
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "Confirmação de Reserva - {hotel_nome}",
    preheader: "Sua reserva foi confirmada! Confira os detalhes.",
    content: `<p>Olá <strong>{nome}</strong>,</p>

<p>É com grande satisfação que confirmamos sua reserva!</p>

<h3>Detalhes da Reserva</h3>
<ul>
  <li><strong>Check-in:</strong> {data_checkin} às {hora_checkin}</li>
  <li><strong>Check-out:</strong> {data_checkout} às {hora_checkout}</li>
  <li><strong>Acomodação:</strong> {tipo_quarto} - Quarto {quarto}</li>
  <li><strong>Valor Total:</strong> {valor_total}</li>
</ul>

<p>Protocolo da reserva: <strong>{protocolo}</strong></p>

<p>Estamos ansiosos para recebê-lo!</p>

<p>Atenciosamente,<br/>
Equipe {hotel_nome}</p>`,
  });

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("language");
      setSelectedLanguage(null);
      setEditorTab("visual");
      setShowVariables(false);
    }, 300);
  };

  const handleSelectLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    setStep("editor");
  };

  const handleSave = () => {
    toast.success("Template salvo com sucesso!");
    handleClose();
  };

  const handleSendTest = () => {
    toast.success("Email de teste enviado!");
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    toast.success(`Variável ${variable} copiada!`);
  };

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-violet-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-rose-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-rose-500 to-pink-500">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Editar Template de Email</span>
                <span className="text-sm font-normal text-rose-400">
                  {template?.name || "Template"}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              step === "language" 
                ? "bg-rose-500/20 text-rose-400" 
                : "bg-white/5 text-muted-foreground"
            )}>
              <Globe className="h-4 w-4" />
              <span>Idioma</span>
              {step !== "language" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              step === "editor" 
                ? "bg-rose-500/20 text-rose-400" 
                : "bg-white/5 text-muted-foreground"
            )}>
              <FileText className="h-4 w-4" />
              <span>Editor</span>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          {/* Language Selection Step */}
          {step === "language" && (
            <div className="p-6 space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 mb-4">
                  <Languages className="h-10 w-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Selecione o Idioma</h3>
                <p className="text-muted-foreground mt-2">
                  Escolha em qual idioma deseja editar o template
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={cn(
                      "p-5 rounded-2xl border-2 transition-all text-left group hover:border-rose-500/50 hover:bg-rose-500/5",
                      "border-white/10 bg-background/50"
                    )}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl">{lang.flag}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground group-hover:text-rose-400 transition-colors">
                          {lang.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{lang.code}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Tradução</span>
                        <span className={lang.progress === 100 ? "text-emerald-400" : "text-amber-400"}>
                          {lang.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            lang.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                          )}
                          style={{ width: `${lang.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center mt-6">
                <Button variant="outline" className="border-white/10">
                  <Globe className="h-4 w-4 mr-2" />
                  Adicionar Novo Idioma
                </Button>
              </div>
            </div>
          )}

          {/* Editor Step */}
          {step === "editor" && selectedLang && (
            <div className="flex">
              {/* Main Editor */}
              <div className="flex-1 p-6 space-y-6">
                {/* Language Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedLang.flag}</span>
                    <div>
                      <p className="font-medium text-foreground">{selectedLang.name}</p>
                      <p className="text-xs text-muted-foreground">Editando template em {selectedLang.name}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-white/10"
                    onClick={() => setStep("language")}
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Trocar Idioma
                  </Button>
                </div>

                {/* Subject & Preheader */}
                <div className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/5 to-pink-500/5 border border-rose-500/20">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Assunto do Email
                    </Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="bg-background/50 border-white/10"
                      placeholder="Assunto do email..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Type className="h-3.5 w-3.5 text-muted-foreground" />
                      Pré-header (Preview)
                    </Label>
                    <Input
                      value={formData.preheader}
                      onChange={(e) => setFormData({ ...formData, preheader: e.target.value })}
                      className="bg-background/50 border-white/10"
                      placeholder="Texto de preview..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Texto exibido como preview do email na caixa de entrada
                    </p>
                  </div>
                </div>

                {/* Editor Tabs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      Conteúdo do Email
                    </Label>
                    <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as "visual" | "html")}>
                      <TabsList className="bg-background/50">
                        <TabsTrigger value="visual" className="gap-1.5">
                          <Type className="h-3 w-3" />
                          Visual
                        </TabsTrigger>
                        <TabsTrigger value="html" className="gap-1.5">
                          <Code className="h-3 w-3" />
                          HTML
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 rounded-lg bg-background/50 border border-white/10">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1 bg-white/10" />
                    <Button 
                      variant={showVariables ? "secondary" : "ghost"} 
                      size="sm" 
                      className="h-8 gap-1.5"
                      onClick={() => setShowVariables(!showVariables)}
                    >
                      <Variable className="h-4 w-4" />
                      Variáveis
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setVariablesModalOpen(true)}
                      title="Gerenciar Variáveis Dinâmicas"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Editor Content */}
                  {editorTab === "visual" ? (
                    <div className="min-h-[300px] p-4 rounded-lg bg-background/50 border border-white/10">
                      <div 
                        className="prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  ) : (
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-[300px] font-mono text-sm bg-background/50 border-white/10"
                    />
                  )}
                </div>

                {/* Design Settings */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-4 w-4 text-violet-400" />
                    <Label className="text-violet-400">Personalização Visual</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Cor Principal</Label>
                      <div className="flex gap-2">
                        {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"].map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Logo do Hotel</Label>
                      <Button variant="outline" size="sm" className="w-full border-white/10">
                        <Image className="h-3 w-3 mr-1" />
                        Alterar Logo
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Rodapé</Label>
                      <Button variant="outline" size="sm" className="w-full border-white/10">
                        <FileText className="h-3 w-3 mr-1" />
                        Editar Rodapé
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variables Sidebar */}
              {showVariables && (
                <div className="w-72 border-l border-white/10 bg-background/30">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Variable className="h-4 w-4 text-rose-400" />
                        Variáveis Disponíveis
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setVariablesModalOpen(true)}
                          title="Editar Variáveis"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setShowVariables(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique para copiar e colar no template
                    </p>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="p-3 space-y-2">
                      {variables.map((v) => (
                        <button
                          key={v.key}
                          onClick={() => copyVariable(v.key)}
                          className="w-full p-3 rounded-lg bg-background/50 border border-white/10 text-left transition-all hover:border-rose-500/30 hover:bg-rose-500/5 group"
                        >
                          <div className="flex items-center justify-between">
                            <code className="text-rose-400 text-sm font-mono">{v.key}</code>
                            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-white/10 bg-background/50">
          {step === "language" ? (
            <>
              <Button variant="outline" onClick={handleClose} className="border-white/10">
                Cancelar
              </Button>
              <div className="text-sm text-muted-foreground">
                Selecione um idioma para continuar
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="border-white/10">
                  Cancelar
                </Button>
                <Button variant="outline" className="border-white/10">
                  <Undo className="h-4 w-4 mr-2" />
                  Desfazer Alterações
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/10" onClick={handleSendTest}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Teste
                </Button>
                <Button variant="outline" className="border-white/10">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Template
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      <DynamicVariablesModal 
        open={variablesModalOpen} 
        onOpenChange={setVariablesModalOpen} 
      />
    </Dialog>
  );
}