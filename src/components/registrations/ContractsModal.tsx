import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, FileSignature, LayoutTemplate, PenSquare, Sparkles, ShieldCheck, Plus, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { DEFAULT_RESERVATION_CONTRACT_TEMPLATE } from "@/lib/reservationContractTemplate";

const BASE_TEMPLATE = DEFAULT_RESERVATION_CONTRACT_TEMPLATE;

interface ContractsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ContractModule = "reservations" | "financial" | "fiscal" | "dayuse" | "governance" | "general";
type ContractStatus = "draft" | "active";

/** Linhas de `contract_template_variables` (retorno da API). */
export interface ContractTemplateVariableRow {
  variableKey: string;
  variableLabel: string | null;
  sourceKey: string | null;
  isRequired: boolean;
}

interface ContractItem {
  id: number;
  name: string;
  module: ContractModule;
  description: string;
  status: ContractStatus;
  active: boolean;
  templateHtml: string;
  /** Chaves selecionadas (sincronizadas com a tabela quando existir registro). */
  selectedVariables: string[];
  /** VariÃ¡veis persistidas em `contract_template_variables`. */
  dbVariables: ContractTemplateVariableRow[];
}

/** Formato bruto de um template retornado por `GET /contract-templates`. */
interface ContractTemplateVariableApi {
  variableKey: string;
  variableLabel?: string | null;
  sourceKey?: string | null;
  isRequired?: boolean | number | string;
}

interface ContractTemplateApiRow {
  id: number;
  name?: string;
  moduleKey?: string;
  description?: string;
  content?: string;
  status?: string;
  isActive?: boolean;
  variables?: ContractTemplateVariableApi[];
}

const MODULE_OPTIONS: { value: ContractModule; label: string }[] = [
  { value: "reservations", label: "Reservas" },
  { value: "financial", label: "Financeiro" },
  { value: "fiscal", label: "Fiscal" },
  { value: "dayuse", label: "Day Use" },
  { value: "governance", label: "Governanca" },
  { value: "general", label: "Uso Geral" },
];

const STEP_TITLES = [
  "Dados do Contrato",
  "Variaveis Dinamicas",
  "Modelo e Conteudo",
  "Regras e Publicacao",
];

