import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Zap,
  Droplets,
  Wind,
  Building,
  Shield,
  BedDouble,
  Search,
  Sparkles,
  Bell,
  RefreshCw,
  Repeat,
  Target,
  ArrowRight,
  ArrowLeft,
  Play,
  Printer,
  Download,
  Copy,
  Loader2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { EquipmentModal } from "@/components/registrations/EquipmentModal";

interface NewMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Record<string, unknown>;
}

interface ApiProperty { id: number; name: string; city?: string }
interface ApiUnit { id: number; number: string; status: string; roomType?: { name: string } }
interface ApiSupplier { id: number | string; name: string; category?: { name: string }; specialty?: string }
interface ApiCategory { id: number | string; name: string; icon?: string | typeof Settings; color?: string }
interface ApiEquipment { id: number | string; name: string; location?: string; category?: ApiCategory; categoryId?: number; category_id?: number }
interface UploadedFile { fullUrl: string }

const equipmentCategories = [
  { id: "hvac", name: "HVAC / Climatização", icon: Wind, color: "bg-blue-500/10 text-blue-500" },
  { id: "elevator", name: "Elevadores", icon: Building, color: "bg-amber-500/10 text-amber-500" },
  { id: "electrical", name: "Elétrica", icon: Zap, color: "bg-yellow-500/10 text-yellow-500" },
  { id: "hydraulic", name: "Hidráulica", icon: Droplets, color: "bg-cyan-500/10 text-cyan-500" },
  { id: "security", name: "Segurança", icon: Shield, color: "bg-red-500/10 text-red-500" },
  { id: "rooms", name: "Quartos", icon: BedDouble, color: "bg-purple-500/10 text-purple-500" },
];

