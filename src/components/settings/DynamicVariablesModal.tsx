import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Variable,
  Plus,
  Trash2,
  Save,
  Search,
  Edit3,
  Code,
  User,
  Calendar,
  DollarSign,
  Building,
  FileText,
  Info,
  CheckCircle2,
  X,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

interface DynamicVariablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariableItem {
  id: string;
  key: string;
  description: string;
  category: string;
  example: string;
  isSystem: boolean;
}

const initialVariables: VariableItem[] = [
  { id: "1", key: "{nome}", description: "Nome do hóspede", category: "guest", example: "João Silva", isSystem: true },
  { id: "2", key: "{email}", description: "Email do hóspede", category: "guest", example: "joao@email.com", isSystem: true },
  { id: "3", key: "{telefone}", description: "Telefone do hóspede", category: "guest", example: "(11) 99999-9999", isSystem: true },
  { id: "4", key: "{cpf}", description: "CPF do hóspede", category: "guest", example: "123.456.789-00", isSystem: true },
  { id: "5", key: "{data_checkin}", description: "Data de check-in", category: "reservation", example: "15/01/2025", isSystem: true },
  { id: "6", key: "{data_checkout}", description: "Data de check-out", category: "reservation", example: "20/01/2025", isSystem: true },
  { id: "7", key: "{hora_checkin}", description: "Horário de check-in", category: "reservation", example: "14:00", isSystem: true },
  { id: "8", key: "{hora_checkout}", description: "Horário de check-out", category: "reservation", example: "12:00", isSystem: true },
  { id: "9", key: "{quarto}", description: "Número do quarto", category: "reservation", example: "101", isSystem: true },
  { id: "10", key: "{tipo_quarto}", description: "Tipo de acomodação", category: "reservation", example: "Suíte Master", isSystem: true },
  { id: "11", key: "{noites}", description: "Quantidade de noites", category: "reservation", example: "5", isSystem: true },
  { id: "12", key: "{valor_total}", description: "Valor total da reserva", category: "financial", example: "R$ 2.500,00", isSystem: true },
  { id: "13", key: "{valor_pago}", description: "Valor pago", category: "financial", example: "R$ 1.000,00", isSystem: true },
  { id: "14", key: "{valor_pendente}", description: "Valor pendente", category: "financial", example: "R$ 1.500,00", isSystem: true },
  { id: "15", key: "{valor_diaria}", description: "Valor da diária", category: "financial", example: "R$ 500,00", isSystem: true },
  { id: "16", key: "{protocolo}", description: "Número do protocolo", category: "reservation", example: "RES-20250115-0001", isSystem: true },
  { id: "17", key: "{hotel_nome}", description: "Nome do hotel", category: "hotel", example: "Hotel Paradise", isSystem: true },
  { id: "18", key: "{hotel_endereco}", description: "Endereço do hotel", category: "hotel", example: "Av. Principal, 123", isSystem: true },
  { id: "19", key: "{hotel_telefone}", description: "Telefone do hotel", category: "hotel", example: "(11) 3000-0000", isSystem: true },
  { id: "20", key: "{hotel_email}", description: "Email do hotel", category: "hotel", example: "contato@hotel.com", isSystem: true },
  { id: "21", key: "{hotel_cnpj}", description: "CNPJ do hotel", category: "hotel", example: "12.345.678/0001-90", isSystem: true },
  { id: "22", key: "{link_checkin}", description: "Link para check-in online", category: "links", example: "https://hotel.com/checkin/abc123", isSystem: true },
  { id: "23", key: "{link_avaliacao}", description: "Link para avaliação", category: "links", example: "https://hotel.com/review/abc123", isSystem: true },
];

const categories = [
  { id: "all", name: "Todas", icon: Variable, color: "text-rose-400" },
  { id: "guest", name: "Hóspede", icon: User, color: "text-blue-400" },
  { id: "reservation", name: "Reserva", icon: Calendar, color: "text-emerald-400" },
  { id: "financial", name: "Financeiro", icon: DollarSign, color: "text-amber-400" },
  { id: "hotel", name: "Hotel", icon: Building, color: "text-violet-400" },
  { id: "links", name: "Links", icon: FileText, color: "text-cyan-400" },
  { id: "custom", name: "Personalizadas", icon: Code, color: "text-pink-400" },
];