/** VariÃ¡veis suportadas na geraÃ§Ã£o do HTML (ReservationController.applyContractVariables). */
const AVAILABLE_VARIABLES = [
  { key: "{{hotel_nome}}", description: "Nome da propriedade (empreendimento)" },
  { key: "{{dados_pagamento_pix}}", description: "Dados PIX/conta bancária padrão da propriedade (Cadastros → Contas Bancárias)" },
  { key: "{{locador_nome}}", description: "Nome do locador/contratada" },
  { key: "{{locador_documento}}", description: "CPF/CNPJ do locador" },
  { key: "{{locador_endereco}}", description: "Endereço do locador" },
  { key: "{{locador_email}}", description: "E-mail do locador" },
  { key: "{{imovel_cidade_uf}}", description: "Cidade/UF do empreendimento" },
  { key: "{{unidade_descricao}}", description: "Unidade (ex.: 103 - Suite)" },
  { key: "{{hospede_endereco_completo}}", description: "Endereço completo do hóspede" },
  { key: "{{valor_total_extenso}}", description: "Valor total por extenso" },
  { key: "{{hospedes_capacidade_max}}", description: "Capacidade máxima da unidade" },
  { key: "{{hospedes_capacidade_extenso}}", description: "Capacidade por extenso (DEZ)" },
  { key: "{{valor_hospede_excedente}}", description: "Valor por hóspede excedente/dia" },
  { key: "{{hotel_nome_fantasia}}", description: "Nome fantasia (usa nome da propriedade)" },
  { key: "{{propriedade_telefone}}", description: "Telefone da propriedade" },
  { key: "{{propriedade_email}}", description: "E-mail da propriedade" },
  { key: "{{propriedade_website}}", description: "Site da propriedade" },
  { key: "{{propriedade_cep}}", description: "CEP da propriedade" },
  { key: "{{propriedade_bairro}}", description: "Bairro da propriedade" },
  { key: "{{contratada_nome}}", description: "RazÃ£o social / nome da contratada" },
  { key: "{{contratada_documento}}", description: "CNPJ/CPF da contratada (tax_id)" },
  { key: "{{imovel_endereco}}", description: "EndereÃ§o do imÃ³vel (propriedade)" },
  { key: "{{hospede_nome}}", description: "Nome completo do hÃ³spede" },
  { key: "{{hospede_documento}}", description: "CPF/documento do hÃ³spede" },
  { key: "{{hospede_rg}}", description: "RG (reservado â€” preencher manualmente no template se usar)" },
  { key: "{{hospede_endereco}}", description: "EndereÃ§o do hÃ³spede" },
  { key: "{{hospede_telefone}}", description: "Telefone do hÃ³spede" },
  { key: "{{hospede_email}}", description: "E-mail do hÃ³spede" },
  { key: "{{hospede_nacionalidade}}", description: "Nacionalidade do hÃ³spede" },
  { key: "{{hospede_cidade}}", description: "Cidade do hÃ³spede" },
  { key: "{{hospede_estado}}", description: "UF do hÃ³spede" },
  { key: "{{reserva_codigo}}", description: "NÃºmero da reserva" },
  { key: "{{confirmacao_codigo}}", description: "CÃ³digo de confirmaÃ§Ã£o" },
  { key: "{{status_reserva}}", description: "Status da reserva (pending, confirmed, etc.)" },
  { key: "{{checkin_data}}", description: "Data de check-in (pt-BR)" },
  { key: "{{checkout_data}}", description: "Data de check-out (pt-BR)" },
  { key: "{{checkin_hora}}", description: "HorÃ¡rio de check-in" },
  { key: "{{checkout_hora}}", description: "HorÃ¡rio de check-out" },
  { key: "{{noites}}", description: "Quantidade de noites" },
  { key: "{{hospedes_quantidade}}", description: "Total de hÃ³spedes (adultos + crianÃ§as)" },
  { key: "{{hospedes_adultos}}", description: "Quantidade de adultos" },
  { key: "{{hospedes_criancas}}", description: "Quantidade de crianÃ§as" },
  { key: "{{quarto_nome}}", description: "Tipo + unidade (ex.: Standard â€” Unidade 205)" },
  { key: "{{tipo_quarto}}", description: "Nome do tipo de quarto" },
  { key: "{{unidade_numero}}", description: "NÃºmero da unidade" },
  { key: "{{unidade_andar}}", description: "Andar da unidade" },
  { key: "{{unidade_capacidade}}", description: "Capacidade da unidade" },
  { key: "{{plano_tarifa}}", description: "Nome do plano tarifÃ¡rio" },
  { key: "{{valor_total}}", description: "Valor total da reserva (BRL)" },
  { key: "{{valor_diaria}}", description: "Valor da diÃ¡ria base (BRL)" },
  { key: "{{valor_desconto}}", description: "Desconto (BRL)" },
  { key: "{{valor_taxas}}", description: "Impostos/taxas (BRL)" },
  { key: "{{valor_taxas_servico}}", description: "Taxas de serviÃ§o (BRL)" },
  { key: "{{valor_sinal}}", description: "Sinal / depÃ³sito cadastrado (BRL)" },
  { key: "{{valor_saldo}}", description: "Saldo em aberto (BRL)" },
  { key: "{{valor_caucao}}", description: "CauÃ§Ã£o (usa depÃ³sito da reserva se nÃ£o houver campo especÃ­fico)" },
  { key: "{{forma_pagamento}}", description: "Forma de pagamento" },
  { key: "{{observacoes_reserva}}", description: "Pedidos especiais / observaÃ§Ãµes" },
  { key: "{{politica_pets}}", description: "PolÃ­tica de pets (texto)" },
  { key: "{{cancelamento_prazo_dias}}", description: "Prazo de cancelamento (dias) â€” padrÃ£o contrato" },
  { key: "{{cancelamento_percentual_reembolso}}", description: "% reembolso â€” padrÃ£o contrato" },
  { key: "{{cancelamento_percentual_multa}}", description: "% multa â€” padrÃ£o contrato" },
  { key: "{{caucao_prazo_devolucao_dias}}", description: "Prazo devoluÃ§Ã£o cauÃ§Ã£o (dias) â€” padrÃ£o" },
  { key: "{{foro_cidade_uf}}", description: "Foro (cidade/UF da propriedade)" },
  { key: "{{cidade_assinatura}}", description: "Cidade para rodapÃ© de assinatura" },
  { key: "{{data_assinatura}}", description: "Data da geraÃ§Ã£o (pt-BR)" },
  { key: "{{testemunha1_nome}}", description: "Testemunha 1 â€” preencher no sistema depois" },
  { key: "{{testemunha1_documento}}", description: "CPF testemunha 1" },
  { key: "{{testemunha2_nome}}", description: "Testemunha 2" },
  { key: "{{testemunha2_documento}}", description: "CPF testemunha 2" },
];


