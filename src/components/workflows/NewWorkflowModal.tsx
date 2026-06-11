import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  GitBranch,
  Zap,
  Play,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Workflow,
  Check,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { NewTriggerModal } from "./NewTriggerModal";

interface NewWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggers: any[];
  actions: any[];
  onCreated?: () => void;
}

export function NewWorkflowModal({
  open,
  onOpenChange,
  triggers,
  actions,
  onCreated,
}: NewWorkflowModalProps) {
  const [step, setStep] = useState(1);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [activateImmediately, setActivateImmediately] = useState(true);
  const [showNewTriggerModal, setShowNewTriggerModal] = useState(false);
  const [customTriggers, setCustomTriggers] = useState<any[]>([]);

  const totalSteps = 4;

  const resetForm = () => {
    setStep(1);
    setWorkflowName("");
    setWorkflowDescription("");
    setSelectedTrigger(null);
    setSelectedActions([]);
    setActivateImmediately(true);
    setCustomTriggers([]);
  };

  const handleNewTriggerCreated = (newTrigger: any) => {
    setCustomTriggers(prev => [...prev, newTrigger]);
    setSelectedTrigger(newTrigger.id);
  };

  const allTriggers = [...triggers, ...customTriggers];

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleClose = () => {
    resetForm();
    setCreateError(null);
    onOpenChange(false);
  };

  const handleCreate = async () => {
    if (!selectedTrigger || selectedActions.length === 0) return;
    setCreating(true);
    setCreateError(null);
    try {
      const steps = [
        { stepType: "trigger" as const, triggerId: selectedTrigger },
        ...selectedActions.map((actionId) => ({ stepType: "action" as const, actionId })),
      ];
      const res = await api.createWorkflow({
        name: workflowName.trim(),
        description: workflowDescription.trim() || undefined,
        is_active: activateImmediately,
        steps,
      });
      if (res.success) {
        onCreated?.();
        handleClose();
      } else {
        setCreateError(res.error?.message || "Erro ao criar workflow");
      }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erro ao criar workflow");
    } finally {
      setCreating(false);
    }
  };

  const toggleAction = (actionId: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return workflowName.trim().length > 0;
      case 2:
        return selectedTrigger !== null;
      case 3:
        return selectedActions.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getTriggerData = (triggerId: string) => {
    return allTriggers.find((t) => t.id === triggerId);
  };

  const getActionData = (actionId: string) => {
    return actions.find((a) => a.id === actionId);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] h-[95vh] p-0 flex flex-col overflow-hidden">
        {/* Header com Gradiente */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 flex-shrink-0 shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yem0tNiAwSDI4djJoMnYtMnptMTIgMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Criar Novo Workflow</h2>
                <p className="text-white/80 text-sm">
                  Configure seu fluxo de automação em poucos passos
                </p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="relative mt-6 flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    step > s
                      ? "bg-white text-emerald-600"
                      : step === s
                      ? "bg-white/30 text-white border-2 border-white"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all",
                      step > s ? "bg-white" : "bg-white/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="relative mt-2 flex justify-between text-xs text-white/70">
            <span className="w-10 text-center">Info</span>
            <span className="w-10 text-center">Gatilho</span>
            <span className="w-10 text-center">Ações</span>
            <span className="w-10 text-center">Confirmar</span>
          </div>
        </div>

        {/* Content - área rolável no meio do modal */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-6 pb-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 mb-4">
                    <GitBranch className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Informações do Workflow</h3>
                  <p className="text-muted-foreground mt-1">
                    Dê um nome e descrição para identificar seu workflow
                  </p>
                </div>

                <div className="max-w-lg mx-auto space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nome do Workflow *</Label>
                    <Input
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Ex: Boas-vindas Novo Hóspede"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Descrição</Label>
                    <Textarea
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Descreva o que este workflow faz e quando deve ser executado..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Trigger */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 mb-4">
                    <Zap className="h-10 w-10 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Selecione o Gatilho</h3>
                  <p className="text-muted-foreground mt-1">
                    Escolha o evento que irá iniciar este workflow
                  </p>
                </div>

                {/* New Trigger Button */}
                <div className="flex justify-center mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewTriggerModal(true)}
                    className="gap-2 border-dashed border-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Novo Gatilho Personalizado
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {allTriggers.map((trigger) => {
                    const isCustom = customTriggers.some(ct => ct.id === trigger.id);
                    return (
                      <div
                        key={trigger.id}
                        className={cn(
                          "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                          selectedTrigger === trigger.id
                            ? "border-amber-500 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 shadow-md"
                            : "border-border hover:border-amber-500/50"
                        )}
                        onClick={() => setSelectedTrigger(trigger.id)}
                      >
                        {selectedTrigger === trigger.id && (
                          <div className="absolute top-3 right-3">
                            <div className="p-1 rounded-full bg-amber-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        {isCustom && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                            Personalizado
                          </Badge>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-3 rounded-xl transition-all",
                            selectedTrigger === trigger.id
                              ? "bg-amber-500/20"
                              : "bg-muted"
                          )}>
                            <trigger.icon className={cn(
                              "h-5 w-5",
                              selectedTrigger === trigger.id
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            )} />
                          </div>
                          <div className={cn("flex-1", isCustom && "pt-4")}>
                            <p className={cn(
                              "font-medium",
                              selectedTrigger === trigger.id && "text-amber-700 dark:text-amber-400"
                            )}>
                              {trigger.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {trigger.description}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {trigger.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Select Actions */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 mb-4">
                    <Play className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Selecione as Ações</h3>
                  <p className="text-muted-foreground mt-1">
                    Escolha uma ou mais ações que serão executadas
                  </p>
                  {selectedActions.length > 0 && (
                    <Badge className="mt-3 bg-blue-500">
                      {selectedActions.length} {selectedActions.length === 1 ? "ação selecionada" : "ações selecionadas"}
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {actions.map((action) => {
                    const isSelected = selectedActions.includes(action.id);
                    return (
                      <div
                        key={action.id}
                        className={cn(
                          "relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                          isSelected
                            ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-md"
                            : "border-border hover:border-blue-500/50"
                        )}
                        onClick={() => toggleAction(action.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="p-1 rounded-full bg-blue-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-3 rounded-xl transition-all",
                            isSelected ? "bg-blue-500/20" : "bg-muted"
                          )}>
                            <action.icon className={cn(
                              "h-5 w-5",
                              isSelected ? "text-blue-500" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "font-medium",
                              isSelected && "text-blue-700 dark:text-blue-400"
                            )}>
                              {action.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {action.description}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {action.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Revisar & Confirmar</h3>
                  <p className="text-muted-foreground mt-1">
                    Revise as configurações antes de criar o workflow
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Summary Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                    <div className="space-y-6">
                      {/* Workflow Info */}
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Workflow</p>
                        <h4 className="text-xl font-bold text-white">{workflowName}</h4>
                        {workflowDescription && (
                          <p className="text-slate-400 text-sm mt-1">{workflowDescription}</p>
                        )}
                      </div>

                      {/* Flow Visual */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Trigger */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                          {selectedTrigger && (() => {
                            const TriggerIcon = getTriggerData(selectedTrigger)?.icon || Zap;
                            return <TriggerIcon className="h-4 w-4 text-amber-400" />;
                          })()}
                          <span className="text-sm font-medium text-amber-300">
                            {getTriggerData(selectedTrigger || "")?.name}
                          </span>
                        </div>

                        <ArrowRight className="h-4 w-4 text-slate-500" />

                        {/* Actions */}
                        {selectedActions.map((actionId, index) => {
                          const action = getActionData(actionId);
                          if (!action) return null;
                          return (
                            <div key={actionId} className="flex items-center gap-2">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                                <action.icon className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-300">
                                  {action.name}
                                </span>
                              </div>
                              {index < selectedActions.length - 1 && (
                                <ArrowRight className="h-4 w-4 text-slate-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Activate Switch */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-green-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <Workflow className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium">Ativar workflow imediatamente</p>
                          <p className="text-sm text-muted-foreground">
                            O workflow começará a funcionar assim que for criado
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={activateImmediately}
                        onCheckedChange={setActivateImmediately}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {createError && (
          <div className="px-6 py-2 text-sm text-destructive bg-destructive/10 border-t">
            {createError}
          </div>
        )}
        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-muted/30 flex-shrink-0 shrink-0">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2" disabled={creating}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={creating}>
              Cancelar
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4" />
                {creating ? "Criando..." : "Criar Workflow"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* New Trigger Modal */}
      <NewTriggerModal
        open={showNewTriggerModal}
        onOpenChange={setShowNewTriggerModal}
        onCreated={handleNewTriggerCreated}
      />
    </Dialog>
  );
}
