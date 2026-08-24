import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  FileCode2,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Building2,
  Receipt,
  Package,
  AlertTriangle,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatNFeDate, parseNFeFile } from "@/lib/nfeImportParser";
import type { NFeImportSource, ParsedNFe } from "@/types/nfeImport";
import { ImportNFeMappingModal } from "@/components/inventory/ImportNFeMappingModal";

interface ImportNFeWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const wizardSteps = [
  { id: 1, title: "Origem", description: "Tipo do documento" },
  { id: 2, title: "Upload", description: "Enviar arquivo" },
  { id: 3, title: "Leitura", description: "Processar NF-e" },
  { id: 4, title: "Resumo", description: "Conferir dados" },
];

const sourceCards: Array<{
  id: NFeImportSource;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  recommended?: boolean;
}> = [
  {
    id: "xml",
    title: "XML NF-e",
    subtitle: "Arquivo oficial da Receita Federal — leitura mais precisa",
    icon: FileCode2,
    recommended: true,
  },
  {
    id: "pdf",
    title: "DANFE (PDF)",
    subtitle: "Nota em PDF — leitura automática dos itens (experimental)",
    icon: FileText,
  },
];

export function ImportNFeWizardModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportNFeWizardModalProps) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState<NFeImportSource>("xml");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsed, setParsed] = useState<ParsedNFe | null>(null);
  const [mappingOpen, setMappingOpen] = useState(false);

  const progressValue = useMemo(() => (step / wizardSteps.length) * 100, [step]);

  const reset = useCallback(() => {
    setStep(1);
    setSource("xml");
    setFile(null);
    setParsing(false);
    setParseProgress(0);
    setParsed(null);
    setMappingOpen(false);
  }, []);

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const acceptBySource = source === "xml" ? ".xml,text/xml,application/xml" : ".pdf,application/pdf";

  const handleFile = (next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    const lower = next.name.toLowerCase();
    if (source === "xml" && !lower.endsWith(".xml")) {
      toast.error("Selecione um arquivo XML da NF-e.");
      return;
    }
    if (source === "pdf" && !lower.endsWith(".pdf")) {
      toast.error("Selecione um arquivo PDF (DANFE).");
      return;
    }
    setFile(next);
  };

  const runParse = async () => {
    if (!file) {
      toast.error("Selecione um arquivo para continuar.");
      return;
    }

    setStep(3);
    setParsing(true);
    setParseProgress(15);

    try {
      setParseProgress(45);
      const result = await parseNFeFile(file, source);
      setParseProgress(100);
      setParsed(result);
      setTimeout(() => {
        setParsing(false);
        setStep(4);
      }, 400);
    } catch (error) {
      setParsing(false);
      setStep(2);
      toast.error(error instanceof Error ? error.message : "Falha ao ler a nota fiscal.");
    }
  };

  const canNext =
    (step === 1 && !!source) ||
    (step === 2 && !!file) ||
    step === 4;

  const goNext = () => {
    if (step === 2) {
      void runParse();
      return;
    }
    if (step === 4) {
      setMappingOpen(true);
      return;
    }
    setStep((current) => Math.min(current + 1, wizardSteps.length));
  };

  const goBack = () => setStep((current) => Math.max(current - 1, 1));

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 gap-0 overflow-hidden">
          <div className="grid lg:grid-cols-[260px_1fr] min-h-[640px]">
            <aside className="hidden lg:flex flex-col border-r bg-muted/30 p-5">
              <div className="mb-6">
                <Badge className="mb-2 bg-cyan-600">Importação NF-e</Badge>
                <h3 className="font-semibold text-lg">Entrada no estoque</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Leia a nota fiscal e importe os itens com de-para inteligente.
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {wizardSteps.map((item) => {
                  const active = step === item.id;
                  const done = step > item.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        active && "border-cyan-500 bg-cyan-500/10",
                        done && "border-emerald-500/40 bg-emerald-500/5",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                            active && "bg-cyan-600 text-white",
                            done && "bg-emerald-600 text-white",
                            !active && !done && "bg-muted text-muted-foreground",
                          )}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : item.id}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Progresso</span>
                  <span>{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            </aside>

            <div className="flex flex-col min-h-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-cyan-600" />
                  Importar NF-e para o estoque
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6 py-5">
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Escolha o formato do documento fiscal. O XML é o mais confiável para importação automática.
                      Você pode testar com o arquivo <code className="text-xs bg-muted px-1 rounded">exemplo.xml</code> na raiz do projeto.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {sourceCards.map((card) => {
                        const Icon = card.icon;
                        const selected = source === card.id;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              setSource(card.id);
                              setFile(null);
                            }}
                            className={cn(
                              "text-left rounded-2xl border p-5 transition-all hover:shadow-md",
                              selected
                                ? "border-cyan-500 bg-cyan-500/5 ring-2 ring-cyan-500/20"
                                : "border-border bg-card",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              {card.recommended && (
                                <Badge variant="secondary" className="gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Recomendado
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold mt-4">{card.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <label
                      htmlFor="nfe-upload"
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 px-6 py-14 cursor-pointer hover:bg-cyan-500/10 transition-colors"
                    >
                      <Upload className="w-10 h-10 text-cyan-600" />
                      <div className="text-center">
                        <p className="font-medium">
                          Arraste o {source === "xml" ? "XML da NF-e" : "DANFE em PDF"} ou clique para selecionar
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tamanho recomendado até 10 MB
                        </p>
                      </div>
                      <input
                        id="nfe-upload"
                        type="file"
                        accept={acceptBySource}
                        className="hidden"
                        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                      />
                    </label>

                    {file && (
                      <Card>
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              {source === "xml" ? (
                                <FileCode2 className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                            Remover
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <Loader2 className="w-12 h-12 animate-spin text-cyan-600" />
                    <div>
                      <h4 className="text-lg font-semibold">Lendo documento fiscal...</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Extraindo emitente, totais e itens da {source === "xml" ? "NF-e XML" : "DANFE PDF"}
                      </p>
                    </div>
                    <div className="w-full max-w-md">
                      <Progress value={parseProgress} className="h-2" />
                    </div>
                  </div>
                )}

                {step === 4 && parsed && (
                  <div className="space-y-5">
                    {parsed.warnings.length > 0 && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {parsed.warnings.map((warning) => (
                            <p key={warning} className="text-sm text-amber-900 dark:text-amber-100">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Building2 className="w-4 h-4" />
                            Emitente
                          </div>
                          <p className="font-semibold mt-2">{parsed.emitterName}</p>
                          {parsed.emitterDocument && (
                            <p className="text-xs text-muted-foreground mt-1">{parsed.emitterDocument}</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Receipt className="w-4 h-4" />
                            Nota fiscal
                          </div>
                          <p className="font-semibold mt-2">
                            NF {parsed.number ?? "—"}
                            {parsed.series ? ` / Série ${parsed.series}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Emissão: {formatNFeDate(parsed.issueDate)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Package className="w-4 h-4" />
                            Itens lidos
                          </div>
                          <p className="font-semibold mt-2">{parsed.items.length} produto(s)</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total NF:{" "}
                            {parsed.totalValue.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <div className="px-4 py-3 border-b font-medium">Prévia dos itens encontrados</div>
                        <ScrollArea className="max-h-[280px]">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/40 sticky top-0">
                              <tr className="text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Descrição</th>
                                <th className="px-4 py-2">Qtd</th>
                                <th className="px-4 py-2">V. Unit.</th>
                                <th className="px-4 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsed.items.map((item) => (
                                <tr key={`${item.lineNumber}-${item.code}`} className="border-t">
                                  <td className="px-4 py-2 font-mono text-xs">{item.code}</td>
                                  <td className="px-4 py-2">{item.description}</td>
                                  <td className="px-4 py-2">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="px-4 py-2">
                                    {item.unitPrice.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </td>
                                  <td className="px-4 py-2">
                                    {item.totalPrice.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </ScrollArea>

              <div className="border-t px-6 py-4 flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <div className="flex items-center gap-2">
                  {step > 1 && step !== 3 && (
                    <Button variant="outline" onClick={goBack} className="gap-1">
                      <ChevronLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button
                      onClick={goNext}
                      disabled={!canNext || parsing}
                      className="gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    >
                      {step === 2 ? "Ler documento" : "Continuar"}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={goNext}
                      disabled={!parsed}
                      className="gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    >
                      Mapear itens
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {parsed && (
        <ImportNFeMappingModal
          open={mappingOpen}
          onOpenChange={setMappingOpen}
          parsed={parsed}
          onSuccess={() => {
            setMappingOpen(false);
            handleClose(false);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
}
