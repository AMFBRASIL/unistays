import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Building2, Check, ChevronRight, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BankAccountsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountType = "checking" | "savings" | "payment";
type PixType = "cpf" | "cnpj" | "email" | "phone" | "random";

type Property = { id: number; name: string };
type BankAccount = {
  id: number;
  propertyId: number;
  propertyName: string;
  bankName: string;
  accountHolder: string;
  holderDocument?: string | null;
  accountType: AccountType;
  branch?: string | null;
  accountNumber: string;
  accountDigit?: string | null;
  pixKeyType?: PixType | null;
  pixKey?: string | null;
  isDefault: boolean;
  isActive: boolean;
  notes?: string | null;
};

const steps = [
  { id: "account", title: "Conta", description: "Banco e tipo de conta" },
  { id: "holder", title: "Titular", description: "Dados do recebedor" },
  { id: "review", title: "Revisão", description: "Conferência e status" },
];

const accountTypeCards: Array<{ id: AccountType; title: string; desc: string }> = [
  { id: "checking", title: "Conta Corrente", desc: "Uso diário com movimentação livre" },
  { id: "savings", title: "Conta Poupança", desc: "Conta para reservas e rendimento" },
  { id: "payment", title: "Conta de Pagamento", desc: "Conta digital para recebimentos" },
];

const pixTypeCards: Array<{ id: PixType; title: string }> = [
  { id: "cpf", title: "CPF" },
  { id: "cnpj", title: "CNPJ" },
  { id: "email", title: "E-mail" },
  { id: "phone", title: "Telefone" },
  { id: "random", title: "Chave Aleatória" },
];

