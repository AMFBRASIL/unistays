import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Layout,
  Palette,
  Type,
  Image,
  FileText,
  Code2,
  Sparkles,
  Wand2,
  Eye,
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImagePlus,
  Square,
  Columns,
  Smartphone,
  Monitor,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Settings,
  Plus,
  Minus,
  Move,
  MessageSquare,
  CheckCircle2,
  Heart,
  Percent,
  Bell,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface NewTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateToEdit?: any;
  onSuccess?: () => void;
}

const templateCategories = [
  { id: "promotional", name: "Promocional", icon: Percent },
  { id: "newsletter", name: "Newsletter", icon: FileText },
  { id: "transactional", name: "Transacional", icon: CheckCircle2 },
  { id: "welcome", name: "Boas-vindas", icon: Heart },
  { id: "event", name: "Evento", icon: Calendar },
  { id: "notification", name: "Notificação", icon: Bell },
];

const presetTemplates = [
  { id: 1, name: "Em Branco", icon: Square, preview: "blank" },
  { id: 2, name: "Hero + Texto", icon: Layout, preview: "hero-text" },
  { id: 3, name: "2 Colunas", icon: Columns, preview: "two-columns" },
  { id: 4, name: "Galeria", icon: Image, preview: "gallery" },
  { id: 5, name: "Card de Produto", icon: ShoppingCart, preview: "product" },
  { id: 6, name: "Newsletter", icon: FileText, preview: "newsletter" },
];

const contentBlocks = [
  { id: "header", name: "Cabeçalho", icon: Type, description: "Logo e navegação" },
  { id: "hero", name: "Hero Banner", icon: Image, description: "Imagem de destaque" },
  { id: "text", name: "Texto", icon: FileText, description: "Parágrafo de texto" },
  { id: "button", name: "Botão CTA", icon: Square, description: "Chamada para ação" },
  { id: "image", name: "Imagem", icon: ImagePlus, description: "Imagem única" },
  { id: "columns", name: "Colunas", icon: Columns, description: "Layout em colunas" },
  { id: "divider", name: "Divisor", icon: Minus, description: "Linha separadora" },
  { id: "spacer", name: "Espaçador", icon: Move, description: "Espaço em branco" },
  { id: "social", name: "Redes Sociais", icon: MessageSquare, description: "Ícones sociais" },
  { id: "html", name: "Código HTML", icon: Code2, description: "HTML customizado" },
  { id: "footer", name: "Rodapé", icon: Layout, description: "Footer do email" },
];

const colorPresets = [
  { name: "Padrão", primary: "#3B82F6", secondary: "#1E40AF", background: "#FFFFFF" },
  { name: "Escuro", primary: "#8B5CF6", secondary: "#6D28D9", background: "#1F2937" },
  { name: "Quente", primary: "#F97316", secondary: "#EA580C", background: "#FFFBEB" },
  { name: "Natural", primary: "#10B981", secondary: "#059669", background: "#ECFDF5" },
  { name: "Rosa", primary: "#EC4899", secondary: "#DB2777", background: "#FDF2F8" },
  { name: "Neutro", primary: "#6B7280", secondary: "#4B5563", background: "#F9FAFB" },
];

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Playfair", value: "Playfair Display, serif" },
];