const maintenanceTypes = [
  { id: "preventiva", name: "Preventiva", description: "Manutenção programada para evitar falhas", icon: Shield, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "corretiva", name: "Corretiva", description: "Reparo de equipamento com defeito", icon: Wrench, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "outros", name: "Preditiva / Outros", description: "Baseada em análise de dados ou outros motivos", icon: Sparkles, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "inspecao", name: "Inspeção", description: "Verificação obrigatória ou de rotina", icon: Search, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
];

const frequencies = [
  { id: "once", name: "Única" },
  { id: "daily", name: "Diária" },
  { id: "weekly", name: "Semanal" },
  { id: "biweekly", name: "Quinzenal" },
  { id: "monthly", name: "Mensal" },
  { id: "bimonthly", name: "Bimestral" },
  { id: "quarterly", name: "Trimestral" },
  { id: "semiannual", name: "Semestral" },
  { id: "annual", name: "Anual" },
];

const priorities = [
  { id: "low", name: "Baixa", description: "Pode aguardar", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "medium", name: "Média", description: "Resolver em breve", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "high", name: "Alta", description: "Resolver rapidamente", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "critical", name: "Crítica", description: "Ação imediata", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

/* suppliers and equipmentList are loaded from API */

const steps = [
  { id: 1, label: "Equipamento", icon: Settings },
  { id: 2, label: "Tipo", icon: Target },
  { id: 3, label: "Agendamento", icon: CalendarIcon },
  { id: 4, label: "Detalhes", icon: FileText },
  { id: 5, label: "Revisão", icon: CheckCircle2 },
];

export function NewMaintenanceModal({ open, onOpenChange, onSuccess, initialData }: NewMaintenanceModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [priority, setPriority] = useState("medium");
  const [frequency, setFrequency] = useState("once");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [estimatedDuration, setEstimatedDuration] = useState([2]);
  const [estimatedCost, setEstimatedCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  // File upload
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API data
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [units, setUnits] = useState<ApiUnit[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [locationType, setLocationType] = useState<string>("general");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [equipmentCategoriesState, setEquipmentCategoriesState] = useState<ApiCategory[]>([]);
  const [equipmentList, setEquipmentList] = useState<ApiEquipment[]>([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);

  // Refs to track pending initialData application
  const pendingInitialDataRef = useRef<Record<string, unknown> | null>(null);
  const equipmentAppliedRef = useRef(false);
  const skipCategoryFetchRef = useRef(false); // prevents re-fetch when category is set during init
  // State counters to force re-fetch when editing same property
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Category mapping helper - uses String() to avoid type mismatch (number vs string)
  const matchesCategory = (equipmentCategoryId: number | undefined, selectedCat: string | number) => {
    if (!selectedCat) return true;
    if (!equipmentCategoryId) return false;
    const selectedCategoryObj = equipmentCategoriesState.find(c =>
      String(c.id) === String(selectedCat) || c.name === String(selectedCat)
    );
    if (selectedCategoryObj) {
      return String(equipmentCategoryId) === String(selectedCategoryObj.id);
    }
    // Fallback: direct comparison when categories haven't loaded yet
    return String(equipmentCategoryId) === String(selectedCat);
  };

  const filteredEquipment = equipmentList.filter(eq =>
    matchesCategory(eq.categoryId || eq.category_id, selectedCategory) &&
    (eq.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      (eq.location || "").toLowerCase().includes(equipmentSearch.toLowerCase()))
  );

  // Fetch Properties, Suppliers and Equipment Categories on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propsRes, suppliersRes, catsRes] = await Promise.all([
          api.getProperties(),
          api.getSuppliers(),
          api.getEquipmentCategories()
        ]);
        if (propsRes.success && propsRes.data?.properties) {
          setProperties(propsRes.data.properties as ApiProperty[]);
        }
        if (suppliersRes.success && suppliersRes.data?.suppliers) {
          setSuppliers(suppliersRes.data.suppliers as ApiSupplier[]);
        }
        if (catsRes.success && catsRes.data?.equipmentCategories) {
          setEquipmentCategoriesState(catsRes.data.equipmentCategories as ApiCategory[]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch equipments when category or property changes
  useEffect(() => {
    // Skip re-fetch when category was set during initialData application (IDs already set)
    if (skipCategoryFetchRef.current) {
      skipCategoryFetchRef.current = false;
      return;
    }

    const fetchEquipments = async () => {
      setIsLoadingEquipments(true);
      try {
        // When editing legacy data (no equipmentId), fetch ALL so we can match by name
        const isLegacyPending = pendingInitialDataRef.current && !equipmentAppliedRef.current;
        let params: Record<string, unknown> = { active: true };
        if (!isLegacyPending && selectedCategory) {
          const selectedCategoryObj = equipmentCategoriesState.find(c =>
            String(c.id) === String(selectedCategory) || c.name === selectedCategory
          );
          if (selectedCategoryObj) {
            params = { categoryId: Number(selectedCategoryObj.id), active: true };
          }
        }
        const response = await api.getEquipments(params);
        if (response.success && response.data?.equipments) {
          const list = response.data.equipments as ApiEquipment[];
          setEquipmentList(list);

          // Fallback: legacy data without IDs - match by equipment name
          const pending = pendingInitialDataRef.current;
          if (pending && !equipmentAppliedRef.current) {
            const equipName = String(pending.equipment || "");
            const eq = list.find(e =>
              e.name === equipName || e.name?.toLowerCase() === equipName.toLowerCase()
            );
            if (eq) {
              equipmentAppliedRef.current = true;
              setSelectedEquipment(eq.id?.toString() || "");
              const catId = eq.categoryId || (eq as unknown as Record<string, unknown>).category_id;
              if (catId) {
                skipCategoryFetchRef.current = true;
                setSelectedCategory(String(catId));
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
        setEquipmentList([]);
      } finally {
        setIsLoadingEquipments(false);
      }
    };
    if (selectedProperty) {
      fetchEquipments();
    }
  }, [selectedCategory, selectedProperty, equipmentCategoriesState, fetchTrigger]);

  // Fetch Units when Property Changes
  useEffect(() => {
    if (selectedProperty) {
      api.getUnits(parseInt(selectedProperty)).then((res) => {
        if (res.success && res.data.units) {
          const unitsList = res.data.units as ApiUnit[];
          setUnits(unitsList);

          // Fallback: legacy data without unitId - match by equipment name
          const pending = pendingInitialDataRef.current;
          if (pending && !pending.unitId && unitsList.length > 0) {
            const equipName = String(pending.equipment || "");
            if (equipName.toLowerCase().startsWith("unidade")) {
              const unitNumber = equipName.replace(/^unidade\s*/i, "").trim();
              const matchedUnit = unitsList.find(u =>
                String(u.number) === unitNumber || String(u.number).trim() === unitNumber
              );
              if (matchedUnit) {
                setSelectedUnit(matchedUnit.id.toString());
              }
            }
          }
          // If unitId was set directly in initialData, selectedUnit is already correct
        }
      });
    } else {
      setUnits([]);
    }
  }, [selectedProperty, fetchTrigger]);

  // When modal opens with initialData, set basic fields + IDs directly
  useEffect(() => {
    if (open && initialData) {
      pendingInitialDataRef.current = initialData;
      equipmentAppliedRef.current = false;
      skipCategoryFetchRef.current = false;

      // Detect location type from unitId or equipment name
      const hasUnitId = !!initialData.unitId;
      const equipName = String(initialData.equipment || "");
      const isUnit = hasUnitId || equipName.toLowerCase().startsWith("unidade");
      setLocationType(isUnit ? "unit" : "general");

      // Set IDs directly if available (new data with stored IDs)
      // Category and equipment are set BEFORE the fetch runs (React batches state),
      // so the fetch will use the correct category filter automatically.
      if (initialData.categoryId) {
        setSelectedCategory(String(initialData.categoryId));
      } else {
        setSelectedCategory("");
      }
      if (initialData.equipmentId) {
        setSelectedEquipment(String(initialData.equipmentId));
        equipmentAppliedRef.current = true; // mark as already applied, skip name-matching fallback
      } else {
        setSelectedEquipment("");
      }
      if (initialData.unitId) {
        setSelectedUnit(String(initialData.unitId));
      } else {
        setSelectedUnit("");
      }
      setSupplier("");

      // Set property and force re-fetch even if same property
      if (initialData.propertyId) {
        setSelectedProperty(String(initialData.propertyId));
      }
      setFetchTrigger(prev => prev + 1);

      // Set non-dependent fields immediately
      setMaintenanceType(String(initialData.type || ""));
      setPriority(String(initialData.priority || "medium"));
      if (initialData.scheduledDate) {
        const date = new Date(initialData.scheduledDate as string);
        setScheduledDate(date);
        setScheduledTime(format(date, "HH:mm"));
      }
      setEstimatedCost(initialData.cost ? (() => {
        const num = Number(initialData.cost);
        if (num === 0) return "";
        return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      })() : "");
      setDescription(String(initialData.description || ""));
      setNotes("");
      if (initialData.images && Array.isArray(initialData.images)) {
        setAttachments(initialData.images as string[]);
      }
      setStep(1);
    } else if (open && !initialData) {
      pendingInitialDataRef.current = null;
      equipmentAppliedRef.current = false;
      skipCategoryFetchRef.current = false;
      resetForm();
    }
  }, [open, initialData]);

  // When suppliers load, apply pending initialData for supplier
  useEffect(() => {
    const pending = pendingInitialDataRef.current;
    if (!pending || suppliers.length === 0) return;

    const assignedTo = String(pending.assignedTo || "");
    if (!assignedTo) return;

    const sup = suppliers.find(s => s.name === assignedTo);
    if (sup) setSupplier(sup.id?.toString() || "");
  }, [suppliers]);

  // Clear pending refs when modal closes
  useEffect(() => {
    if (!open) {
      pendingInitialDataRef.current = null;
      equipmentAppliedRef.current = false;
      skipCategoryFetchRef.current = false;
    }
  }, [open]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        const files = Array.from(e.target.files);
        const response = await api.uploadFiles(files);
        if (response.success && response.data?.files) {
          const newUrls = response.data.files.map((f: UploadedFile) => f.fullUrl);
          setAttachments(prev => [...prev, ...newUrls]);
          toast({ title: "Arquivos enviados", description: `${files.length} arquivo(s) enviado(s) com sucesso.` });
        } else {
          toast({ title: "Erro no upload", description: "Não foi possível enviar os arquivos.", variant: "destructive" });
        }
      } catch (error) {
        console.error(error);
        toast({ title: "Erro no upload", description: "Ocorreu um erro ao enviar os arquivos.", variant: "destructive" });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const generateProtocol = () => {
    const now = new Date();
    const dateStr = format(now, "yyyyMMdd");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MNT-${dateStr}-${random}`;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const selectedEq = equipmentList.find(e => e.id?.toString() === selectedEquipment);

      // Format datetime
      const dt = scheduledDate ? new Date(scheduledDate) : new Date();
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      dt.setHours(hours, minutes, 0, 0);

      // Determine identifiers
      let finalEquipmentName = "Desconhecido";
      let finalLocation = "Desconhecido";

      if (locationType === 'unit' && selectedUnit) {
        const u = units.find(unit => unit.id.toString() === selectedUnit);
        if (u) {
          finalEquipmentName = `Unidade ${u.number}`;
          finalLocation = `Unidade ${u.number}`;
          await api.updateUnit(u.id, { status: 'maintenance' });
        }
      } else {
        finalEquipmentName = selectedEq?.name || "Desconhecido";
        finalLocation = selectedEq?.location || "Desconhecido";
      }

      // Resolve category ID from selectedCategory (could be numeric string)
      const resolvedCategoryId = selectedCategory ? parseInt(selectedCategory) : undefined;

      const payload = {
        title: `${maintenanceTypes.find(t => t.id === maintenanceType)?.name} - ${finalEquipmentName}`,
        equipment: finalEquipmentName,
        equipmentId: selectedEq?.id || undefined,
        categoryId: resolvedCategoryId || undefined,
        unitId: locationType === 'unit' && selectedUnit ? parseInt(selectedUnit) : undefined,
        location: finalLocation,
        propertyId: selectedProperty ? parseInt(selectedProperty) : undefined,
        type: maintenanceType,
        priority: priority,
        status: initialData ? String(initialData.status) : 'scheduled',
        description: description,
        scheduledDate: dt,
        dueDate: dt,
        assignedTo: suppliers.find(s => s.id?.toString() === supplier)?.name,
        cost: estimatedCost ? parseFloat(estimatedCost.replace(/\./g, '').replace(',', '.')) : 0,
        images: attachments,
      };

      console.log('[NewMaintenanceModal] handleSubmit payload:', {
        equipmentId: payload.equipmentId,
        categoryId: payload.categoryId,
        unitId: payload.unitId,
        equipment: payload.equipment,
        locationType,
        selectedEquipment,
        selectedCategory,
        selectedEqId: selectedEq?.id,
      });

      let response;
      if (initialData && initialData.id) {
        response = await api.updateMaintenanceOrder(initialData.id as number, payload);
      } else {
        response = await api.createMaintenanceOrder(payload);
      }

      if (response.success) {
        const protocol = generateProtocol();
        setGeneratedProtocol(protocol);
        setShowSuccess(true);
        toast({
          title: initialData ? "Manutenção Atualizada" : "Manutenção Criada",
          description: initialData
            ? "A ordem de manutenção foi atualizada com sucesso."
            : `Protocolo ${protocol} gerado com sucesso.`,
        });
        if (onSuccess) onSuccess();
      } else {
        toast({ title: "Erro", description: "Falha ao salvar ordem de manutenção.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Ocorreu um erro ao processar a manutenção.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setShowSuccess(false);
    setGeneratedProtocol("");
    setSelectedCategory("");
    setSelectedEquipment("");
    setMaintenanceType("");
    setPriority("medium");
    setFrequency("once");
    setScheduledDate(undefined);
    setScheduledTime("09:00");
    setEstimatedDuration([2]);
    setEstimatedCost("");
    setSupplier("");
    setDescription("");
    setNotes("");
    setNotifyTeam(true);
    setAutoReschedule(true);
    setRequireApproval(false);
    setEquipmentSearch("");
    setAttachments([]);
    setSelectedUnit("");
    setLocationType("general");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        if (!selectedProperty) return false;
        if (locationType === 'unit' && !selectedUnit) return false;
        return selectedEquipment !== "";
      case 2: return maintenanceType !== "" && priority !== "";
      case 3: return scheduledDate !== undefined;
      case 4: return true;
      default: return true;
    }
  };

  const progressPercent = showSuccess ? 100 : ((step - 1) / (steps.length - 1)) * 100;

  const selectedEquipmentData = equipmentList.find(e => e.id?.toString() === selectedEquipment);
  const selectedTypeData = maintenanceTypes.find(t => t.id === maintenanceType);
  const selectedPriorityData = priorities.find(p => p.id === priority);
  const selectedSupplierData = suppliers.find(s => s.id?.toString() === supplier);

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-card border-0">
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Manutenção Criada!</h2>
            <p className="text-muted-foreground mb-6">Sua ordem de manutenção foi registrada com sucesso.</p>

            <div className="w-full p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Protocolo</p>
              <p className="text-2xl font-bold font-mono text-orange-600">{generatedProtocol}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mb-6 text-sm">
              <div className="p-3 rounded-lg bg-muted/50 text-left">
                <p className="text-muted-foreground text-xs">Equipamento</p>
                <p className="font-medium">{selectedEquipmentData?.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-left">
                <p className="text-muted-foreground text-xs">Tipo</p>
                <p className="font-medium">{selectedTypeData?.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-left">
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="font-medium">{scheduledDate ? format(scheduledDate, "dd/MM/yyyy") : "-"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-left">
                <p className="text-muted-foreground text-xs">Custo Est.</p>
                <p className="font-medium">{estimatedCost ? `R$ ${estimatedCost}` : "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => { }}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                navigator.clipboard.writeText(generatedProtocol);
                toast({ title: "Copiado!", description: "Protocolo copiado." });
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full mt-3">
              <Button variant="outline" className="flex-1" onClick={() => { resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Manutenção
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90" onClick={handleClose}>
                Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden bg-white dark:bg-card border-0">
        {/* Top Progress Bar */}
        <div className="h-1.5 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex h-[calc(85vh-6px)] overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 shrink-0 bg-gradient-to-b from-orange-600 via-amber-600 to-orange-700 text-white flex flex-col">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Nova Manutenção</h2>
                  <p className="text-xs text-white/70">Etapa {step} de {steps.length}</p>
                </div>
              </div>
              <Progress value={progressPercent} className="h-1.5 bg-white/20 mt-3 [&>div]:bg-white" />
            </div>

            {/* Steps Navigation */}
            <nav className="flex-1 px-4 space-y-1">
              {steps.map((s) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (isDone) setStep(s.id);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all",
                      isActive
                        ? "bg-white/20 backdrop-blur-sm shadow-lg"
                        : isDone
                          ? "bg-white/5 hover:bg-white/10 cursor-pointer"
                          : "text-white/40 cursor-default"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                      isActive ? "bg-white text-orange-600" :
                        isDone ? "bg-white/20 text-white" : "bg-white/10 text-white/40"
                    )}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-white" : isDone ? "text-white/80" : "text-white/40"
                    )}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer - AI Tip */}
            <div className="p-4 m-4 mt-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Dica Inteligente</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {step === 1 && "Selecione o equipamento que precisa de manutenção. Use os filtros por categoria para agilizar."}
                {step === 2 && "Manutenções preventivas reduzem custos em até 40% comparado com corretivas."}
                {step === 3 && "Agende para horários de menor ocupação para minimizar impacto nos hóspedes."}
                {step === 4 && "Uma boa descrição do serviço facilita o trabalho do prestador e reduz retrabalho."}
                {step === 5 && "Revise todos os dados antes de confirmar. O protocolo será gerado automaticamente."}
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content Header */}
            <div className="px-8 pt-6 pb-4">
              <h3 className="text-xl font-bold">{steps.find(s => s.id === step)?.label}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 1 && "Selecione a categoria e o equipamento para manutenção"}
                {step === 2 && "Defina o tipo de manutenção, prioridade e frequência"}
                {step === 3 && "Configure data, horário e responsável pelo serviço"}
                {step === 4 && "Adicione descrição, anexos e configurações extras"}
                {step === 5 && "Confira todos os dados e confirme a ordem de serviço"}
              </p>
            </div>

            <Separator />

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                {/* STEP 1 - Property & Equipment */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Property Selection */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">Propriedade</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {properties.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProperty(p.id.toString())}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all relative",
                              selectedProperty === p.id.toString()
                                ? "bg-orange-500/10 border-orange-500/30 shadow-sm"
                                : "bg-card border-border hover:border-orange-500/20"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg",
                              selectedProperty === p.id.toString() ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
                            )}>
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-medium block">{p.name}</span>
                              <span className="text-[10px] text-muted-foreground">{p.city || "Localização N/A"}</span>
                            </div>
                            {selectedProperty === p.id.toString() && (
                              <CheckCircle2 className="w-4 h-4 text-orange-500 absolute top-2 right-2" />
                            )}
                          </button>
                        ))}
                      </div>
                      {properties.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed">
                          Nenhuma propriedade encontrada.
                        </p>
                      )}
                    </div>

                    {/* Location Type Toggle */}
                    {selectedProperty && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Tipo de Local</Label>
                        <div className="bg-muted/30 p-1 rounded-lg grid grid-cols-2 gap-1">
                          <button
                            onClick={() => setLocationType("general")}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium transition-all",
                              locationType === "general"
                                ? "bg-white dark:bg-card shadow text-foreground"
                                : "text-muted-foreground hover:bg-white/50"
                            )}
                          >
                            Área Comum / Equipamento
                          </button>
                          <button
                            onClick={() => setLocationType("unit")}
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium transition-all",
                              locationType === "unit"
                                ? "bg-white dark:bg-card shadow text-foreground"
                                : "text-muted-foreground hover:bg-white/50"
                            )}
                          >
                            Unidade / Quarto
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Unit Selection */}
                    {selectedProperty && locationType === "unit" && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Selecione a Unidade</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {units.map((unit) => {
                            const statusConfig: Record<string, { label: string; bgColor: string; iconColor: string; badgeColor: string }> = {
                              'available': { label: 'Disponível', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500', badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                              'occupied': { label: 'Ocupado', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500', badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
                              'maintenance': { label: 'Em Manutenção', bgColor: 'bg-orange-500/10', iconColor: 'text-orange-500', badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
                              'cleaning': { label: 'Limpeza', bgColor: 'bg-cyan-500/10', iconColor: 'text-cyan-500', badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
                              'blocked': { label: 'Bloqueado', bgColor: 'bg-red-500/10', iconColor: 'text-red-500', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20' },
                            };
                            const config = statusConfig[unit.status] || statusConfig['available'];
                            return (
                              <div
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit.id.toString())}
                                className={cn(
                                  "p-3 rounded-xl border-2 cursor-pointer transition-all",
                                  selectedUnit === unit.id.toString()
                                    ? "bg-orange-500/5 border-orange-500/30 shadow-sm"
                                    : "bg-card border-border hover:border-orange-500/20"
                                )}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={cn("p-2 rounded-lg", config.bgColor)}>
                                      <BedDouble className={cn("w-4 h-4", config.iconColor)} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">Unidade {unit.number}</p>
                                      {unit.roomType && <p className="text-xs text-muted-foreground">{unit.roomType.name}</p>}
                                    </div>
                                  </div>
                                  {selectedUnit === unit.id.toString() && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                                </div>
                                <Badge variant="outline" className={cn("text-xs", config.badgeColor)}>{config.label}</Badge>
                              </div>
                            );
                          })}
                        </div>
                        {units.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma unidade encontrada nesta propriedade.</p>
                        )}
                      </div>
                    )}

                    {/* Category Filter & Equipment */}
                    {selectedProperty && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-3 block">Filtrar por categoria</Label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {(equipmentCategoriesState.length > 0 ? equipmentCategoriesState : equipmentCategories).map((cat) => {
                              const icons: Record<string, React.ComponentType<{ className?: string }>> = { Wind, Building, Zap, Droplets, Shield, BedDouble };
                              const Icon = (typeof cat.icon === 'string' ? icons[cat.icon] : cat.icon) || Settings;
                              const catId = String(cat.id || cat.name);
                              return (
                                <button
                                  key={catId}
                                  onClick={() => setSelectedCategory(selectedCategory === catId ? "" : catId)}
                                  className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                    selectedCategory === catId
                                      ? "bg-orange-500/10 border-orange-500/30 shadow-sm"
                                      : "bg-card border-border hover:border-orange-500/20"
                                  )}
                                >
                                  <div className={cn("p-2 rounded-lg", cat.color || "bg-orange-500/10 text-orange-500")}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-[11px] font-medium text-center leading-tight">{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar equipamento por nome ou localização..."
                            value={equipmentSearch}
                            onChange={(e) => setEquipmentSearch(e.target.value)}
                            className="pl-10 bg-muted/30"
                          />
                        </div>

                        <div className="space-y-2">
                          {isLoadingEquipments ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                              <p className="text-sm">Carregando equipamentos...</p>
                            </div>
                          ) : (
                            <>
                              {filteredEquipment.map((eq) => {
                                const category = eq.category || equipmentCategoriesState.find(c => c.id === eq.categoryId);
                                const icons: Record<string, typeof Settings> = { Wind, Building, Zap, Droplets, Shield, BedDouble, Settings };
                                let Icon: typeof Settings = Settings;
                                if (category?.icon) {
                                  if (typeof category.icon === 'string') Icon = icons[category.icon] || Settings;
                                  else Icon = category.icon as typeof Settings;
                                }
                                const isSelected = selectedEquipment === eq.id?.toString();
                                return (
                                  <div
                                    key={eq.id}
                                    onClick={() => setSelectedEquipment(eq.id?.toString())}
                                    className={cn(
                                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                      isSelected
                                        ? "bg-orange-500/5 border-orange-500/30 shadow-sm"
                                        : "bg-card border-border hover:border-orange-500/20"
                                    )}
                                  >
                                    <div className={cn("p-2.5 rounded-lg shrink-0", category?.color || "bg-muted")}>
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-sm">{eq.name}</h4>
                                      <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {eq.location || 'Sem localização'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className={cn(
                                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                      isSelected ? "border-orange-500 bg-orange-500" : "border-muted-foreground/30"
                                    )}>
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                  </div>
                                );
                              })}
                              {filteredEquipment.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  <p className="text-sm">Nenhum equipamento encontrado</p>
                                  <p className="text-xs mt-1">Tente ajustar os filtros ou busca</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-border rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <Plus className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Equipamento não encontrado?</p>
                                <p className="text-xs text-muted-foreground">Adicione um novo equipamento ao sistema</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setEquipmentModalOpen(true)}>Adicionar Novo</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 2 - Type & Priority */}
                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">Tipo de Manutenção</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {maintenanceTypes.map((type) => {
                          const isSelected = maintenanceType === type.id;
                          return (
                            <div
                              key={type.id}
                              onClick={() => setMaintenanceType(type.id)}
                              className={cn(
                                "p-5 rounded-xl border-2 cursor-pointer transition-all",
                                isSelected
                                  ? "bg-orange-500/5 border-orange-500/30 shadow-sm"
                                  : "bg-card border-border hover:border-orange-500/20"
                              )}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-lg", type.color.split(" ").slice(0, 1).join(" "))}>
                                  <type.icon className={cn("w-5 h-5", type.color.split(" ").slice(1, 2).join(" "))} />
                                </div>
                                <h4 className="font-semibold">{type.name}</h4>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 ml-auto" />}
                              </div>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">Prioridade</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {priorities.map((p) => {
                          const isSelected = priority === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setPriority(p.id)}
                              className={cn(
                                "p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                                isSelected
                                  ? "bg-orange-500/5 border-orange-500/30 shadow-sm"
                                  : "bg-card border-border hover:border-orange-500/20"
                              )}
                            >
                              <Badge variant="outline" className={cn("mb-2", p.color)}>{p.name}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 mx-auto mt-2" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">Frequência</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger className="bg-muted/30">
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {frequency !== "once" && (
                        <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-2 text-blue-500">
                            <Repeat className="w-4 h-4" />
                            <span className="text-sm font-medium">Manutenção Recorrente</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Novas ordens serão criadas automaticamente conforme a frequência definida
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3 - Scheduling */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Data Agendada</Label>
                        <div className="border rounded-xl p-4 bg-muted/20">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            locale={ptBR}
                            className="pointer-events-auto"
                          />
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Horário</Label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="text-lg bg-muted/30"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Duração Estimada: <span className="font-bold text-foreground">{estimatedDuration[0]}h</span>
                          </Label>
                          <Slider
                            value={estimatedDuration}
                            onValueChange={setEstimatedDuration}
                            max={24}
                            min={1}
                            step={1}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Prestador de Serviço</Label>
                          <Select value={supplier} onValueChange={setSupplier}>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Selecione o prestador" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map((s) => (
                                <SelectItem key={s.id} value={s.id?.toString()}>
                                  <div className="flex items-center gap-2">
                                    <span>{s.name}</span>
                                    <span className="text-xs text-muted-foreground">({s.category?.name || s.specialty || "Geral"})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">Custo Estimado (R$)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">R$</span>
                            <Input
                              type="text"
                              placeholder="0,00"
                              value={estimatedCost}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                if (!value) {
                                  setEstimatedCost("");
                                  return;
                                }
                                value = (parseInt(value) / 100).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                });
                                setEstimatedCost(value);
                              }}
                              className="pl-10 bg-muted/30"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {scheduledDate && (
                      <Card className="bg-emerald-500/10 border-emerald-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                                {format(scheduledDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                às {scheduledTime} • Duração: {estimatedDuration[0]}h
                                {selectedSupplierData ? ` • ${selectedSupplierData.name}` : ""}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* STEP 4 - Details */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Descrição do Serviço</Label>
                      <Textarea
                        placeholder="Descreva os serviços que serão realizados..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="bg-muted/30"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Observações Adicionais</Label>
                      <Textarea
                        placeholder="Adicione notas ou observações importantes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="bg-muted/30"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-3 block">Anexos</Label>
                      <div
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 mx-auto text-orange-500 animate-spin mb-3" />
                            <p className="text-sm text-muted-foreground">Enviando arquivos...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Clique para adicionar imagens
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">Imagens (máx. 10MB)</p>
                            <Button variant="outline" size="sm" type="button" onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}>
                              <Upload className="w-4 h-4 mr-2" />
                              Selecionar Arquivos
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Attachments Preview */}
                      {attachments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {attachments.map((url, index) => (
                            <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
                              <img
                                src={url.startsWith('http') ? url : `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '')}${url}`}
                                alt={`Anexo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Configurações Adicionais</h4>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Notificar Equipe</Label>
                          <p className="text-sm text-muted-foreground">Enviar notificação para a equipe responsável</p>
                        </div>
                        <Switch checked={notifyTeam} onCheckedChange={setNotifyTeam} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Reagendamento Automático</Label>
                          <p className="text-sm text-muted-foreground">Reagendar automaticamente se não concluída</p>
                        </div>
                        <Switch checked={autoReschedule} onCheckedChange={setAutoReschedule} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border">
                        <div className="space-y-0.5">
                          <Label className="font-medium">Requer Aprovação</Label>
                          <p className="text-sm text-muted-foreground">Necessita aprovação de gerente</p>
                        </div>
                        <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5 - Review */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Pronto para criar</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Revise os detalhes abaixo e confirme a criação da ordem de manutenção
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Equipamento</p>
                        <p className="font-semibold text-sm">{selectedEquipmentData?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {selectedEquipmentData?.location}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                        <Badge variant="outline" className={selectedTypeData?.color}>{selectedTypeData?.name}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Frequência: {frequencies.find(f => f.id === frequency)?.name}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
                        <Badge variant="outline" className={selectedPriorityData?.color}>{selectedPriorityData?.name}</Badge>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Data e Horário</p>
                        <p className="font-semibold text-sm">
                          {scheduledDate ? format(scheduledDate, "dd/MM/yyyy") : "-"} às {scheduledTime}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Duração: {estimatedDuration[0]}h</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Prestador</p>
                        <p className="font-semibold text-sm">{selectedSupplierData?.name || "Não definido"}</p>
                        {selectedSupplierData?.category?.name && (
                          <p className="text-xs text-muted-foreground mt-0.5">{selectedSupplierData.category.name}</p>
                        )}
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Custo Estimado</p>
                        <p className="font-semibold text-sm">
                          {estimatedCost ? `R$ ${estimatedCost}` : "Não definido"}
                        </p>
                      </div>
                    </div>

                    {description && (
                      <div className="p-4 rounded-xl bg-muted/20 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Descrição do Serviço</p>
                        <p className="text-sm">{description}</p>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/20 border border-border">
                      <p className="text-xs text-muted-foreground mb-2">Configurações</p>
                      <div className="flex flex-wrap gap-2">
                        {notifyTeam && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                            <Bell className="w-3 h-3 mr-1" /> Notificação Ativa
                          </Badge>
                        )}
                        {autoReschedule && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                            <RefreshCw className="w-3 h-3 mr-1" /> Reagendamento Auto
                          </Badge>
                        )}
                        {requireApproval && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Requer Aprovação
                          </Badge>
                        )}
                        {frequency !== "once" && (
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                            <Repeat className="w-3 h-3 mr-1" /> {frequencies.find(f => f.id === frequency)?.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step > 1 ? "Voltar" : "Cancelar"}
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Etapa {step} de {steps.length}
                </span>
                {step < 5 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {initialData ? "Atualizar" : "Criar Manutenção"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Equipment Management Modal */}
      <EquipmentModal
        open={equipmentModalOpen}
        onOpenChange={(isOpen) => {
          setEquipmentModalOpen(isOpen);
          // Reload equipment list when modal closes
          if (!isOpen && selectedProperty) {
            const fetchEquipments = async () => {
              try {
                const selectedCategoryObj = equipmentCategoriesState.find(c =>
                  String(c.id) === String(selectedCategory) || c.name === selectedCategory
                );
                const params = selectedCategoryObj ? { categoryId: Number(selectedCategoryObj.id), active: true } : { active: true };
                const response = await api.getEquipments(params);
                if (response.success && response.data?.equipments) {
                  setEquipmentList(response.data.equipments as ApiEquipment[]);
                }
              } catch (error) {
                console.error("Erro ao recarregar equipamentos:", error);
              }
            };
            fetchEquipments();
          }
        }}
      />
    </Dialog>
  );
}
