import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  BedDouble,
  Users,
  Building2,
  CreditCard,
  Package,
  Tag,
  Calendar,
  Settings2,
  ChevronRight,
  Sparkles,
  Layers,
  Utensils,
  Car,
  Wifi,
  FileText,
  Zap,
  Mail,
  Chrome,
  Webhook,
  Code2,
  Puzzle,
  ShieldCheck,
  Receipt,
  Calculator,
  Warehouse,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RegistrationType {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
  color: string;
  bgColor: string;
  popular?: boolean;
}

const registrationTypes: RegistrationType[] = [
  // Hospedagem
  {
    id: "room-type",
    icon: BedDouble,
    title: "Tipo de Quarto",
    description: "Criar nova categoria de acomodação",
    category: "Hospedagem",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    popular: true,
  },
  {
    id: "room",
    icon: Layers,
    title: "Quarto/Unidade",
    description: "Adicionar nova unidade habitacional",
    category: "Hospedagem",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    popular: true,
  },
  {
    id: "amenity",
    icon: Wifi,
    title: "Amenidade",
    description: "Cadastrar nova comodidade",
    category: "Hospedagem",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  // Pessoas
  {
    id: "guest",
    icon: Users,
    title: "Hóspede",
    description: "Cadastrar novo hóspede",
    category: "Pessoas",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    popular: true,
  },
  {
    id: "company",
    icon: Building2,
    title: "Empresa",
    description: "Adicionar empresa ou agência",
    category: "Pessoas",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  // Financeiro
  {
    id: "rate-plan",
    icon: Tag,
    title: "Plano Tarifário",
    description: "Criar nova tarifa",
    category: "Financeiro",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    popular: true,
  },
  {
    id: "payment-method",
    icon: CreditCard,
    title: "Forma de Pagamento",
    description: "Adicionar método de pagamento",
    category: "Financeiro",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "chart-account",
    icon: Receipt,
    title: "Plano de Conta",
    description: "Nova conta financeira",
    category: "Financeiro",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  // Serviços
  {
    id: "extra",
    icon: Package,
    title: "Extra/Serviço",
    description: "Criar serviço adicional",
    category: "Serviços",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "meal",
    icon: Utensils,
    title: "Refeição",
    description: "Adicionar opção de alimentação",
    category: "Serviços",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "parking",
    icon: Car,
    title: "Estacionamento",
    description: "Configurar vaga de estacionamento",
    category: "Serviços",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
  },
  // Produtos
  {
    id: "product",
    icon: ShoppingBag,
    title: "Produto",
    description: "Cadastrar novo produto",
    category: "Produtos",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "product-group",
    icon: Warehouse,
    title: "Grupo de Produtos",
    description: "Criar categoria de produtos",
    category: "Produtos",
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/10",
  },
  // Sistema
  {
    id: "season",
    icon: Calendar,
    title: "Temporada",
    description: "Definir período sazonal",
    category: "Sistema",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "policy",
    icon: ShieldCheck,
    title: "Política",
    description: "Criar regra ou política",
    category: "Sistema",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "document-type",
    icon: FileText,
    title: "Tipo de Documento",
    description: "Adicionar tipo de documento",
    category: "Sistema",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
  },
  // Integrações
  {
    id: "smtp",
    icon: Mail,
    title: "Configuração SMTP",
    description: "Configurar servidor de e-mail",
    category: "Integrações",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "oauth",
    icon: Chrome,
    title: "OAuth Provider",
    description: "Configurar autenticação social",
    category: "Integrações",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    id: "webhook",
    icon: Webhook,
    title: "Webhook",
    description: "Criar novo webhook",
    category: "Integrações",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "api-key",
    icon: Code2,
    title: "API Key",
    description: "Gerar nova chave de API",
    category: "Integrações",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "app",
    icon: Puzzle,
    title: "Conectar App",
    description: "Integrar novo aplicativo",
    category: "Integrações",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

export function NewRegistrationModal({ open, onOpenChange }: NewRegistrationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...new Set(registrationTypes.map(r => r.category))];

  const filteredTypes = registrationTypes.filter(type => {
    const matchesSearch = type.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || type.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTypes = filteredTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, RegistrationType[]>);

  const handleSelect = (type: RegistrationType) => {
    toast({
      title: `Criar ${type.title}`,
      description: "Abrindo formulário de cadastro...",
    });
    onOpenChange(false);
  };

  const popularTypes = registrationTypes.filter(t => t.popular);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10">
        <DialogHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
              <Plus className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Novo Cadastro
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                Selecione o tipo de registro que deseja criar
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tipo de cadastro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0"
                  : "border-white/10"
                }
              >
                {cat === "all" ? "Todos" : cat}
              </Button>
            ))}
          </div>

          {/* Popular/Quick Access */}
          {activeCategory === "all" && searchTerm === "" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-medium text-muted-foreground">Acesso Rápido</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSelect(type)}
                    className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald-500/50 transition-all text-left group"
                  >
                    <div className={`p-2 rounded-lg ${type.bgColor} w-fit mb-3`}>
                      <type.icon className={`h-5 w-5 ${type.color}`} />
                    </div>
                    <h4 className="font-medium text-foreground group-hover:text-emerald-400 transition-colors">
                      {type.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Types */}
          <div className="space-y-6">
            {Object.entries(groupedTypes).map(([category, types]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-emerald-400" />
                  {category}
                  <Badge variant="secondary" className="ml-2">{types.length}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelect(type)}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-lg ${type.bgColor} shrink-0`}>
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                          {type.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTypes.length === 0 && (
            <div className="p-8 text-center rounded-xl bg-white/5 border border-white/10">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhum tipo de cadastro encontrado</p>
              <Button
                variant="outline"
                className="mt-4 border-white/10"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Help */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">Dica</h4>
                <p className="text-sm text-muted-foreground">
                  Você pode acessar rapidamente os cadastros através do menu lateral ou usando atalhos de teclado.
                  Pressione <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">K</kbd> para abrir a busca rápida.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
