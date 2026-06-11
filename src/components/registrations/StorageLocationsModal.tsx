import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Warehouse,
  MapPin,
  Building2,
  Thermometer,
  Lock,
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  Check,
  CheckCircle2,
  Layers,
  Box,
  DoorOpen,
  AlertTriangle,
  LayoutGrid,
  Settings2,
  Sparkles,
  Shield,
  ClipboardCheck,
  Snowflake,
  Flame,
  Eye,
  Users,
  Archive,
  Clock,
  UserPlus,
  Grid3X3,
  MapPinned,
  Calendar,
  UserCheck,
  Target,
  Ruler,
  LayoutPanelTop,
  CircleDot,
  ArrowLeftRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface StorageLocationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StorageLocation {
  id: string;
  name: string;
  code: string;
  propertyId: string;
  propertyName: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  temperature?: string;
  isRestricted: boolean;
  isActive: boolean;
  description?: string;
  zonesCount?: number;
  managersCount?: number;
}

interface Zone {
  id: string;
  code: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  temperatureControl?: string;
  positionsCount: number;
}

interface Position {
  id: string;
  address: string;
  row: string;
  column: string;
  level: string;
  type: string;
  status: "available" | "occupied" | "reserved" | "blocked";
  productName?: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: "manager" | "supervisor" | "operator" | "viewer";
  canReceive: boolean;
  canTransfer: boolean;
  canAdjust: boolean;
  canApprove: boolean;
}

interface Schedule {
  dayOfWeek: number;
  dayName: string;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

function mapApiLocationToStorageLocation(row: Record<string, unknown>): StorageLocation {
  const id = String(row.id ?? row.uuid ?? "");
  const propertyId = String(row.propertyId ?? "");
  const capacity = Number(row.capacity ?? 0);
  const currentOccupancy = Number(row.currentOccupancy ?? 0);
  let temperature: string | undefined;
  const tc = row.temperatureControl as string;
  if (tc === "refrigerated") temperature = "2-8°C";
  else if (tc === "frozen") temperature = "-18°C";
  else if (tc === "ultra_frozen") temperature = "-25°C";
  else if (tc === "heated") temperature = "30-40°C";
  return {
    id,
    name: String(row.name ?? ""),
    code: String(row.code ?? ""),
    propertyId,
    propertyName: String(row.propertyName ?? ""),
    type: String(row.type ?? "almoxarifado"),
    capacity,
    currentOccupancy,
    temperature,
    isRestricted: Boolean(row.isRestricted),
    isActive: (row.status as string) === "active",
    description: row.description != null ? String(row.description) : undefined,
    zonesCount: undefined,
    managersCount: undefined,
  };
}

const mockUsers = [
  { id: "1", name: "Carlos Silva", email: "carlos@hotel.com", role: "Gerente de Estoque" },
  { id: "2", name: "Maria Santos", email: "maria@hotel.com", role: "Supervisora" },
  { id: "3", name: "João Oliveira", email: "joao@hotel.com", role: "Operador" },
  { id: "4", name: "Ana Costa", email: "ana@hotel.com", role: "Almoxarife" },
  { id: "5", name: "Pedro Lima", email: "pedro@hotel.com", role: "Auxiliar" },
];

const mockZones: Zone[] = [
  { id: "1", code: "A", name: "Setor A - Materiais Gerais", capacity: 150, currentOccupancy: 98, positionsCount: 30 },
  { id: "2", code: "B", name: "Setor B - Produtos de Limpeza", capacity: 100, currentOccupancy: 72, positionsCount: 20 },
  { id: "3", code: "C", name: "Setor C - Enxoval", capacity: 200, currentOccupancy: 120, positionsCount: 40 },
  { id: "4", code: "D", name: "Setor D - Descartáveis", capacity: 50, currentOccupancy: 30, positionsCount: 10 },
];

const mockPositions: Position[] = [
  { id: "1", address: "A1-01-01", row: "1", column: "01", level: "01", type: "shelf", status: "occupied", productName: "Papel Higiênico" },
  { id: "2", address: "A1-01-02", row: "1", column: "01", level: "02", type: "shelf", status: "occupied", productName: "Papel Toalha" },
  { id: "3", address: "A1-02-01", row: "1", column: "02", level: "01", type: "shelf", status: "available" },
  { id: "4", address: "A1-02-02", row: "1", column: "02", level: "02", type: "shelf", status: "reserved" },
  { id: "5", address: "A2-01-01", row: "2", column: "01", level: "01", type: "pallet", status: "occupied", productName: "Água Mineral" },
  { id: "6", address: "A2-01-02", row: "2", column: "01", level: "02", type: "pallet", status: "blocked" },
];

const mockManagers: Manager[] = [
  { id: "1", name: "Carlos Silva", email: "carlos@hotel.com", role: "manager", canReceive: true, canTransfer: true, canAdjust: true, canApprove: true },
  { id: "2", name: "Maria Santos", email: "maria@hotel.com", role: "supervisor", canReceive: true, canTransfer: true, canAdjust: true, canApprove: false },
];

const locationTypes = [
  { id: "almoxarifado", label: "Almoxarifado", description: "Estoque geral de materiais", icon: Warehouse, color: "from-blue-500 to-cyan-500", bgImage: "📦" },
  { id: "deposito", label: "Depósito", description: "Armazenagem de produtos", icon: Box, color: "from-emerald-500 to-green-500", bgImage: "🏭" },
  { id: "refrigerado", label: "Refrigerado", description: "Ambiente com controle térmico", icon: Snowflake, color: "from-cyan-500 to-sky-500", bgImage: "❄️" },
  { id: "governanca", label: "Governança", description: "Materiais de limpeza e enxoval", icon: DoorOpen, color: "from-violet-500 to-purple-500", bgImage: "🧹" },
  { id: "manutencao", label: "Manutenção", description: "Ferramentas e equipamentos", icon: Settings2, color: "from-orange-500 to-amber-500", bgImage: "🔧" },
  { id: "cofre", label: "Cofre/Seguro", description: "Itens de alto valor", icon: Lock, color: "from-rose-500 to-red-500", bgImage: "🔐" },
];

const temperatureOptions = [
  { id: "ambient", label: "Ambiente", range: "15-25°C", icon: Flame, color: "text-orange-500" },
  { id: "refrigerado", label: "Refrigerado", range: "2-8°C", icon: Thermometer, color: "text-blue-500" },
  { id: "congelado", label: "Congelado", range: "-18°C", icon: Snowflake, color: "text-cyan-500" },
  { id: "ultra", label: "Ultra Congelado", range: "-25°C", icon: Snowflake, color: "text-sky-500" },
];

const managerRoles = [
  { id: "manager", label: "Gerente", description: "Acesso total", color: "bg-rose-500" },
  { id: "supervisor", label: "Supervisor", description: "Gerencia operações", color: "bg-amber-500" },
  { id: "operator", label: "Operador", description: "Executa movimentações", color: "bg-blue-500" },
  { id: "viewer", label: "Visualizador", description: "Apenas consulta", color: "bg-gray-500" },
];

const positionTypes = [
  { id: "shelf", label: "Prateleira", icon: LayoutPanelTop },
  { id: "pallet", label: "Palete", icon: Grid3X3 },
  { id: "bin", label: "Caixa/Bin", icon: Box },
  { id: "drawer", label: "Gaveta", icon: Archive },
  { id: "floor", label: "Chão", icon: Target },
];

const weekDays = [
  { day: 0, name: "Domingo" },
  { day: 1, name: "Segunda-feira" },
  { day: 2, name: "Terça-feira" },
  { day: 3, name: "Quarta-feira" },
  { day: 4, name: "Quinta-feira" },
  { day: 5, name: "Sexta-feira" },
  { day: 6, name: "Sábado" },
];

const wizardSteps = [
  { id: "property", title: "Propriedade", description: "Selecione a unidade", icon: Building2 },
  { id: "type", title: "Tipo", description: "Categoria do local", icon: Layers },
  { id: "info", title: "Informações", description: "Dados básicos", icon: Warehouse },
  { id: "config", title: "Configuração", description: "Regras e controles", icon: Settings2 },
  { id: "managers", title: "Responsáveis", description: "Usuários e permissões", icon: Users },
  { id: "zones", title: "Zonas", description: "Setores e endereços", icon: Grid3X3 },
  { id: "schedule", title: "Horários", description: "Funcionamento", icon: Clock },
  { id: "confirm", title: "Confirmar", description: "Revisar dados", icon: CheckCircle2 },
];

interface PropertyOption {
  id: string;
  name: string;
  code?: string;
  address?: string;
}

export function StorageLocationsModal({ open, onOpenChange }: StorageLocationsModalProps) {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState("info");
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; code: string; description: string; capacity: string; type: string; status: string }>({
    name: "", code: "", description: "", capacity: "", type: "almoxarifado", status: "active",
  });