export function DynamicVariablesModal({ open, onOpenChange }: DynamicVariablesModalProps) {
  const [variables, setVariables] = useState<VariableItem[]>(initialVariables);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingVariable, setEditingVariable] = useState<VariableItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newVariable, setNewVariable] = useState({
    key: "",
    description: "",
    example: "",
  });

  const filteredVariables = variables.filter((v) => {
    const matchesSearch = 
      v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClose = () => {
    onOpenChange(false);
    setEditingVariable(null);
    setIsCreating(false);
    setNewVariable({ key: "", description: "", example: "" });
  };

  const handleSaveVariable = () => {
    if (editingVariable) {
      setVariables(variables.map(v => 
        v.id === editingVariable.id ? editingVariable : v
      ));
      toast.success("Variável atualizada com sucesso!");
      setEditingVariable(null);
    }
  };

  const handleCreateVariable = () => {
    if (!newVariable.key || !newVariable.description) {
      toast.error("Preencha a chave e descrição da variável");
      return;
    }

    const formattedKey = newVariable.key.startsWith("{") ? newVariable.key : `{${newVariable.key}}`;
    
    const newVar: VariableItem = {
      id: String(Date.now()),
      key: formattedKey,
      description: newVariable.description,
      example: newVariable.example || "-",
      category: "custom",
      isSystem: false,
    };

    setVariables([...variables, newVar]);
    toast.success("Variável criada com sucesso!");
    setIsCreating(false);
    setNewVariable({ key: "", description: "", example: "" });
  };

  const handleDeleteVariable = (id: string) => {
    const variable = variables.find(v => v.id === id);
    if (variable?.isSystem) {
      toast.error("Variáveis do sistema não podem ser excluídas");
      return;
    }
    setVariables(variables.filter(v => v.id !== id));
    toast.success("Variável excluída com sucesso!");
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full text-violet-500">
              <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
              <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
            </svg>
          </div>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-violet-500 to-purple-500">
                <Variable className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="block">Variáveis Dinâmicas</span>
                <span className="text-sm font-normal text-violet-400">
                  Gerencie as variáveis disponíveis para templates
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Sidebar - Categories */}
          <div className="w-56 border-r border-white/10 bg-background/30 p-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Categorias
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => {
                const count = cat.id === "all" 
                  ? variables.length 
                  : variables.filter(v => v.category === cat.id).length;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                      selectedCategory === cat.id
                        ? "bg-violet-500/20 text-violet-400"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <cat.icon className={cn("h-4 w-4", cat.color)} />
                    <span className="flex-1 text-sm">{cat.name}</span>
                    <Badge variant="secondary" className="bg-white/10 text-xs">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <Separator className="my-4 bg-white/10" />

            <Button 
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Variável
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar variáveis..."
                  className="pl-9 bg-background/50 border-white/10"
                />
              </div>
            </div>

            {/* Variables List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {/* Create New Variable Form */}
                {isCreating && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="h-4 w-4 text-violet-400" />
                      <h4 className="font-medium text-violet-400">Nova Variável Personalizada</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Chave da Variável</Label>
                        <Input
                          value={newVariable.key}
                          onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                          placeholder="nome_variavel"
                          className="bg-background/50 border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Será formatada como {`{${newVariable.key || "chave"}}`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Descrição</Label>
                        <Input
                          value={newVariable.description}
                          onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                          placeholder="Descrição da variável"
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Exemplo de Valor</Label>
                        <Input
                          value={newVariable.example}
                          onChange={(e) => setNewVariable({ ...newVariable, example: e.target.value })}
                          placeholder="Valor de exemplo"
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-white/10"
                        onClick={() => {
                          setIsCreating(false);
                          setNewVariable({ key: "", description: "", example: "" });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                        onClick={handleCreateVariable}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Criar Variável
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit Variable Form */}
                {editingVariable && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Edit3 className="h-4 w-4 text-amber-400" />
                      <h4 className="font-medium text-amber-400">Editando Variável</h4>
                      {editingVariable.isSystem && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">Sistema</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Chave da Variável</Label>
                        <Input
                          value={editingVariable.key}
                          onChange={(e) => setEditingVariable({ ...editingVariable, key: e.target.value })}
                          className="bg-background/50 border-white/10"
                          disabled={editingVariable.isSystem}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Descrição</Label>
                        <Input
                          value={editingVariable.description}
                          onChange={(e) => setEditingVariable({ ...editingVariable, description: e.target.value })}
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Exemplo de Valor</Label>
                        <Input
                          value={editingVariable.example}
                          onChange={(e) => setEditingVariable({ ...editingVariable, example: e.target.value })}
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-white/10"
                        onClick={() => setEditingVariable(null)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        onClick={handleSaveVariable}
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                )}

                {/* Variables List */}
                {filteredVariables.map((variable) => {
                  const catInfo = getCategoryInfo(variable.category);
                  
                  return (
                    <div
                      key={variable.id}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl border transition-all",
                        editingVariable?.id === variable.id
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-white/10 bg-background/30 hover:border-violet-500/30 hover:bg-violet-500/5"
                      )}
                    >
                      <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <div className={cn("p-2 rounded-lg", `bg-${variable.category === 'guest' ? 'blue' : variable.category === 'reservation' ? 'emerald' : variable.category === 'financial' ? 'amber' : variable.category === 'hotel' ? 'violet' : variable.category === 'links' ? 'cyan' : 'pink'}-500/20`)}>
                        <catInfo.icon className={cn("h-4 w-4", catInfo.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-violet-400 font-mono text-sm">{variable.key}</code>
                          {variable.isSystem && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">Sistema</Badge>
                          )}
                          {!variable.isSystem && (
                            <Badge className="bg-pink-500/20 text-pink-400 text-xs">Personalizada</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{variable.description}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Exemplo</p>
                        <p className="text-sm text-foreground">{variable.example}</p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-amber-500/20 hover:text-amber-400"
                          onClick={() => setEditingVariable(variable)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {!variable.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                            onClick={() => handleDeleteVariable(variable.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredVariables.length === 0 && (
                  <div className="text-center py-12">
                    <Variable className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma variável encontrada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-white/10 bg-background/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Variáveis do sistema não podem ser excluídas</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="border-white/10">
              Fechar
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
