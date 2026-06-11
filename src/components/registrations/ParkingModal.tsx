import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car,
  DollarSign,
  Sparkles,
  Check,
  ParkingCircle,
  Clock,
  Loader2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ParkingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const parkingTypes = [
  { id: "covered", label: "Coberto", color: "from-blue-500 to-cyan-500", description: "Proteção contra chuva e sol" },
  { id: "uncovered", label: "Descoberto", color: "from-amber-500 to-orange-500", description: "Área aberta" },
  { id: "valet", label: "Manobrista", color: "from-purple-500 to-violet-500", description: "Serviço de valet" },
  { id: "garage", label: "Garagem", color: "from-emerald-500 to-green-500", description: "Garagem fechada" },
];

const pricingTypes = [
  { id: "per_day", label: "Por Dia", description: "Cobrado diariamente" },
  { id: "per_night", label: "Por Noite", description: "Cobrado por noite" },
  { id: "fixed", label: "Valor Fixo", description: "Preço único" },
  { id: "free", label: "Gratuito", description: "Sem custo" },
];

const getParkingTypeLabel = (type: string) => {
  const parking = parkingTypes.find(p => p.id === type);
  return parking ? parking.label : type;
};

const getParkingTypeColor = (type: string) => {
  const parking = parkingTypes.find(p => p.id === type);
  return parking ? parking.color : "from-gray-500 to-gray-600";
};

const getPricingTypeLabel = (type: string) => {
  const pricing = pricingTypes.find(p => p.id === type);
  return pricing ? pricing.label : type;
};