  const [formData, setFormData] = useState({
    propertyId: "",
    name: "",
    code: "",
    type: "",
    description: "",
    capacity: "",
    temperature: "ambient",
    temperatureMin: "",
    temperatureMax: "",
    isRestricted: false,
    requiresApproval: false,
    requiresCount: false,
    countFrequencyDays: "30",
    allowNegative: false,
    fifoRequired: true,
    isActive: true,
  });

  const [managers, setManagers] = useState<Manager[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>(
    weekDays.map(d => ({
      dayOfWeek: d.day,
      dayName: d.name,
      opensAt: "08:00",
      closesAt: "18:00",
      isClosed: d.day === 0,
    }))
  );

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      Promise.all([
        api.getStorageLocations(),
        api.getInventoryItems({}).catch(() => ({ success: true, data: { items: [] } })),
      ]).then(([res, itemsRes]) => {
        const raw = res.data;
        const officialData = (Array.isArray(raw)
          ? raw
          : ((raw as { locations?: unknown[] } | undefined)?.locations ?? [])) as Record<string, unknown>[];
        const officialLocations = officialData.map(mapApiLocationToStorageLocation);

        // Fallback: locais legados usados nos itens de estoque (quando ainda não existem em storage_locations).
        const inventoryItems = (((itemsRes.data as { items?: unknown[] } | undefined)?.items) ?? []) as Array<Record<string, unknown>>;
        const inferredMap = new Map<string, StorageLocation>();
        for (const item of inventoryItems) {
          const locationName = String(item.location ?? "").trim();
          const propertyId = String(item.propertyId ?? "");
          const propertyName = String(item.propertyName ?? "");
          if (!locationName || !propertyId) continue;
          const key = `${propertyId}::${locationName.toLowerCase()}`;
          if (inferredMap.has(key)) continue;
          inferredMap.set(key, {
            id: `legacy:${key}`,
            name: locationName,
            code: "LEGADO",
            propertyId,
            propertyName,
            type: "almoxarifado",
            capacity: 0,
            currentOccupancy: 0,
            isRestricted: false,
            isActive: true,
            description: "Local inferido do estoque existente",
          });
        }

        const merged = [...officialLocations];
        for (const inferred of inferredMap.values()) {
          const exists = merged.some(
            (loc) =>
              loc.propertyId === inferred.propertyId &&
              loc.name.trim().toLowerCase() === inferred.name.trim().toLowerCase()
          );
          if (!exists) merged.push(inferred);
        }
        setLocations(merged);
      }).catch(() => {
        setLocations([]);
        toast.error("Erro ao carregar locais de armazenamento.");
      }),
      api.getProperties().then((res) => {
        const data = res.data as { properties?: Array<{ id: number; name: string; code?: string; address?: string }> };
        const list = Array.isArray(data?.properties) ? data.properties : [];
        setProperties(list.map((p) => ({ id: String(p.id), name: p.name, code: p.code, address: p.address })));
      }).catch(() => setProperties([])),
    ]).finally(() => setLoading(false));
  }, [open]);

  // New manager form
  const [newManager, setNewManager] = useState({
    userId: "",
    role: "operator" as Manager["role"],
    canReceive: true,
    canTransfer: true,
    canAdjust: false,
    canApprove: false,
  });

  // New zone form
  const [newZone, setNewZone] = useState({
    code: "",
    name: "",
    capacity: "",
    rows: "1",
    columns: "1",
    levels: "1",
    temperatureControl: "",
  });

  const progressPercent = ((currentStep + 1) / wizardSteps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === wizardSteps.length - 1;

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty = filterProperty === "all" || loc.propertyId === filterProperty;
    return matchesSearch && matchesProperty;
  });

  const groupedLocations = filteredLocations.reduce((acc, loc) => {
    if (!acc[loc.propertyId]) {
      acc[loc.propertyId] = { propertyName: loc.propertyName, locations: [] };
    }
    acc[loc.propertyId].locations.push(loc);
    return acc;
  }, {} as Record<string, { propertyName: string; locations: StorageLocation[] }>);

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const temperatureToControl = (t: string): string => {
    if (t === "refrigerado") return "refrigerated";
    if (t === "congelado") return "frozen";
    if (t === "ultra") return "ultra_frozen";
    if (t === "ambient") return "ambient";
    return "ambient";
  };

  const handleSubmit = async () => {
    const propertyId = formData.propertyId ? parseInt(formData.propertyId, 10) : 0;
    if (!propertyId || !formData.name?.trim()) {
      toast.error("Selecione a propriedade e preencha o nome do local.");
      return;
    }
    setSaving(true);
    try {
      await api.createStorageLocation({
        propertyId,
        code: formData.code?.trim() || undefined,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        type: formData.type || "almoxarifado",
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        temperatureControl: temperatureToControl(formData.temperature),
        temperatureMin: formData.temperatureMin ? parseFloat(formData.temperatureMin) : null,
        temperatureMax: formData.temperatureMax ? parseFloat(formData.temperatureMax) : null,
        isRestricted: formData.isRestricted,
        requiresApproval: formData.requiresApproval,
        requiresCount: formData.requiresCount,
        countFrequencyDays: formData.countFrequencyDays ? parseInt(formData.countFrequencyDays, 10) : null,
        allowNegativeStock: formData.allowNegative,
        fifoRequired: formData.fifoRequired,
        status: formData.isActive ? "active" : "inactive",
        isDefault: false,
      });
      toast.success("Local de armazenamento criado com sucesso.");
      const res = await api.getStorageLocations();
      const data = (res.data ?? []) as Record<string, unknown>[];
      setLocations(data.map(mapApiLocationToStorageLocation));
      resetForm();
      setView("list");
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "Erro ao criar local.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      propertyId: "",
      name: "",
      code: "",
      type: "",
      description: "",
      capacity: "",
      temperature: "ambient",
      temperatureMin: "",
      temperatureMax: "",
      isRestricted: false,
      requiresApproval: false,
      requiresCount: false,
      countFrequencyDays: "30",
      allowNegative: false,
      fifoRequired: true,
      isActive: true,
    });
    setManagers([]);
    setZones([]);
    setSchedules(weekDays.map(d => ({
      dayOfWeek: d.day,
      dayName: d.name,
      opensAt: "08:00",
      closesAt: "18:00",
      isClosed: d.day === 0,
    })));
  };

  const handleClose = () => {
    onOpenChange(false);
    setView("list");
    resetForm();
  };

  const handleEditLocation = (location: StorageLocation) => {
    setSelectedLocation(location);
    setEditFormData({
      name: location.name,
      code: location.code,
      description: location.description ?? "",
      capacity: String(location.capacity ?? ""),
      type: location.type,
      status: location.isActive ? "active" : "inactive",
    });
    setEditTab("info");
    setView("edit");
  };

  const handleSaveEdit = async () => {
    if (!selectedLocation) return;
    setSaving(true);
    try {
      await api.updateStorageLocation(Number(selectedLocation.id), {
        name: editFormData.name,
        code: editFormData.code,
        description: editFormData.description || null,
        capacity: editFormData.capacity ? parseInt(editFormData.capacity, 10) : null,
        type: editFormData.type,
        status: editFormData.status,
      });
      toast.success("Local atualizado com sucesso.");
      const res = await api.getStorageLocations();
      const data = (res.data ?? []) as Record<string, unknown>[];
      setLocations(data.map(mapApiLocationToStorageLocation));
      const updated = data.find((r) => String(r.id) === selectedLocation.id);
      if (updated) setSelectedLocation(mapApiLocationToStorageLocation(updated));
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "Erro ao atualizar local.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAddManager = () => {
    const user = mockUsers.find(u => u.id === newManager.userId);
    if (!user) return;

    const manager: Manager = {
      id: `m-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: newManager.role,
      canReceive: newManager.canReceive,
      canTransfer: newManager.canTransfer,
      canAdjust: newManager.canAdjust,
      canApprove: newManager.canApprove,
    };

    setManagers([...managers, manager]);
    setNewManager({
      userId: "",
      role: "operator",
      canReceive: true,
      canTransfer: true,
      canAdjust: false,
      canApprove: false,
    });
    toast.success(`${user.name} adicionado como responsável`);
  };

  const handleRemoveManager = (id: string) => {
    setManagers(managers.filter(m => m.id !== id));
  };

  const handleAddZone = () => {
    if (!newZone.code || !newZone.name) return;

    const zone: Zone = {
      id: `z-${Date.now()}`,
      code: newZone.code,
      name: newZone.name,
      capacity: parseInt(newZone.capacity) || 0,
      currentOccupancy: 0,
      temperatureControl: newZone.temperatureControl || undefined,
      positionsCount: parseInt(newZone.rows) * parseInt(newZone.columns) * parseInt(newZone.levels),
    };

    setZones([...zones, zone]);
    setNewZone({
      code: "",
      name: "",
      capacity: "",
      rows: "1",
      columns: "1",
      levels: "1",
      temperatureControl: "",
    });
    toast.success(`Zona ${zone.code} criada com ${zone.positionsCount} posições`);
  };

  const handleRemoveZone = (id: string) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const selectedProperty = properties.find(p => p.id === formData.propertyId);
  const selectedType = locationTypes.find(t => t.id === formData.type);
  const selectedTemp = temperatureOptions.find(t => t.id === formData.temperature);

  const canProceed = () => {
    switch (wizardSteps[currentStep].id) {
      case "property": return !!formData.propertyId;
      case "type": return !!formData.type;
      case "info": return !!formData.name && !!formData.code;
      default: return true;
    }
  };

  const getRoleInfo = (role: Manager["role"]) => managerRoles.find(r => r.id === role);

  const getPositionStatusColor = (status: Position["status"]) => {
    switch (status) {
      case "available": return "bg-emerald-500";
      case "occupied": return "bg-blue-500";
      case "reserved": return "bg-amber-500";
      case "blocked": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const renderStepContent = () => {
    switch (wizardSteps[currentStep].id) {
      case "property":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Selecione a Propriedade</h2>
              <p className="text-muted-foreground">O local de armazenamento será vinculado a esta unidade</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => setFormData({ ...formData, propertyId: property.id })}
                  className={cn(
                    "p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg group",
                    formData.propertyId === property.id
                      ? "border-teal-500 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 shadow-lg"
                      : "border-border hover:border-teal-500/50 bg-card"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      formData.propertyId === property.id 
                        ? "bg-gradient-to-br from-teal-500 to-cyan-500" 
                        : "bg-muted group-hover:bg-teal-500/20"
                    )}>
                      <Building2 className={cn(
                        "h-6 w-6",
                        formData.propertyId === property.id ? "text-white" : "text-muted-foreground group-hover:text-teal-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{property.name}</p>
                      {property.address && <p className="text-sm text-muted-foreground mt-1">{property.address}</p>}
                      {property.code && <Badge variant="outline" className="mt-2">{property.code}</Badge>}
                    </div>
                    {formData.propertyId === property.id && (
                      <CheckCircle2 className="h-6 w-6 text-teal-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "type":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Layers className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tipo de Local</h2>
              <p className="text-muted-foreground">Selecione a categoria que melhor descreve este espaço</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {locationTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all hover:shadow-lg group overflow-hidden",
                      isSelected
                        ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    <div className="absolute top-2 right-2 text-4xl opacity-20">
                      {type.bgImage}
                    </div>
                    
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-md`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    <p className="font-semibold text-lg mb-1">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                    
                    {isSelected && (
                      <div className="absolute top-3 left-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "info":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Warehouse className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Informações do Local</h2>
              <p className="text-muted-foreground">Preencha os dados básicos de identificação</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome do Local *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Almoxarifado Central"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Código *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: ALM-001"
                    className="h-12 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capacidade (itens)</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Ex: 500"
                    className="h-12"
                  />
                </div>
                
                {(formData.type === "refrigerado" || formData.type === "cofre") && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Controle de Temperatura</Label>
                    <Select value={formData.temperature} onValueChange={(v) => setFormData({ ...formData, temperature: v })}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {temperatureOptions.map((temp) => (
                          <SelectItem key={temp.id} value={temp.id}>
                            <div className="flex items-center gap-2">
                              <temp.icon className={cn("h-4 w-4", temp.color)} />
                              <span>{temp.label}</span>
                              <span className="text-muted-foreground">({temp.range})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {(formData.type === "refrigerado") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Temperatura Mínima (°C)</Label>
                    <Input
                      type="number"
                      value={formData.temperatureMin}
                      onChange={(e) => setFormData({ ...formData, temperatureMin: e.target.value })}
                      placeholder="Ex: 2"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Temperatura Máxima (°C)</Label>
                    <Input
                      type="number"
                      value={formData.temperatureMax}
                      onChange={(e) => setFormData({ ...formData, temperatureMax: e.target.value })}
                      placeholder="Ex: 8"
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do local, finalidade e observações importantes..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Preview Card */}
              {formData.name && (
                <div className="p-4 rounded-xl border-2 border-dashed border-teal-500/30 bg-teal-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-teal-500" />
                    <span className="text-sm font-medium text-teal-600">Prévia do Local</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedType.color}`}>
                        <selectedType.icon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{formData.name}</p>
                      <p className="text-sm text-muted-foreground">{formData.code || "---"} • {selectedProperty?.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "config":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Settings2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Configurações e Controles</h2>
              <p className="text-muted-foreground">Defina as regras operacionais do local</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {/* Security Section */}
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-500">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Segurança e Acesso</h3>
                    <p className="text-sm text-muted-foreground">Controle de permissões do local</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">Acesso Restrito</Label>
                        <p className="text-xs text-muted-foreground">Apenas usuários autorizados</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.isRestricted}
                      onCheckedChange={(v) => setFormData({ ...formData, isRestricted: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">Requer Aprovação</Label>
                        <p className="text-xs text-muted-foreground">Movimentações precisam de gestor</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.requiresApproval}
                      onCheckedChange={(v) => setFormData({ ...formData, requiresApproval: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Operations Section */}
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Operações de Estoque</h3>
                    <p className="text-sm text-muted-foreground">Regras de movimentação</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Archive className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">Inventário Periódico</Label>
                        <p className="text-xs text-muted-foreground">Exigir contagem regular</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {formData.requiresCount && (
                        <Select 
                          value={formData.countFrequencyDays} 
                          onValueChange={(v) => setFormData({ ...formData, countFrequencyDays: v })}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 dias</SelectItem>
                            <SelectItem value="15">15 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="60">60 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Switch
                        checked={formData.requiresCount}
                        onCheckedChange={(v) => setFormData({ ...formData, requiresCount: v })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">Saída FIFO Obrigatória</Label>
                        <p className="text-xs text-muted-foreground">Primeiro que entra, primeiro que sai</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.fifoRequired}
                      onCheckedChange={(v) => setFormData({ ...formData, fifoRequired: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="font-medium">Permitir Estoque Negativo</Label>
                        <p className="text-xs text-muted-foreground">Permitir saídas sem saldo</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.allowNegative}
                      onCheckedChange={(v) => setFormData({ ...formData, allowNegative: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Status do Local</h3>
                    <p className="text-sm text-muted-foreground">Disponibilidade operacional</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">Local Ativo</Label>
                      <p className="text-xs text-muted-foreground">Disponível para movimentações</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "managers":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Responsáveis e Permissões</h2>
              <p className="text-muted-foreground">Defina quem pode acessar e operar este local</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Add Manager Form */}
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Adicionar Responsável</h3>
                    <p className="text-sm text-muted-foreground">Selecione um usuário e defina suas permissões</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Usuário</Label>
                    <Select value={newManager.userId} onValueChange={(v) => setNewManager({ ...newManager, userId: v })}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockUsers.filter(u => !managers.find(m => m.email === u.email)).map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                {user.name.charAt(0)}
                              </div>
                              <span>{user.name}</span>
                              <span className="text-muted-foreground text-xs">({user.role})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Função</Label>
                    <Select value={newManager.role} onValueChange={(v) => setNewManager({ ...newManager, role: v as Manager["role"] })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {managerRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", role.color)} />
                              <span>{role.label}</span>
                              <span className="text-muted-foreground text-xs">- {role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Switch
                      id="canReceive"
                      checked={newManager.canReceive}
                      onCheckedChange={(v) => setNewManager({ ...newManager, canReceive: v })}
                    />
                    <Label htmlFor="canReceive" className="text-sm cursor-pointer">Receber</Label>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Switch
                      id="canTransfer"
                      checked={newManager.canTransfer}
                      onCheckedChange={(v) => setNewManager({ ...newManager, canTransfer: v })}
                    />
                    <Label htmlFor="canTransfer" className="text-sm cursor-pointer">Transferir</Label>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Switch
                      id="canAdjust"
                      checked={newManager.canAdjust}
                      onCheckedChange={(v) => setNewManager({ ...newManager, canAdjust: v })}
                    />
                    <Label htmlFor="canAdjust" className="text-sm cursor-pointer">Ajustar</Label>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Switch
                      id="canApprove"
                      checked={newManager.canApprove}
                      onCheckedChange={(v) => setNewManager({ ...newManager, canApprove: v })}
                    />
                    <Label htmlFor="canApprove" className="text-sm cursor-pointer">Aprovar</Label>
                  </div>
                </div>

                <Button 
                  onClick={handleAddManager}
                  disabled={!newManager.userId}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Responsável
                </Button>
              </div>

              {/* Managers List */}
              {managers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Responsáveis Adicionados ({managers.length})
                  </h4>
                  <div className="grid gap-3">
                    {managers.map((manager) => {
                      const roleInfo = getRoleInfo(manager.role);
                      return (
                        <div key={manager.id} className="p-4 rounded-xl border bg-card flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {manager.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{manager.name}</p>
                              <p className="text-sm text-muted-foreground">{manager.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={cn("text-white", roleInfo?.color)}>
                              {roleInfo?.label}
                            </Badge>
                            <div className="flex gap-1">
                              {manager.canReceive && <Badge variant="outline" className="text-xs">Receber</Badge>}
                              {manager.canTransfer && <Badge variant="outline" className="text-xs">Transferir</Badge>}
                              {manager.canAdjust && <Badge variant="outline" className="text-xs">Ajustar</Badge>}
                              {manager.canApprove && <Badge variant="outline" className="text-xs">Aprovar</Badge>}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveManager(manager.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {managers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum responsável adicionado ainda</p>
                  <p className="text-sm">Este passo é opcional, você pode adicionar depois</p>
                </div>
              )}
            </div>
          </div>
        );

      case "zones":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Grid3X3 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Zonas e Endereçamento</h2>
              <p className="text-muted-foreground">Configure setores e posições de armazenamento</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Add Zone Form */}
              <div className="p-5 rounded-2xl border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                    <LayoutGrid className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nova Zona</h3>
                    <p className="text-sm text-muted-foreground">Defina um setor dentro do local de armazenamento</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Código da Zona *</Label>
                    <Input
                      value={newZone.code}
                      onChange={(e) => setNewZone({ ...newZone, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: A, B, C"
                      className="h-11 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nome da Zona *</Label>
                    <Input
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      placeholder="Ex: Setor A - Materiais Gerais"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Capacidade</Label>
                    <Input
                      type="number"
                      value={newZone.capacity}
                      onChange={(e) => setNewZone({ ...newZone, capacity: e.target.value })}
                      placeholder="100"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fileiras</Label>
                    <Input
                      type="number"
                      value={newZone.rows}
                      onChange={(e) => setNewZone({ ...newZone, rows: e.target.value })}
                      placeholder="1"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Colunas</Label>
                    <Input
                      type="number"
                      value={newZone.columns}
                      onChange={(e) => setNewZone({ ...newZone, columns: e.target.value })}
                      placeholder="1"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Níveis</Label>
                    <Input
                      type="number"
                      value={newZone.levels}
                      onChange={(e) => setNewZone({ ...newZone, levels: e.target.value })}
                      placeholder="1"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Position Preview */}
                <div className="p-4 rounded-xl bg-muted/50 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Posições que serão criadas:</span>
                    <Badge variant="secondary" className="font-mono">
                      {parseInt(newZone.rows || "1") * parseInt(newZone.columns || "1") * parseInt(newZone.levels || "1")} posições
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {newZone.rows || "1"} fileira(s) × {newZone.columns || "1"} coluna(s) × {newZone.levels || "1"} nível(is)
                  </p>
                </div>

                <Button 
                  onClick={handleAddZone}
                  disabled={!newZone.code || !newZone.name}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Zona
                </Button>
              </div>

              {/* Zones List */}
              {zones.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPinned className="h-4 w-4" />
                    Zonas Configuradas ({zones.length})
                  </h4>
                  <div className="grid gap-3">
                    {zones.map((zone) => (
                      <div key={zone.id} className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                              {zone.code}
                            </div>
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {zone.positionsCount} posições • Capacidade: {zone.capacity || "∞"} itens
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveZone(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Grid3X3 className="h-3 w-3 mr-1" />
                            {zone.positionsCount} posições
                          </Badge>
                          {zone.temperatureControl && (
                            <Badge variant="outline" className="text-xs">
                              <Thermometer className="h-3 w-3 mr-1" />
                              {zone.temperatureControl}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {zones.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Grid3X3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma zona configurada ainda</p>
                  <p className="text-sm">Este passo é opcional, você pode adicionar depois</p>
                </div>
              )}
            </div>
          </div>
        );

      case "schedule":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Horários de Funcionamento</h2>
              <p className="text-muted-foreground">Configure quando este local estará disponível</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {schedules.map((schedule, index) => (
                <div 
                  key={schedule.dayOfWeek} 
                  className={cn(
                    "p-4 rounded-xl border bg-card transition-all",
                    schedule.isClosed && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-medium",
                        schedule.isClosed 
                          ? "bg-muted text-muted-foreground" 
                          : "bg-gradient-to-br from-sky-500 to-blue-500 text-white"
                      )}>
                        {schedule.dayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{schedule.dayName}</p>
                        {!schedule.isClosed && (
                          <p className="text-sm text-muted-foreground">
                            {schedule.opensAt} - {schedule.closesAt}
                          </p>
                        )}
                        {schedule.isClosed && (
                          <p className="text-sm text-muted-foreground">Fechado</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {!schedule.isClosed && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Abre:</Label>
                            <Input
                              type="time"
                              value={schedule.opensAt}
                              onChange={(e) => {
                                const newSchedules = [...schedules];
                                newSchedules[index].opensAt = e.target.value;
                                setSchedules(newSchedules);
                              }}
                              className="w-28 h-9"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Fecha:</Label>
                            <Input
                              type="time"
                              value={schedule.closesAt}
                              onChange={(e) => {
                                const newSchedules = [...schedules];
                                newSchedules[index].closesAt = e.target.value;
                                setSchedules(newSchedules);
                              }}
                              className="w-28 h-9"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-2 ml-4">
                        <Label className="text-sm">Fechado</Label>
                        <Switch
                          checked={schedule.isClosed}
                          onCheckedChange={(v) => {
                            const newSchedules = [...schedules];
                            newSchedules[index].isClosed = v;
                            setSchedules(newSchedules);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSchedules(schedules.map(s => ({
                      ...s,
                      isClosed: s.dayOfWeek === 0 || s.dayOfWeek === 6,
                    })));
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Seg-Sex (Comercial)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSchedules(schedules.map(s => ({
                      ...s,
                      isClosed: false,
                      opensAt: "00:00",
                      closesAt: "23:59",
                    })));
                  }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  24h Todos os Dias
                </Button>
              </div>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Revisar e Confirmar</h2>
              <p className="text-muted-foreground">Verifique todos os dados antes de criar o local</p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Summary Card */}
              <div className="p-6 rounded-2xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  {selectedType && (
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedType.color} shadow-lg`}>
                      <selectedType.icon className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">{formData.name || "Novo Local"}</h3>
                    <p className="text-muted-foreground">{formData.code}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{selectedType?.label}</Badge>
                      <Badge variant={formData.isActive ? "default" : "secondary"}>
                        {formData.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-muted-foreground">Propriedade</span>
                    </div>
                    <p className="font-medium text-sm">{selectedProperty?.name || "-"}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-muted-foreground">Capacidade</span>
                    </div>
                    <p className="font-medium text-sm">{formData.capacity || "Ilimitada"} itens</p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-muted-foreground">Responsáveis</span>
                    </div>
                    <p className="font-medium text-sm">{managers.length} usuários</p>
                  </div>

                  <div className="p-4 rounded-xl bg-background border">
                    <div className="flex items-center gap-2 mb-2">
                      <Grid3X3 className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-muted-foreground">Zonas</span>
                    </div>
                    <p className="font-medium text-sm">{zones.length} zonas</p>
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-rose-500" />
                    Segurança
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Acesso Restrito</span>
                      <Badge variant={formData.isRestricted ? "default" : "secondary"}>
                        {formData.isRestricted ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Requer Aprovação</span>
                      <Badge variant={formData.requiresApproval ? "default" : "secondary"}>
                        {formData.requiresApproval ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Operações
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Inventário Periódico</span>
                      <Badge variant={formData.requiresCount ? "default" : "secondary"}>
                        {formData.requiresCount ? `A cada ${formData.countFrequencyDays} dias` : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">FIFO Obrigatório</span>
                      <Badge variant={formData.fifoRequired ? "default" : "secondary"}>
                        {formData.fifoRequired ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Managers & Zones Preview */}
              {(managers.length > 0 || zones.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {managers.length > 0 && (
                    <div className="p-4 rounded-xl border bg-card">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        Responsáveis
                      </h4>
                      <div className="space-y-2">
                        {managers.slice(0, 3).map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">
                              {m.name.charAt(0)}
                            </div>
                            <span>{m.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{getRoleInfo(m.role)?.label}</Badge>
                          </div>
                        ))}
                        {managers.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{managers.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  )}

                  {zones.length > 0 && (
                    <div className="p-4 rounded-xl border bg-card">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4 text-amber-500" />
                        Zonas
                      </h4>
                      <div className="space-y-2">
                        {zones.slice(0, 3).map((z) => (
                          <div key={z.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                              {z.code}
                            </div>
                            <span className="truncate">{z.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{z.positionsCount} pos.</Badge>
                          </div>
                        ))}
                        {zones.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{zones.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Success Message */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-emerald-700">Pronto para criar!</p>
                  <p className="text-sm text-emerald-600">Todos os dados foram preenchidos corretamente</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Edit View with Tabs
  const renderEditView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative px-6 py-5 border-b bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView("list")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {selectedLocation && (() => {
                const typeInfo = locationTypes.find(t => t.id === selectedLocation.type);
                const TypeIcon = typeInfo?.icon || Warehouse;
                return (
                  <div className={`p-3 rounded-2xl shadow-lg bg-gradient-to-br ${typeInfo?.color || "from-gray-500 to-gray-600"}`}>
                    <TypeIcon className="h-6 w-6 text-white" />
                  </div>
                );
              })()}
              <div>
                <h2 className="text-xl font-bold">{selectedLocation?.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedLocation?.code} • {selectedLocation?.propertyName}</p>
              </div>
            </div>
          </div>
          <Badge variant={selectedLocation?.isActive ? "default" : "secondary"}>
            {selectedLocation?.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={editTab} onValueChange={setEditTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-4 border-b flex-shrink-0">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="info" className="gap-2">
              <Warehouse className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="zones" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Zonas ({mockZones.length})
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <MapPinned className="h-4 w-4" />
              Posições ({mockPositions.length})
            </TabsTrigger>
            <TabsTrigger value="managers" className="gap-2">
              <Users className="h-4 w-4" />
              Responsáveis ({mockManagers.length})
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Clock className="h-4 w-4" />
              Horários
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="info" className="p-6 m-0">
            <div className="max-w-2xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Local</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                    className="h-11 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacidade</Label>
                  <Input
                    type="number"
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editFormData.type} onValueChange={(v) => setEditFormData({ ...editFormData, type: v })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Descrição do local..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editFormData.status} onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="zones" className="p-6 m-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Zonas de Armazenamento</h3>
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Zona
                </Button>
              </div>
              <div className="grid gap-3">
                {mockZones.map((zone) => (
                  <div key={zone.id} className="p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                          {zone.code}
                        </div>
                        <div>
                          <p className="font-medium">{zone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {zone.positionsCount} posições • {zone.currentOccupancy}/{zone.capacity} itens
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(zone.currentOccupancy / zone.capacity) * 100} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {Math.round((zone.currentOccupancy / zone.capacity) * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="positions" className="p-6 m-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Mapa de Posições</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <CircleDot className="h-3 w-3 text-emerald-500" /> Disponível
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CircleDot className="h-3 w-3 text-blue-500" /> Ocupada
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CircleDot className="h-3 w-3 text-amber-500" /> Reservada
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CircleDot className="h-3 w-3 text-red-500" /> Bloqueada
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {mockPositions.map((position) => (
                  <div 
                    key={position.id} 
                    className={cn(
                      "p-3 rounded-lg border-2 text-center cursor-pointer transition-all hover:shadow-md",
                      position.status === "available" && "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                      position.status === "occupied" && "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
                      position.status === "reserved" && "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
                      position.status === "blocked" && "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full mx-auto mb-2", getPositionStatusColor(position.status))} />
                    <p className="font-mono text-sm font-medium">{position.address}</p>
                    {position.productName && (
                      <p className="text-xs text-muted-foreground truncate">{position.productName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="managers" className="p-6 m-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Responsáveis do Local</h3>
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="grid gap-3">
                {mockManagers.map((manager) => {
                  const roleInfo = getRoleInfo(manager.role);
                  return (
                    <div key={manager.id} className="p-4 rounded-xl border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                          {manager.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{manager.name}</p>
                          <p className="text-sm text-muted-foreground">{manager.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-white", roleInfo?.color)}>
                          {roleInfo?.label}
                        </Badge>
                        <div className="flex gap-1">
                          {manager.canReceive && <Badge variant="outline" className="text-xs">Receber</Badge>}
                          {manager.canTransfer && <Badge variant="outline" className="text-xs">Transferir</Badge>}
                          {manager.canAdjust && <Badge variant="outline" className="text-xs">Ajustar</Badge>}
                          {manager.canApprove && <Badge variant="outline" className="text-xs">Aprovar</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="p-6 m-0">
            <div className="max-w-2xl space-y-4">
              <h3 className="font-semibold">Horários de Funcionamento</h3>
              {weekDays.map((day, index) => {
                const isClosed = day.day === 0;
                return (
                  <div 
                    key={day.day} 
                    className={cn(
                      "p-4 rounded-xl border bg-card",
                      isClosed && "opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-medium",
                          isClosed 
                            ? "bg-muted text-muted-foreground" 
                            : "bg-gradient-to-br from-sky-500 to-blue-500 text-white"
                        )}>
                          {day.name.charAt(0)}
                        </div>
                        <p className="font-medium">{day.name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {!isClosed ? (
                          <>
                            <Input type="time" defaultValue="08:00" className="w-28 h-9" />
                            <span className="text-muted-foreground">até</span>
                            <Input type="time" defaultValue="18:00" className="w-28 h-9" />
                          </>
                        ) : (
                          <Badge variant="secondary">Fechado</Badge>
                        )}
                        <Switch defaultChecked={!isClosed} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={() => setView("list")}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            onClick={handleSaveEdit}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </div>
  );

  // List View
  const renderListView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative px-6 py-5 border-b bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 flex-shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-teal-500">
            <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
            <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
          </svg>
        </div>
        
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Warehouse className="h-24 w-24 text-teal-500" />
        </div>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-teal-500 to-cyan-500">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block">Locais de Armazenamento</span>
              <span className="text-sm font-normal text-muted-foreground">
                {locations.length} locais cadastrados em {Object.keys(groupedLocations).length} propriedades
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-muted/30 flex-shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar locais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterProperty} onValueChange={setFilterProperty}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Todas as propriedades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as propriedades</SelectItem>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setView("create")} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
            <Plus className="h-4 w-4 mr-2" />
            Novo Local
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-500 border-t-transparent" />
          </div>
        ) : (
        <div className="space-y-6">
          {Object.entries(groupedLocations).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum local de armazenamento cadastrado</p>
              <p className="text-sm mt-1">Clique em &quot;Novo Local&quot; para criar o primeiro.</p>
            </div>
          ) : (
          Object.entries(groupedLocations).map(([propertyId, data]) => (
            <div key={propertyId} className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{data.propertyName}</h3>
                <Badge variant="secondary">{data.locations.length} locais</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.locations.map((location) => {
                  const typeInfo = locationTypes.find(t => t.id === location.type);
                  const TypeIcon = typeInfo?.icon || Warehouse;
                  const capacityNum = location.capacity || 1;
                  const occupancyPercent = capacityNum > 0 ? (location.currentOccupancy / capacityNum) * 100 : 0;
                  
                  return (
                    <div
                      key={location.id}
                      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${typeInfo?.color || "from-gray-500 to-gray-600"}`}>
                            <TypeIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{location.name}</p>
                            <p className="text-xs text-muted-foreground">{location.code}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditLocation(location)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={async () => {
                              if (!confirm("Excluir este local de armazenamento?")) return;
                              try {
                                await api.deleteStorageLocation(Number(location.id));
                                toast.success("Local removido.");
                                const res = await api.getStorageLocations();
                                const data = (res.data ?? []) as Record<string, unknown>[];
                                setLocations(data.map(mapApiLocationToStorageLocation));
                              } catch {
                                toast.error("Erro ao excluir local.");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ocupação</span>
                          <span className="font-medium">{location.currentOccupancy} / {location.capacity || "—"}</span>
                        </div>
                        <Progress value={Math.min(100, occupancyPercent)} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {location.temperature && (
                          <Badge variant="outline" className="text-xs">
                            <Thermometer className="h-3 w-3 mr-1" />
                            {location.temperature}
                          </Badge>
                        )}
                        {location.zonesCount && (
                          <Badge variant="outline" className="text-xs">
                            <Grid3X3 className="h-3 w-3 mr-1" />
                            {location.zonesCount} zonas
                          </Badge>
                        )}
                        {location.managersCount && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {location.managersCount} resp.
                          </Badge>
                        )}
                        {location.isRestricted && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Restrito
                          </Badge>
                        )}
                        <Badge variant={location.isActive ? "default" : "secondary"} className="text-xs ml-auto">
                          {location.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
          )}
        </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 p-4 border-t bg-muted/30 flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          {filteredLocations.length} locais encontrados
        </div>
        <Button variant="outline" onClick={handleClose}>
          <X className="h-4 w-4 mr-2" />
          Fechar
        </Button>
      </div>
    </div>
  );

  // Wizard View
  const renderWizardView = () => (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-72 bg-gradient-to-b from-teal-600 via-cyan-600 to-emerald-600 text-white p-6 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
            <Warehouse className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold">Novo Local</h2>
          <p className="text-white/70 text-sm mt-1">Cadastro de armazenamento</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70">Progresso</span>
            <span className="font-semibold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-2">
            {wizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = index <= currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && setCurrentStep(index)}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    isCurrent && "bg-white/20 backdrop-blur",
                    isCompleted && "text-white/90 hover:bg-white/10",
                    !isCurrent && !isCompleted && "text-white/50",
                    isClickable && "cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                    isCurrent && "bg-white text-teal-600",
                    isCompleted && "bg-emerald-400/30 text-white",
                    !isCurrent && !isCompleted && "bg-white/10"
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn(
                      "font-medium text-sm",
                      isCurrent && "text-white",
                      !isCurrent && "text-white/80"
                    )}>
                      {step.title}
                    </p>
                    <p className={cn(
                      "text-xs truncate",
                      isCurrent && "text-white/70",
                      !isCurrent && "text-white/50"
                    )}>
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Back to List */}
        <Button 
          variant="ghost" 
          onClick={() => setView("list")}
          className="mt-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar à Lista
        </Button>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content Header */}
        <div className="px-8 py-5 border-b flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Etapa {currentStep + 1} de {wizardSteps.length}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{wizardSteps[currentStep].title}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-8">
            {renderStepContent()}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-8 py-5 border-t bg-muted/30 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-1.5">
            {wizardSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep ? "bg-teal-500 w-6" : index < currentStep ? "bg-emerald-500 w-2" : "bg-muted-foreground/30 w-2"
                )}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="min-w-[180px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Local
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="min-w-[140px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {view === "list" && renderListView()}
        {view === "create" && renderWizardView()}
        {view === "edit" && renderEditView()}
      </DialogContent>
    </Dialog>
  );
}