export function NewTemplateModal({ open, onOpenChange, templateToEdit, onSuccess }: NewTemplateModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("layout");
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "",
    preset: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    backgroundColor: "#FFFFFF",
    font: "Inter, sans-serif",
    fontSize: 16,
    borderRadius: 8,
  });
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [blocks, setBlocks] = useState<any[]>([
    { id: 1, type: "header", content: "Logo", style: {} },
    { id: 2, type: "hero", content: "Hero Image", style: {} },
    { id: 3, type: "text", content: "Texto principal", style: {} },
    { id: 4, type: "button", content: "Saiba Mais", style: {} },
    { id: 5, type: "footer", content: "Footer", style: {} },
  ]);

  useEffect(() => {
    if (open) {
      if (templateToEdit?.designJson) {
        // Load visual design
        setTemplateData(templateToEdit.designJson.templateData || {
          name: templateToEdit.name,
          category: templateToEdit.type,
          preset: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          backgroundColor: "#FFFFFF",
          font: "Inter, sans-serif",
          fontSize: 16,
          borderRadius: 8,
        });
        setBlocks(templateToEdit.designJson.blocks || []);
      } else if (templateToEdit) {
        // Legacy or HTML-only template - fallback minimal load
        setTemplateData(prev => ({ ...prev, name: templateToEdit.name }));

        // If it's pure HTML, load it as a single HTML block
        if (templateToEdit.bodyHtml) {
          setBlocks([{
            id: Date.now(),
            type: 'html',
            content: templateToEdit.bodyHtml,
            style: {}
          }]);
        }
      } else {
        // New template reset
        setTemplateData({
          name: "",
          category: "",
          preset: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#1E40AF",
          backgroundColor: "#FFFFFF",
          font: "Inter, sans-serif",
          fontSize: 16,
          borderRadius: 8,
        });
        setBlocks([
          { id: 1, type: "header", content: "Logo", style: {} },
          { id: 2, type: "hero", content: "Hero Image", style: {} },
          { id: 3, type: "text", content: "Texto principal", style: {} },
          { id: 4, type: "button", content: "Saiba Mais", style: {} },
          { id: 5, type: "footer", content: "Footer", style: {} },
        ]);
      }
    }
  }, [open, templateToEdit]);

  const generateHtmlFromBlocks = () => {
    // Generate simplified HTML based on blocks and styles
    // This is a basic generator - in production would need more robust MJML or similar
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; background-color: ${templateData.backgroundColor}; font-family: ${templateData.font}; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .btn { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: ${templateData.borderRadius}px; }
        </style>
      </head>
      <body>
        <div class="container" style="background-color: #ffffff;">
    `;

    blocks.forEach(block => {
      switch (block.type) {
        case "html":
          htmlContent += block.content;
          break;
        case "header":
          htmlContent += `
            <div style="padding: 20px; background-color: ${templateData.primaryColor}; display: flex; justify-content: space-between; align-items: center;">
              <div style="color: white; font-weight: bold; font-size: 20px;">${block.content || 'LOGO'}</div>
              <div style="color: rgba(255,255,255,0.8); font-size: 14px;">
                 <span>Home</span> &nbsp; <span>Sobre</span> &nbsp; <span>Contato</span>
              </div>
            </div>`;
          break;
        case "hero":
          htmlContent += `
            <div style="height: 200px; background: linear-gradient(135deg, ${templateData.primaryColor}, ${templateData.secondaryColor}); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
              ${block.content || 'Hero Banner'}
            </div>`;
          break;
        case "text":
          htmlContent += `
            <div style="padding: 24px; font-size: ${templateData.fontSize}px; color: #374151; line-height: 1.6;">
              ${block.content || 'Texto principal...'}
            </div>`;
          break;
        case "button":
          htmlContent += `
            <div style="padding: 24px; text-align: center;">
              <a href="${block.url || '#'}" class="btn" style="background-color: ${templateData.primaryColor}; color: white;">${block.content || 'Saiba Mais'}</a>
            </div>`;
          break;
        case "footer":
          htmlContent += `
            <div style="padding: 24px; background-color: #f3f4f6; text-align: center; color: #6b7280; font-size: 12px;">
              <p>${block.content || '© 2024 Sua Empresa'}</p>
            </div>`;
          break;
        case "image":
          htmlContent += `
            <div style="padding: 20px; text-align: center;">
              <img src="${block.url || 'https://via.placeholder.com/600x200'}" style="max-width: 100%; height: auto; border-radius: 8px;" />
            </div>`;
          break;
        case "divider":
          htmlContent += `<div style="padding: 20px;"><hr style="border: 0; border-top: 1px solid #e5e7eb;" /></div>`;
          break;
      }
    });

    htmlContent += `
        </div>
      </body>
      </html>
    `;
    return htmlContent;
  };

  const handleSaveTemplate = async () => {
    if (!templateData.name) {
      toast({ title: "Erro", description: "Nome do template é obrigatório", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const html = generateHtmlFromBlocks();
      const payload = {
        name: templateData.name,
        type: templateData.category || 'promotional',
        subject: blocks.find(b => b.type === 'text')?.content?.substring(0, 50) || "Assunto do Email",
        bodyHtml: html,
        designJson: {
          templateData,
          blocks
        }
      };

      if (templateToEdit?.id) {
        await api.updateEmailTemplate(templateToEdit.id, payload);
        toast({ title: "Sucesso", description: "Template atualizado com sucesso!" });
      } else {
        await api.createEmailTemplate(payload);
        toast({ title: "Sucesso", description: "Template criado com sucesso!" });
      }

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao salvar template", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateWithAI = () => {
    toast({
      title: "Gerando com IA...",
      description: "Seu template está sendo criado automaticamente.",
    });
  };

  const addBlock = (blockType: string) => {
    const newBlock = {
      id: Date.now(),
      type: blockType,
      content: contentBlocks.find(b => b.id === blockType)?.name || blockType,
      style: {}
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (blockId: number) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const moveBlock = (blockId: number, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (direction === "up" && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleFormat = (command: string, value?: string) => {
    if (!selectedBlockId) return;

    const block = blocks.find(b => b.id === selectedBlockId);
    if (!block || (block.type !== 'text' && block.type !== 'html')) return; // Allow formatting only on text/html blocks

    // Simple implementation: modify content string for basic formatting
    // Note: A real implementation would use a proper WYSIWYG library/editor state
    // Here we just wrap the content or append style, which works for the entire block
    // Ideally we would wrap the *selection*, but without a rich editor ref, we can only affect the whole block or append

    // For now, let's just support basic alignment via style
    if (['left', 'center', 'right', 'justify'].includes(command)) {
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, style: { ...b.style, textAlign: command } } : b));
      return;
    }

    // For Bold/Italic/Underline, we toggle a style on the container OR wrap content
    // Since we don't have selection API access here easily, we will toggle the style for the WHOLE block
    if (command === 'bold') {
      const fontWeight = block.style.fontWeight === 'bold' ? 'normal' : 'bold';
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, style: { ...b.style, fontWeight } } : b));
    }
    if (command === 'italic') {
      const fontStyle = block.style.fontStyle === 'italic' ? 'normal' : 'italic';
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, style: { ...b.style, fontStyle } } : b));
    }
    if (command === 'underline') {
      const textDecoration = block.style.textDecoration === 'underline' ? 'none' : 'underline';
      setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, style: { ...b.style, textDecoration } } : b));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-background border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Criar Novo Template</DialogTitle>
                <DialogDescription>Design visual de email com arrastar e soltar</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleGenerateWithAI}>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar com IA
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button size="sm" onClick={handleSaveTemplate} className="bg-gradient-to-r from-amber-500 to-orange-600">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(95vh-100px)]">
          {/* Left Sidebar - Tools */}
          <div className="w-72 border-r border-white/10 bg-card/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-transparent p-0">
                <TabsTrigger value="layout" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="blocks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  <Plus className="w-4 h-4 mr-2" />
                  Blocos
                </TabsTrigger>
                <TabsTrigger value="style" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  <Palette className="w-4 h-4 mr-2" />
                  Estilo
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                {/* Layout Tab */}
                <TabsContent value="layout" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Template</Label>
                    <Input
                      value={templateData.name}
                      onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                      placeholder="Meu Template"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={templateData.category}
                      onValueChange={(value) => setTemplateData({ ...templateData, category: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="w-4 h-4" />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Layout Base</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetTemplates.map((preset) => (
                        <Card
                          key={preset.id}
                          onClick={() => setTemplateData({ ...templateData, preset: preset.id.toString() })}
                          className={cn(
                            "cursor-pointer transition-all p-3",
                            templateData.preset === preset.id.toString()
                              ? "border-primary bg-primary/5"
                              : "bg-card/50 border-white/10 hover:border-primary/30"
                          )}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <preset.icon className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs font-medium text-center">{preset.name}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Blocks Tab */}
                <TabsContent value="blocks" className="mt-0 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Clique para adicionar blocos ao seu template
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {contentBlocks.map((block) => (
                      <Card
                        key={block.id}
                        onClick={() => addBlock(block.id)}
                        className="cursor-pointer transition-all p-3 bg-card/50 border-white/10 hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <block.icon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs font-medium text-center">{block.name}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label>Paleta de Cores</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorPresets.map((preset) => (
                        <Card
                          key={preset.name}
                          onClick={() => setTemplateData({
                            ...templateData,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary,
                            backgroundColor: preset.background,
                          })}
                          className={cn(
                            "cursor-pointer transition-all p-2",
                            templateData.primaryColor === preset.primary
                              ? "border-primary"
                              : "border-white/10 hover:border-primary/30"
                          )}
                        >
                          <div className="flex gap-1 mb-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.primary }} />
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.secondary }} />
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: preset.background }} />
                          </div>
                          <span className="text-xs">{preset.name}</span>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={templateData.primaryColor}
                        onChange={(e) => setTemplateData({ ...templateData, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={templateData.primaryColor}
                        onChange={(e) => setTemplateData({ ...templateData, primaryColor: e.target.value })}
                        className="flex-1 bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Fonte</Label>
                    <Select
                      value={templateData.font}
                      onValueChange={(value) => setTemplateData({ ...templateData, font: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Tamanho da Fonte</Label>
                      <span className="text-sm text-muted-foreground">{templateData.fontSize}px</span>
                    </div>
                    <Slider
                      value={[templateData.fontSize]}
                      onValueChange={([value]) => setTemplateData({ ...templateData, fontSize: value })}
                      min={12}
                      max={24}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Borda Arredondada</Label>
                      <span className="text-sm text-muted-foreground">{templateData.borderRadius}px</span>
                    </div>
                    <Slider
                      value={[templateData.borderRadius]}
                      onValueChange={([value]) => setTemplateData({ ...templateData, borderRadius: value })}
                      min={0}
                      max={24}
                      step={2}
                    />
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Center - Preview */}
          <div className="flex-1 bg-muted/30 flex flex-col">
            {/* Toolbar */}
            <div className="p-2 border-b border-white/10 flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => { }}>
                  <Undo className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { }}>
                  <Redo className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button size="sm" variant="ghost" onClick={() => handleFormat('bold')}>
                  <Bold className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleFormat('italic')}>
                  <Italic className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleFormat('underline')}>
                  <Underline className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button size="sm" variant="ghost" onClick={() => handleFormat('left')}>
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleFormat('center')}>
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleFormat('right')}>
                  <AlignRight className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button size="sm" variant="ghost">
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <ImagePlus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={previewMode === "desktop" ? "secondary" : "ghost"}
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={previewMode === "mobile" ? "secondary" : "ghost"}
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview Area */}
            <ScrollArea className="flex-1 p-8">
              <div
                className={cn(
                  "mx-auto bg-white rounded-lg shadow-xl overflow-hidden transition-all",
                  previewMode === "desktop" ? "w-full max-w-2xl" : "w-80"
                )}
                style={{ backgroundColor: templateData.backgroundColor }}
              >
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={cn(
                      "group relative border-2 transition-all cursor-pointer",
                      selectedBlockId === block.id ? "border-primary" : "border-transparent hover:border-primary/50"
                    )}
                  >
                    {/* Block Controls */}
                    <div className={cn(
                      "absolute -left-10 top-1/2 -translate-y-1/2 transition-opacity flex flex-col gap-1",
                      selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                        disabled={index === blocks.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className={cn(
                      "absolute -right-10 top-1/2 -translate-y-1/2 transition-opacity flex flex-col gap-1",
                      selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); /* copy logic */ }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); setSelectedBlockId(null); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Block Content */}
                    {block.type === "header" && (
                      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: templateData.primaryColor, ...block.style }}>
                        <div className="text-white font-bold text-lg">{block.content || 'LOGO'}</div>
                        <div className="flex gap-4 text-white/80 text-sm">
                          <span>Home</span>
                          <span>Sobre</span>
                          <span>Contato</span>
                        </div>
                      </div>
                    )}

                    {block.type === "hero" && (
                      <div
                        className="h-48 flex items-center justify-center text-white text-2xl font-bold"
                        style={{ background: `linear-gradient(135deg, ${templateData.primaryColor}, ${templateData.secondaryColor})`, ...block.style }}
                      >
                        <div className="text-center">
                          {block.content ? block.content : (
                            <>
                              <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <span className="opacity-50">Hero Banner</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {block.type === "text" && (
                      <div className="p-6" style={{ fontFamily: templateData.font, ...block.style }}>
                        <div
                          className="text-gray-700 whitespace-pre-wrap outline-none"
                          style={{ fontSize: templateData.fontSize }}
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          dangerouslySetInnerHTML={{ __html: block.content || 'Lorem ipsum dolor sit amet...' }}
                          onBlur={(e) => {
                            const newContent = e.currentTarget.innerHTML;
                            setBlocks(blocks.map(b => b.id === block.id ? { ...b, content: newContent } : b));
                          }}
                          onClick={(e) => {
                            // Ensure clicking text selects the block without bubbling weirdly if DnD exists
                            e.stopPropagation();
                            setSelectedBlockId(block.id);
                          }}
                        />
                      </div>
                    )}

                    {block.type === "button" && (
                      <div className="p-6 flex justify-center" style={{ ...block.style }}>
                        <button
                          className="px-8 py-3 text-white font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: templateData.primaryColor,
                            borderRadius: templateData.borderRadius,
                            fontFamily: templateData.font,
                          }}
                        >
                          {block.content || 'Saiba Mais'}
                        </button>
                      </div>
                    )}

                    {block.type === "image" && (
                      <div className="p-6" style={{ ...block.style }}>
                        <div className="h-40 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          {block.url ? <img src={block.url} alt="block" className="w-full h-full object-cover" /> : <ImagePlus className="w-8 h-8 text-gray-400" />}
                        </div>
                      </div>
                    )}

                    {block.type === "columns" && (
                      <div className="p-6 grid grid-cols-2 gap-4" style={{ ...block.style }}>
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          {block.content ? block.content.split('|')[0] : 'Coluna 1'}
                        </div>
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          {block.content ? block.content.split('|')[1] : 'Coluna 2'}
                        </div>
                      </div>
                    )}

                    {block.type === "divider" && (
                      <div className="px-6 py-4" style={{ ...block.style }}>
                        <hr className="border-gray-200" />
                      </div>
                    )}

                    {block.type === "spacer" && (
                      <div className="h-8" style={{ ...block.style }} />
                    )}

                    {block.type === "social" && (
                      <div className="p-4 flex justify-center gap-4" style={{ ...block.style }}>
                        {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((social) => (
                          <div
                            key={social}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: templateData.primaryColor }}
                          >
                            {social[0]}
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "html" && (
                      <div className="p-2 border border-dashed border-gray-300 relative group/html">
                        <div className="absolute top-0 right-0 bg-gray-100 text-xs px-2 py-1 z-10 opacity-50 group-hover/html:opacity-100">HTML</div>
                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                      </div>
                    )}

                    {block.type === "footer" && (
                      <div className="p-6 bg-gray-100 text-center text-gray-500 text-sm" style={{ fontFamily: templateData.font, ...block.style }}>
                        <p>{block.content || '© 2024 Sua Empresa. Todos os direitos reservados.'}</p>
                        <p className="mt-2">
                          <span className="text-blue-500">Links de Rodapé</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Block Button */}
                <div className="p-4 border-2 border-dashed border-gray-300 m-4 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary/50 hover:text-primary cursor-pointer transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Bloco
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar - Block Settings */}
          <div className="w-80 border-l border-white/10 bg-card/30 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações do Bloco
            </h3>

            {selectedBlockId ? (
              <div className="space-y-4">
                {(() => {
                  const block = blocks.find(b => b.id === selectedBlockId);
                  if (!block) return null;
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Conteúdo / Texto</Label>
                          {block.type === 'text' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                // Convert text block to html block
                                setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, type: 'html' } : b));
                              }}
                            >
                              <Code2 className="w-3 h-3 mr-1" />
                              Converter para HTML
                            </Button>
                          )}
                        </div>

                        {block.type === 'html' ? (
                          <div className="relative">
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded pointer-events-none">HTML</div>
                            <Textarea
                              value={block.content || ''}
                              onChange={(e) => {
                                setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, content: e.target.value } : b));
                              }}
                              className="min-h-[200px] font-mono text-xs bg-slate-950 text-slate-100 border-slate-800"
                              placeholder="<div>Seu HTML aqui...</div>"
                            />
                          </div>
                        ) : (
                          <Textarea
                            value={block.content || ''}
                            onChange={(e) => {
                              setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, content: e.target.value } : b));
                            }}
                            className="min-h-[100px]"
                          />
                        )}
                      </div>

                      {(block.type === 'button' || block.type === 'image') && (
                        <div className="space-y-2">
                          <Label>{block.type === 'image' ? 'URL da Imagem' : 'Link do Botão'}</Label>
                          <Input
                            value={block.url || ''}
                            onChange={(e) => {
                              setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, url: e.target.value } : b));
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Cor de Fundo (Opcional)</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 p-1" onChange={(e) => {
                            setBlocks(blocks.map(b => b.id === selectedBlockId ? { ...b, style: { ...b.style, backgroundColor: e.target.value } } : b));
                          }} />
                        </div>
                      </div>

                      <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => {
                        removeBlock(block.id);
                        setSelectedBlockId(null);
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remover Bloco
                      </Button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border border-white/10 text-center text-muted-foreground text-sm">
                  Selecione um bloco para editar suas propriedades
                </div>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Wand2 className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Assistente IA</h4>
                        <p className="text-xs text-muted-foreground">Gere conteúdo automaticamente</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                      <Sparkles className="w-3 h-3 mr-2" />
                      Gerar Conteúdo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}