export function ParkingModal({ open, onOpenChange }: ParkingModalProps) {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parkingToDelete, setParkingToDelete] = useState<any | null>(null);
  const [editingParking, setEditingParking] = useState<any | null>(null);
  const [parkings, setParkings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    propertyId: null as number | null,
    code: "",
    name: "",
    parkingType: "",
    pricingType: "per_day" as "per_day" | "per_night" | "fixed" | "free",
    price: "",
    capacity: "",
    description: "",
    isTaxable: true,
    requiresReservation: false,
    isActive: true,
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadProperties();
      if (mode === "list") {
        loadParkings();
      }
    }
  }, [open, mode]);

  // Filter parkings based on search term
  const filteredParkings = useMemo(() => {
    return parkings.filter((parking) => {
      if (!searchTerm.trim()) return true;
      const search = searchTerm.toLowerCase().trim();
      const name = (parking.name || "").toLowerCase();
      const code = (parking.code || "").toLowerCase();
      const description = (parking.description || "").toLowerCase();
      return (
        name.includes(search) ||
        code.includes(search) ||
        description.includes(search)
      );
    });
  }, [parkings, searchTerm]);

  const loadProperties = async () => {
    try {
      const response = await api.getProperties();
      if (response.success && response.data?.properties) {
        setProperties(response.data.properties);
        if (response.data.properties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(response.data.properties[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar propriedades:", error);
    }
  };

  const loadParkings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getParkings(searchTerm || undefined, selectedPropertyId || undefined);
      if (response.success && response.data?.parkings) {
        setParkings(response.data.parkings);
      }
    } catch (error) {
      console.error("Erro ao carregar estacionamentos:", error);
      toast.error("Erro ao carregar estacionamentos");
    } finally {
      setIsLoading(false);
    }
  };

  const loadParkingForEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getParkingById(id);
      if (response.success && response.data) {
        const parking = response.data;
        setEditingParking(parking);
        
        setFormData({
          propertyId: parking.propertyId || null,
          code: parking.code || "",
          name: parking.name || "",
          parkingType: parking.parkingType || "",
          pricingType: parking.pricingType || "per_day",
          price: parking.price?.toString() || "",
          capacity: parking.capacity?.toString() || "",
          description: parking.description || "",
          isTaxable: parking.isTaxable !== false,
          requiresReservation: parking.requiresReservation || false,
          isActive: parking.status === "active",
        });
        
        if (parking.propertyId) {
          setSelectedPropertyId(parking.propertyId);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar estacionamento:", error);
      toast.error("Erro ao carregar dados do estacionamento");
      setEditingParking(null);
      setMode("list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.propertyId) {
      toast.error("Propriedade é obrigatória");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Código é obrigatório");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.parkingType) {
      toast.error("Tipo de estacionamento é obrigatório");
      return;
    }
    if (formData.pricingType !== "free" && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast.error("Preço é obrigatório quando o tipo não é gratuito");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        propertyId: formData.propertyId,
        code: formData.code.trim(),
        name: formData.name.trim(),
        parkingType: formData.parkingType as 'covered' | 'uncovered' | 'valet' | 'garage',
        pricingType: formData.pricingType,
        price: formData.pricingType !== "free" ? (formData.price ? parseFloat(formData.price) : null) : null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        description: formData.description.trim() || null,
        isTaxable: formData.isTaxable,
        requiresReservation: formData.requiresReservation,
        status: formData.isActive ? "active" as const : "inactive" as const,
      };

      let response;
      if (editingParking) {
        response = await api.updateParking(editingParking.id, data);
        if (response.success) {
          toast.success("Estacionamento Atualizado", {
            description: `${formData.name} foi atualizado com sucesso!`,
          });
          await loadParkings();
          setMode("list");
          setEditingParking(null);
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao atualizar estacionamento");
        }
      } else {
        response = await api.createParking(data);
        if (response.success) {
          toast.success("Estacionamento Criado", {
            description: `${formData.name} foi cadastrado com sucesso!`,
          });
          await loadParkings();
          setMode("list");
          resetForm();
        } else {
          toast.error(response.error?.message || "Erro ao cadastrar estacionamento");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar estacionamento:", error);
      toast.error("Erro ao salvar estacionamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      propertyId: selectedPropertyId,
      code: "",
      name: "",
      parkingType: "",
      pricingType: "per_day",
      price: "",
      capacity: "",
      description: "",
      isTaxable: true,
      requiresReservation: false,
      isActive: true,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setMode("list");
      setStep(1);
      setEditingParking(null);
      setSearchTerm("");
      resetForm();
    }, 300);
  };

  const handleNewClick = () => {
    setEditingParking(null);
    setMode("create");
    setStep(1);
    setSearchTerm("");
    resetForm();
  };

  const handleEditClick = (parking: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingParking(parking);
    setMode("edit");
    setStep(1);
    loadParkingForEdit(parking.id);
  };

  const handleBackToList = () => {
    setMode("list");
    setStep(1);
    setEditingParking(null);
    resetForm();
    loadParkings();
  };

  const handleDeleteClick = (parking: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setParkingToDelete(parking);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!parkingToDelete) return;

    try {
      setIsDeleting(true);
      const response = await api.deleteParking(parkingToDelete.id);

      if (response.success) {
        toast.success("Estacionamento Excluído", {
          description: `${parkingToDelete.name} foi excluído com sucesso!`,
        });
        setDeleteDialogOpen(false);
        setParkingToDelete(null);
        await loadParkings();
      } else {
        toast.error(response.error?.message || "Erro ao excluir estacionamento");
      }
    } catch (error) {
      console.error("Erro ao excluir estacionamento:", error);
      toast.error("Erro ao excluir estacionamento");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setParkingToDelete(null);
  };

  // Auto-set propertyId when property is selected
  useEffect(() => {
    if (selectedPropertyId && mode === "create") {
      setFormData(prev => ({ ...prev, propertyId: selectedPropertyId }));
    }
  }, [selectedPropertyId, mode]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className={`${mode === "list" ? "max-w-7xl" : "max-w-6xl"} max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="relative px-6 py-5 border-b bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-slate-500/10 flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 200" className="w-full h-full text-slate-500">
                <circle cx="150" cy="50" r="80" fill="currentColor" opacity="0.3" />
                <circle cx="180" cy="80" r="50" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Car className="h-24 w-24 text-slate-500" />
            </div>

            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-slate-500 to-gray-500">
                    <ParkingCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {mode === "list" 
                        ? "Estacionamentos" 
                        : mode === "edit"
                        ? "Editar Estacionamento"
                        : "Novo Estacionamento"}
                    </DialogTitle>
                    <p className="text-sm font-normal text-slate-600">
                      {mode === "list" 
                        ? "Gerencie os estacionamentos cadastrados" 
                        : mode === "edit"
                        ? "Edite as informações do estacionamento"
                        : "Cadastre uma nova opção de estacionamento"}
                    </p>
                  </div>
                </div>
                {(mode === "create" || mode === "edit") && (
                  <div className="flex gap-2">
                    {[1, 2].map((s) => (
                      <div
                        key={s}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          step === s
                            ? "bg-slate-600 text-white"
                            : step > s
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step > s ? <Check className="h-5 w-5" /> : s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {mode === "list" ? (
                /* LIST MODE */
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Estacionamentos Cadastrados</h3>
                        <p className="text-sm text-muted-foreground">
                          {filteredParkings.length} de {parkings.length} {parkings.length === 1 ? "estacionamento cadastrado" : "estacionamentos cadastrados"}
                        </p>
                      </div>
                      <Button
                        onClick={handleNewClick}
                        className="bg-gradient-to-r from-slate-600 to-gray-500 hover:from-slate-700 hover:to-gray-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Estacionamento
                      </Button>
                    </div>
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, código, descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                  ) : parkings.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <ParkingCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum estacionamento cadastrado</p>
                      <Button onClick={handleNewClick} className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Primeiro Estacionamento
                      </Button>
                    </div>
                  ) : filteredParkings.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Nenhum estacionamento encontrado com o termo "{searchTerm}"</p>
                    </div>
                  ) : (
                    /* Parkings List - Table */
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-[calc(95vh-280px)]">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50 border-b sticky top-0 z-10">
                              <tr>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Estacionamento</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Cobrança</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Preço</th>
                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Capacidade</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Reserva</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {filteredParkings.map((parking) => (
                                <tr 
                                  key={parking.id} 
                                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                                  onClick={() => handleEditClick(parking)}
                                >
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <ParkingCircle className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <span className="font-medium text-sm block">{parking.name}</span>
                                        {parking.code && (
                                          <span className="text-xs text-muted-foreground">Código: {parking.code}</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <Badge 
                                      className="text-white border-0 shadow-sm"
                                      style={{
                                        background: `linear-gradient(to right, ${getParkingTypeColor(parking.parkingType).replace('from-', '').replace('to-', ', ').replace(' ', '')})`,
                                      }}
                                    >
                                      {getParkingTypeLabel(parking.parkingType)}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm text-muted-foreground">
                                      {getPricingTypeLabel(parking.pricingType)}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-sm font-semibold text-slate-600">
                                      {parking.pricingType === "free" 
                                        ? "Gratuito"
                                        : `R$ ${parking.price?.toFixed(2).replace('.', ',') || "0,00"}`}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {parking.capacity ? (
                                      <span className="text-sm text-muted-foreground">
                                        {parking.capacity} {parking.capacity === 1 ? "vaga" : "vagas"}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    {parking.requiresReservation ? (
                                      <Badge variant="outline" className="border-purple-500 text-purple-600">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Sim
                                      </Badge>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Não</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge className={parking.status === "active" ? "bg-emerald-500" : "bg-gray-500"}>
                                      {parking.status === "active" ? "Ativo" : "Inativo"}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(parking, e)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDeleteClick(parking, e)}
                                        disabled={isDeleting}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                /* CREATE/EDIT MODE */
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                  <aside className="rounded-2xl border border-border bg-gradient-to-b from-slate-500/10 via-gray-500/10 to-background overflow-hidden">
                    <div className="p-5 border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(100,116,139,0.22),transparent_40%)]">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow">
                          <ParkingCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Cadastro Estacionamento</p>
                          <p className="text-xs text-muted-foreground">
                            {editingParking ? "Edição avançada" : "Novo cadastro"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-slate-500 to-gray-600 transition-all"
                            style={{ width: `${step === 1 ? 50 : 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Etapa {step} de 2</p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {[1, 2].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStep(s)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            step === s ? "bg-primary/10 border-primary/30" : "bg-card border-border/60"
                          }`}
                        >
                          <p className="text-sm font-medium">
                            {s === 1 ? "1. Tipo e dados principais" : "2. Cobrança e revisão"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s === 1
                              ? "Defina tipo, identificação e capacidade."
                              : "Configure valores e finalize o cadastro."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Property Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="property">Propriedade *</Label>
                        <Select
                          value={selectedPropertyId?.toString() || ""}
                          onValueChange={(value) => {
                            const propId = parseInt(value, 10);
                            setSelectedPropertyId(propId);
                            setFormData(prev => ({ ...prev, propertyId: propId }));
                          }}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione uma propriedade" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {property.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Parking Type Selection */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Car className="h-5 w-5 text-slate-400" />
                          Tipo de Estacionamento *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {parkingTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setFormData(prev => ({ ...prev, parkingType: type.id }))}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.parkingType === type.id
                                  ? "border-slate-500 bg-slate-500/10"
                                  : "border-border hover:border-slate-300 bg-card"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                                <ParkingCircle className="h-6 w-6 text-white" />
                              </div>
                              <p className="font-semibold text-foreground text-sm">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                              {formData.parkingType === type.id && (
                                <div className="flex justify-center mt-2">
                                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Código *</Label>
                          <Input
                            id="code"
                            placeholder="Ex: EST-COB-01"
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome do Estacionamento *</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Estacionamento Coberto - Andar 1"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="capacity">Capacidade (Vagas)</Label>
                          <Input
                            id="capacity"
                            type="number"
                            min="1"
                            placeholder="Ex: 50"
                            value={formData.capacity}
                            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Informações sobre localização e características..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-background min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {/* Pricing Type */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold">Tipo de Cobrança *</Label>
                            <p className="text-xs text-muted-foreground">Como o estacionamento será cobrado</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {pricingTypes.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  pricingType: type.id as any,
                                  // Limpar preço se for gratuito
                                  price: type.id === "free" ? "" : prev.price,
                                }));
                              }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.pricingType === type.id
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : "border-border hover:border-emerald-300 bg-card"
                              }`}
                            >
                              <p className="font-semibold text-foreground text-sm">{type.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      {formData.pricingType !== "free" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-400" />
                              {formData.pricingType === "per_day" 
                                ? "Valor por Dia (R$) *" 
                                : formData.pricingType === "per_night"
                                ? "Valor por Noite (R$) *"
                                : "Valor Fixo (R$) *"}
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={formData.price}
                              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      )}

                      {/* Settings */}
                      <div className="space-y-4">
                        {formData.pricingType !== "free" && (
                          <div className="p-5 rounded-2xl border bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                                  <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">Sujeito a Impostos</p>
                                  <p className="text-sm text-muted-foreground">Incluir impostos no cálculo</p>
                                </div>
                              </div>
                              <Switch
                                checked={formData.isTaxable}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTaxable: checked }))}
                              />
                            </div>
                          </div>
                        )}
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-purple-500/5 to-violet-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500">
                                <Clock className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Requer Reserva</p>
                                <p className="text-sm text-muted-foreground">Necessita reserva antecipada</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.requiresReservation}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresReservation: checked }))}
                            />
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl border bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
                                <Check className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Estacionamento Ativo</p>
                                <p className="text-sm text-muted-foreground">Disponível para uso</p>
                              </div>
                            </div>
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-5 rounded-2xl border bg-gradient-to-r from-slate-500/5 to-gray-500/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-500">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-foreground">Resumo</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground truncate">{formData.name || "-"}</p>
                            <p className="text-xs text-muted-foreground">Nome</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground capitalize">
                              {parkingTypes.find(t => t.id === formData.parkingType)?.label || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <p className="text-lg font-bold text-foreground">
                              {formData.pricingType === "free" 
                                ? "Gratuito" 
                                : `R$ ${formData.price || "0,00"}`}
                            </p>
                            <p className="text-xs text-muted-foreground">Preço</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-card border">
                            <Badge className={formData.isActive ? "bg-emerald-500" : "bg-red-500"}>
                              {formData.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">Status</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-muted/30 flex-shrink-0">
            {mode === "list" ? (
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => step > 1 ? setStep(step - 1) : handleBackToList()}
                    disabled={isSubmitting}
                  >
                    {step > 1 ? "Anterior" : "Cancelar"}
                  </Button>
                  <Button
                    onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-slate-600 to-gray-500 hover:from-slate-700 hover:to-gray-600 text-white shadow-lg shadow-slate-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingParking ? "Atualizando..." : "Criando..."}
                      </>
                    ) : step < 2 ? (
                      "Continuar"
                    ) : editingParking ? (
                      "Atualizar Estacionamento"
                    ) : (
                      "Criar Estacionamento"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o estacionamento <strong>{parkingToDelete?.name}</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Código: {parkingToDelete?.code} | Tipo: {parkingToDelete ? getParkingTypeLabel(parkingToDelete.parkingType) : "N/A"}
              </span>
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