export function BankAccountsModal({ open, onOpenChange }: BankAccountsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [holderDocument, setHolderDocument] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("checking");
  const [branch, setBranch] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDigit, setAccountDigit] = useState("");
  const [pixKeyType, setPixKeyType] = useState<PixType | "">("");
  const [pixKey, setPixKey] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");

  const progress = ((step + 1) / steps.length) * 100;

  const selectedPropertyName = useMemo(
    () => properties.find((p) => p.id === propertyId)?.name ?? "Selecione a propriedade",
    [properties, propertyId]
  );

  const resetForm = () => {
    setEditingId(null);
    setBankName("");
    setAccountHolder("");
    setHolderDocument("");
    setAccountType("checking");
    setBranch("");
    setAccountNumber("");
    setAccountDigit("");
    setPixKeyType("");
    setPixKey("");
    setIsDefault(true);
    setIsActive(true);
    setNotes("");
    setStep(0);
  };

  const loadAccounts = async (pid: number) => {
    setLoading(true);
    try {
      const response = await api.getPropertyBankAccounts(pid);
      const data = response.data as { accounts?: BankAccount[] };
      setAccounts(Array.isArray(data?.accounts) ? data.accounts : []);
    } catch {
      toast.error("Erro ao carregar contas bancárias.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    api.getProperties()
      .then((res) => {
        const data = res.data as { properties?: Property[] };
        const list = Array.isArray(data?.properties) ? data.properties : [];
        setProperties(list);
        const first = list[0]?.id ?? null;
        setPropertyId((prev) => prev ?? first);
      })
      .catch(() => setProperties([]));
  }, [open]);

  useEffect(() => {
    if (!open || !propertyId) return;
    loadAccounts(propertyId);
  }, [open, propertyId]);

  const openNewWizard = () => {
    resetForm();
    setWizardOpen(true);
  };

  const openEditWizard = (item: BankAccount) => {
    setEditingId(item.id);
    setBankName(item.bankName ?? "");
    setAccountHolder(item.accountHolder ?? "");
    setHolderDocument(item.holderDocument ?? "");
    setAccountType(item.accountType ?? "checking");
    setBranch(item.branch ?? "");
    setAccountNumber(item.accountNumber ?? "");
    setAccountDigit(item.accountDigit ?? "");
    setPixKeyType(item.pixKeyType ?? "");
    setPixKey(item.pixKey ?? "");
    setIsDefault(Boolean(item.isDefault));
    setIsActive(Boolean(item.isActive));
    setNotes(item.notes ?? "");
    setStep(0);
    setWizardOpen(true);
  };

  const handleSave = async () => {
    if (!propertyId) return toast.error("Selecione uma propriedade.");
    if (!bankName.trim()) return toast.error("Informe o banco.");
    if (!accountHolder.trim()) return toast.error("Informe o titular.");
    if (!accountNumber.trim()) return toast.error("Informe o número da conta.");

    setSaving(true);
    try {
      await api.createOrUpdatePropertyBankAccount({
        id: editingId ?? undefined,
        propertyId,
        bankName: bankName.trim(),
        accountHolder: accountHolder.trim(),
        holderDocument: holderDocument.trim() || null,
        accountType,
        branch: branch.trim() || null,
        accountNumber: accountNumber.trim(),
        accountDigit: accountDigit.trim() || null,
        pixKeyType: pixKeyType || null,
        pixKey: pixKey.trim() || null,
        isDefault,
        isActive,
        notes: notes.trim() || null,
      });
      toast.success(editingId ? "Conta bancária atualizada." : "Conta bancária criada.");
      setWizardOpen(false);
      resetForm();
      await loadAccounts(propertyId);
    } catch {
      toast.error("Erro ao salvar conta bancária.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!propertyId) return;
    try {
      await api.deletePropertyBankAccount(id);
      toast.success("Conta bancária removida.");
      await loadAccounts(propertyId);
    } catch {
      toast.error("Erro ao remover conta bancária.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          <div className="w-80 flex-shrink-0 bg-gradient-to-b from-emerald-600 to-cyan-700 p-6 text-white">
            <div className="p-3 rounded-2xl bg-white/10 w-fit mb-4">
              <Landmark className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Contas Bancárias</h2>
            <p className="text-emerald-100 text-sm mt-1">Contas por propriedade para recebimento</p>

            <div className="mt-6">
              <Label className="text-emerald-100 text-xs">Propriedade</Label>
              <Select value={propertyId ? String(propertyId) : ""} onValueChange={(v) => setPropertyId(Number(v))}>
                <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                  <Building2 className="h-4 w-4 mr-2 text-emerald-100" />
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {wizardOpen ? (
              <>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-emerald-100">Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/20" />
                </div>
                <div className="mt-6 space-y-2">
                  {steps.map((s, index) => (
                    <button
                      key={s.id}
                      onClick={() => setStep(index)}
                      className={cn(
                        "w-full rounded-xl p-3 text-left transition-all",
                        step === index ? "bg-white/20" : "hover:bg-white/10"
                      )}
                    >
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-emerald-100">{s.description}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-emerald-100 mb-3">Gerencie contas de {selectedPropertyName}</p>
                <Button className="w-full bg-white text-emerald-700 hover:bg-white/90" onClick={openNewWizard}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta Bancária
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="px-8 py-6 border-b bg-gradient-to-r from-emerald-50 to-cyan-50">
              <h3 className="text-xl font-bold text-foreground">
                {wizardOpen ? (editingId ? "Editar Conta Bancária" : "Nova Conta Bancária") : "Lista de Contas"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {wizardOpen ? "Preencha os dados da conta em etapas." : "Contas vinculadas à propriedade selecionada."}
              </p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8">
                {!wizardOpen && (
                  <div className="space-y-4">
                    {loading && <p className="text-sm text-muted-foreground">Carregando contas...</p>}
                    {!loading && accounts.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          Nenhuma conta cadastrada para esta propriedade.
                        </CardContent>
                      </Card>
                    )}
                    {accounts.map((item) => (
                      <Card key={item.id} className="border">
                        <CardContent className="p-5 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{item.bankName}</p>
                              {item.isDefault && <Badge className="bg-emerald-100 text-emerald-700">Padrão</Badge>}
                              <Badge variant={item.isActive ? "secondary" : "outline"}>
                                {item.isActive ? "Ativa" : "Inativa"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.accountHolder} · Agência {item.branch || "-"} · Conta {item.accountNumber}
                              {item.accountDigit ? `-${item.accountDigit}` : ""}
                            </p>
                            {item.pixKey && (
                              <p className="text-xs text-muted-foreground">PIX ({item.pixKeyType || "chave"}): {item.pixKey}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditWizard(item)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {wizardOpen && (
                  <div className="space-y-6">
                    {step === 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          {accountTypeCards.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setAccountType(type.id)}
                              className={cn(
                                "rounded-xl border p-4 text-left transition-all",
                                accountType === type.id ? "border-emerald-500 bg-emerald-50" : "hover:border-emerald-300"
                              )}
                            >
                              <p className="font-semibold">{type.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Banco</Label>
                            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Agência</Label>
                            <Input value={branch} onChange={(e) => setBranch(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Número da Conta</Label>
                            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Dígito</Label>
                            <Input value={accountDigit} onChange={(e) => setAccountDigit(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Titular</Label>
                            <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Documento do Titular</Label>
                            <Input value={holderDocument} onChange={(e) => setHolderDocument(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label className="mb-2 block">Tipo de Chave PIX</Label>
                          <div className="grid grid-cols-5 gap-3">
                            {pixTypeCards.map((pix) => (
                              <button
                                key={pix.id}
                                onClick={() => setPixKeyType(pix.id)}
                                className={cn(
                                  "rounded-xl border p-3 text-sm transition-all",
                                  pixKeyType === pix.id ? "border-cyan-500 bg-cyan-50" : "hover:border-cyan-300"
                                )}
                              >
                                {pix.title}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Chave PIX</Label>
                          <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="rounded-xl border p-5 bg-muted/30 space-y-2">
                          <p><strong>Propriedade:</strong> {selectedPropertyName}</p>
                          <p><strong>Banco:</strong> {bankName || "-"}</p>
                          <p><strong>Conta:</strong> {accountNumber || "-"}{accountDigit ? `-${accountDigit}` : ""}</p>
                          <p><strong>Titular:</strong> {accountHolder || "-"}</p>
                          <p><strong>PIX:</strong> {pixKey || "-"}</p>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border p-4">
                          <div>
                            <p className="font-medium">Conta padrão da propriedade</p>
                            <p className="text-xs text-muted-foreground">Somente uma conta padrão por propriedade</p>
                          </div>
                          <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border p-4">
                          <div>
                            <p className="font-medium">Conta ativa</p>
                            <p className="text-xs text-muted-foreground">Disponível para uso em recebimentos</p>
                          </div>
                          <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                        <div className="space-y-2">
                          <Label>Observações</Label>
                          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informações adicionais..." />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between p-6 border-t bg-muted/30">
              {!wizardOpen ? (
                <div />
              ) : (
                <Button variant="outline" onClick={() => (step > 0 ? setStep(step - 1) : setWizardOpen(false))}>
                  {step > 0 ? "Anterior" : "Voltar para lista"}
                </Button>
              )}
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
                {wizardOpen && (
                  step === steps.length - 1 ? (
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Conta"}
                    </Button>
                  ) : (
                    <Button onClick={() => setStep(step + 1)} className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )
                )}
                {!wizardOpen && (
                  <Button onClick={openNewWizard} className="bg-gradient-to-r from-emerald-500 to-cyan-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta Bancária
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