const extractVariables = (content: string): string[] => {
  const matches = content.match(/\{\{\s*[a-zA-Z0-9_]+\s*\}\}/g) || [];
  return Array.from(new Set(matches.map((m) => m.replace(/\s+/g, ""))));
};

/** Normaliza chave para o formato `{{nome_variavel}}` (como no HTML). */
function toContractVariableKey(raw: string): string {
  const s = String(raw || "").trim();
  if (!s) return "";
  const inner = s
    .replace(/^\{\{\s*/, "")
    .replace(/\s*\}\}\s*$/, "")
    .trim();
  if (!inner) return "";
  return `{{${inner}}}`;
}

export function ContractsModal({ open, onOpenChange }: ContractsModalProps) {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<number | null>(null);

  const editingContract = useMemo(
    () => contracts.find((contract) => contract.id === editingContractId) || null,
    [contracts, editingContractId]
  );

  const openNewWizard = () => {
    setEditingContractId(null);
    setWizardOpen(true);
  };

  const openEditWizard = (id: number) => {
    setEditingContractId(id);
    setWizardOpen(true);
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await api.getContractTemplates();
      if (!response.success) {
        throw new Error(response.error?.message || "Falha ao carregar contratos.");
      }
      const rows = (response.data?.contracts || []) as ContractTemplateApiRow[];
      const mapped = rows.map((row) => {
        const dbRows: ContractTemplateVariableRow[] = Array.isArray(row.variables)
          ? row.variables.map((v) => ({
              variableKey: toContractVariableKey(v.variableKey || ""),
              variableLabel: v.variableLabel ?? null,
              sourceKey: v.sourceKey ?? null,
              isRequired: Boolean(Number(v.isRequired)),
            }))
          : [];
        const fromDbKeys = dbRows.map((v) => v.variableKey).filter(Boolean);
        const selectedVariables =
          fromDbKeys.length > 0 ? Array.from(new Set(fromDbKeys)) : extractVariables(row.content || "");

        return {
          id: Number(row.id),
          name: row.name || "",
          module: (row.moduleKey || "general") as ContractModule,
          description: row.description || "",
          status: (row.status || "draft") as ContractStatus,
          active: Boolean(row.isActive),
          templateHtml: row.content || BASE_TEMPLATE,
          selectedVariables,
          dbVariables: dbRows,
        } as ContractItem;
      });
      setContracts(mapped);
    } catch (error) {
      console.error(error);
      toast.error("NÃ£o foi possÃ­vel carregar contratos do banco.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadContracts();
    }
  }, [open]);

  const handleSaveContract = async (payload: Omit<ContractItem, "id">) => {
    const requestBody = {
      moduleKey: payload.module,
      name: payload.name,
      description: payload.description || null,
      content: payload.templateHtml,
      status: payload.status,
      isActive: payload.active,
      variables: payload.selectedVariables.map((variableKey) => {
        const catalog = AVAILABLE_VARIABLES.find((v) => v.key === variableKey);
        const fromDb = payload.dbVariables?.find((v) => v.variableKey === variableKey);
        return {
          variableKey,
          variableLabel: fromDb?.variableLabel?.trim() || catalog?.description || variableKey,
          sourceKey: (fromDb?.sourceKey || variableKey.replace(/[{}]/g, "")).replace(/\s+/g, ""),
          isRequired: Boolean(fromDb?.isRequired),
        };
      }),
    };

    try {
      if (editingContractId) {
        const response = await api.updateContractTemplate(editingContractId, requestBody);
        if (!response.success) throw new Error(response.error?.message || "Falha ao atualizar contrato.");
        toast.success("Contrato atualizado com sucesso");
      } else {
        const response = await api.createContractTemplate(requestBody);
        if (!response.success) throw new Error(response.error?.message || "Falha ao criar contrato.");
        toast.success("Novo contrato criado com sucesso");
      }
      await loadContracts();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar contrato.";
      toast.error(msg);
      throw error;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-violet-400" />
              Contratos
            </DialogTitle>
            <DialogDescription>
              Selecione um contrato existente para editar ou crie um novo modelo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{contracts.length} contrato(s) cadastrado(s)</p>
            <Button className="gap-2" onClick={openNewWizard}>
              <Plus className="h-4 w-4" />
              Novo Contrato
            </Button>
          </div>

          <ScrollArea className="h-[62vh] pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!loading && contracts.length === 0 && (
                <div className="col-span-2 rounded-xl border p-6 text-center text-muted-foreground">
                  Nenhum contrato encontrado na base de dados.
                </div>
              )}
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  onClick={() => openEditWizard(contract.id)}
                  className="text-left rounded-xl border p-4 bg-card/50 hover:border-violet-400/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{contract.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{contract.description || "-"}</p>
                    </div>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                      {contract.status === "active" ? "Ativo" : "Rascunho"}
                    </Badge>
                    <Badge variant="outline">
                      {MODULE_OPTIONS.find((m) => m.value === contract.module)?.label || contract.module}
                    </Badge>
                    <Badge variant="outline">{contract.selectedVariables.length} variaveis</Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ContractWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialContract={editingContract}
        onSave={handleSaveContract}
      />
    </>
  );
}

interface ContractWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContract: ContractItem | null;
  onSave: (payload: Omit<ContractItem, "id">) => Promise<void>;
}

function ContractWizardModal({ open, onOpenChange, initialContract, onSave }: ContractWizardModalProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialContract?.name || "");
  const [module, setModule] = useState<ContractModule>(initialContract?.module || "reservations");
  const [description, setDescription] = useState(initialContract?.description || "");
  const [active, setActive] = useState(initialContract?.active ?? true);
  const [templateHtml, setTemplateHtml] = useState(initialContract?.templateHtml || BASE_TEMPLATE);
  const [status, setStatus] = useState<ContractStatus>(initialContract?.status || "draft");
  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    initialContract?.selectedVariables || ["{{hospede_nome}}", "{{reserva_codigo}}", "{{hotel_nome}}"]
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const visualIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [visualIframeKey, setVisualIframeKey] = useState(0);
  const [editorMode, setEditorMode] = useState<"full_html" | "wysiwyg">("full_html");
  const [fullHtmlShell, setFullHtmlShell] = useState<{ beforeBody: string; afterBody: string } | null>(null);
  const [visualBodyHtml, setVisualBodyHtml] = useState<string>("");
  const getComposedHtml = () => {
    if (editorMode === "wysiwyg" && fullHtmlShell) {
      return `${fullHtmlShell.beforeBody}${visualBodyHtml}${fullHtmlShell.afterBody}`;
    }
    return templateHtml;
  };
  const isFullDocumentHtml = useMemo(
    () => /<!doctype|<html|<head|<body/i.test(templateHtml),
    [templateHtml]
  );

  /** CatÃ¡logo + rÃ³tulos da tabela + placeholders encontrados no HTML. */
  const pickerVariables = useMemo(() => {
    const map = new Map<string, { key: string; description: string }>();
    for (const v of AVAILABLE_VARIABLES) {
      map.set(v.key, { key: v.key, description: v.description });
    }
    for (const row of initialContract?.dbVariables || []) {
      const key = row.variableKey;
      if (!key) continue;
      const catalog = AVAILABLE_VARIABLES.find((x) => x.key === key);
      const desc =
        (row.variableLabel && row.variableLabel.trim()) ||
        catalog?.description ||
        row.sourceKey ||
        key;
      map.set(key, { key, description: desc });
    }
    for (const k of extractVariables(templateHtml)) {
      if (!map.has(k)) {
        map.set(k, { key: k, description: "VariÃ¡vel no HTML do template" });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [initialContract?.dbVariables, templateHtml]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName(initialContract?.name || "");
    setModule(initialContract?.module || "reservations");
    setDescription(initialContract?.description || "");
    setActive(initialContract?.active ?? true);
    setTemplateHtml(initialContract?.templateHtml || BASE_TEMPLATE);
    setStatus(initialContract?.status || "draft");
    setSelectedVariables(
      initialContract?.selectedVariables || ["{{hospede_nome}}", "{{reserva_codigo}}", "{{hotel_nome}}"]
    );
    setEditorMode("full_html");
    setFullHtmlShell(null);
    setVisualBodyHtml("");
  }, [initialContract, open]);

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  const canNext = useMemo(() => {
    if (step === 0) {
      return name.trim().length >= 3;
    }
    if (step === 1) {
      return selectedVariables.length > 0;
    }
    if (step === 2) {
      return getComposedHtml().trim().length >= 30;
    }
    return true;
  }, [name, selectedVariables.length, step, templateHtml, editorMode, fullHtmlShell]);

  const toggleVariable = (variable: string) => {
    setSelectedVariables((prev) =>
      prev.includes(variable) ? prev.filter((v) => v !== variable) : [...prev, variable]
    );
  };

  const insertVariable = (variable: string) => {
    if (editorMode === "full_html") {
      setTemplateHtml((prev) => `${prev}${variable}`);
      return;
    }

    if (!fullHtmlShell && visualIframeRef.current?.contentDocument) {
      const doc = visualIframeRef.current.contentDocument;
      doc.execCommand("insertText", false, variable);
      const docType = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : "<!DOCTYPE html>";
      setTemplateHtml(`${docType}\n${doc.documentElement.outerHTML}`);
      return;
    }

    if (!fullHtmlShell) {
      setTemplateHtml((prev) => `${prev}${variable}`);
      return;
    }

    const editor = null;
    if (!editor) {
      setVisualBodyHtml((prev) => `${prev}${variable}`);
      return;
    }
  };

  const handleVisualIframeLoad = () => {
    const iframe = visualIframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    doc.designMode = "on";
    doc.body.style.minHeight = "100%";
    doc.body.style.padding = "16px";

    const sync = () => {
      const docType = doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : "<!DOCTYPE html>";
      setTemplateHtml(`${docType}\n${doc.documentElement.outerHTML}`);
    };

    doc.addEventListener("input", sync);
    doc.addEventListener("keyup", sync);
  };

  const switchToVisualEditor = () => {
    if (isFullDocumentHtml) {
      setFullHtmlShell(null);
      setVisualBodyHtml("");
      setEditorMode("wysiwyg");
      setVisualIframeKey((k) => k + 1);
      return;
    }
    if (!isFullDocumentHtml) {
      setVisualBodyHtml(templateHtml);
      setFullHtmlShell({ beforeBody: "", afterBody: "" });
    }
    setEditorMode("wysiwyg");
  };

  const switchToFullHtmlEditor = () => {
    if (editorMode === "wysiwyg" && fullHtmlShell) {
      const rebuilt = `${fullHtmlShell.beforeBody}${visualBodyHtml}${fullHtmlShell.afterBody}`;
      setTemplateHtml(rebuilt);
      setFullHtmlShell(null);
      setVisualBodyHtml("");
    }
    setEditorMode("full_html");
  };

  const handleBack = () => setStep((prev) => Math.max(0, prev - 1));

  const handleNext = () => {
    if (!canNext) return;
    if (step === STEP_TITLES.length - 1) {
      onSave({
        name,
        module,
        description,
        active,
        templateHtml: getComposedHtml(),
        status,
        selectedVariables,
        dbVariables: initialContract?.dbVariables || [],
      }).then(() => {
        setStep(0);
        onOpenChange(false);
      }).catch(() => {
        // toast handled by parent
      });
      return;
    }
    setStep((prev) => Math.min(STEP_TITLES.length - 1, prev + 1));
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-4 border-r bg-gradient-to-b from-violet-500/20 via-blue-500/10 to-background p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileSignature className="h-6 w-6 text-violet-400" />
                {initialContract ? "Editar Contrato" : "Novo Contrato"}
              </DialogTitle>
              <DialogDescription>
                Wizard completo para criar ou editar templates com variaveis dinamicas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% concluido</p>

              {STEP_TITLES.map((title, index) => {
                const activeStep = index === step;
                const doneStep = index < step;
                return (
                  <div
                    key={title}
                    className={`rounded-xl border p-3 transition ${
                      activeStep ? "border-violet-400 bg-violet-500/10" : "border-white/10 bg-card/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          doneStep
                            ? "bg-emerald-500/20 text-emerald-400"
                            : activeStep
                            ? "bg-violet-500/20 text-violet-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {doneStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={activeStep ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-8 flex flex-col h-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{STEP_TITLES[step]}</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {step === 0 && (
                  <>
                    <div className="grid gap-2">
                      <Label>Nome do Contrato</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Contrato Padrao de Hospedagem"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Modulo</Label>
                      <Select value={module} onValueChange={(value: ContractModule) => setModule(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODULE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Descricao</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalhe quando e como este contrato deve ser utilizado."
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Ativo para uso</p>
                        <p className="text-xs text-muted-foreground">Permite utilizar este template no sistema.</p>
                      </div>
                      <Switch checked={active} onCheckedChange={setActive} />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <p className="text-sm text-muted-foreground">
                        Selecione as variaveis que podem ser injetadas dinamicamente no contrato.
                      </p>
                    </div>
                    <ScrollArea className="h-[min(52vh,520px)] pr-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                        {pickerVariables.map((item) => {
                          const checked = selectedVariables.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => toggleVariable(item.key)}
                              className={`text-left border rounded-lg p-3 transition ${
                                checked ? "border-violet-400 bg-violet-500/10" : "border-white/10 hover:bg-muted/40"
                              }`}
                            >
                              <p className="font-mono text-sm break-all">{item.key}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </>
                )}

                {step === 2 && (
                  <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedVariables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => insertVariable(variable)}
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Conteudo do Contrato (WYSIWYG Avancado)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={editorMode === "full_html" ? "default" : "outline"}
                            onClick={switchToFullHtmlEditor}
                          >
                            HTML completo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={editorMode === "wysiwyg" ? "default" : "outline"}
                            onClick={switchToVisualEditor}
                          >
                            Editor visual
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setPreviewOpen(true)}>
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>
                      {editorMode === "wysiwyg" && !fullHtmlShell ? (
                        <div className="rounded-md border bg-white text-black">
                          <iframe
                            key={visualIframeKey}
                            ref={visualIframeRef}
                            title="editor-visual-contrato"
                            className="h-[520px] w-full"
                            srcDoc={templateHtml}
                            onLoad={handleVisualIframeLoad}
                          />
                        </div>
                      ) : editorMode === "wysiwyg" ? (
                        <div className="rounded-md border bg-white text-black">
                          <Textarea
                            className="min-h-[420px] font-mono text-sm"
                            value={visualBodyHtml}
                            onChange={(e) => setVisualBodyHtml(e.target.value)}
                            spellCheck={false}
                            wrap="off"
                          />
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <Label>Codigo HTML completo</Label>
                          <Textarea
                            className="min-h-[420px] font-mono text-sm"
                            value={templateHtml}
                            onChange={(e) => setTemplateHtml(e.target.value)}
                            spellCheck={false}
                            wrap="off"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Use "HTML completo" para manter documento inteiro com &lt;!DOCTYPE&gt;, &lt;head&gt; e &lt;style&gt; sem alteraÃ§Ãµes.
                      </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <>
                    <div className="rounded-xl border p-4 bg-card/60 space-y-4">
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4 text-violet-400" />
                        <p className="font-medium">Resumo do Template</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nome</p>
                          <p>{name || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Modulo</p>
                          <p>{MODULE_OPTIONS.find((m) => m.value === module)?.label || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Variaveis</p>
                          <p>{selectedVariables.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Select value={status} onValueChange={(value: ContractStatus) => setStatus(value)}>
                            <SelectTrigger className="h-8 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="active">Publicar como ativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    <div className="rounded-xl border p-4 bg-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <p className="text-sm font-medium">Boas praticas antes de publicar</p>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>- Revise clausulas juridicas e regras de cancelamento.</li>
                        <li>- Garanta que todas variaveis obrigatorias estejam no texto.</li>
                        <li>- Crie nova versao quando houver alteracao significativa.</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex items-center justify-between">
              <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleNext} disabled={!canNext} className="gap-2">
                  <PenSquare className="h-4 w-4" />
                  {step === STEP_TITLES.length - 1 ? "Finalizar" : "Continuar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-5xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Preview do Contrato</DialogTitle>
          <DialogDescription>Visualizacao renderizada do contrato em modal dedicado.</DialogDescription>
        </DialogHeader>
        <iframe
          title="preview-contrato"
          className="h-[70vh] w-full rounded-md border bg-white"
          srcDoc={getComposedHtml()}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}
