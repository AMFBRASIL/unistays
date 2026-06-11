import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Save,
  RotateCcw,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Users,
  Building2,
  Zap,
  Target,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Hotel,
  Home,
  Palmtree,
  CalendarDays,
  FileText,
} from "lucide-react";

type PropertyType = 'all' | 'hotel' | 'apart-hotel' | 'loft' | 'temporada';
type RateView = 'daily' | 'weekly' | 'monthly';

const propertyTypeConfig = {
  hotel: { label: 'Hotel', icon: Hotel, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  'apart-hotel': { label: 'Apart-Hotel', icon: Building2, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  loft: { label: 'Loft', icon: Home, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  temporada: { label: 'Temporada', icon: Palmtree, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
};

export default function PricingMap() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>('all');
  const [rateView, setRateView] = useState<RateView>('daily');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 6),
  });
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkPercentage, setBulkPercentage] = useState("");
  const [editingCell, setEditingCell] = useState<{ unitId: number; date: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [localPrices, setLocalPrices] = useState<Record<number, Record<string, { daily: number; weekly: number; monthly: number }>>>({});

  // Fetch all pricing data in a single optimized request
  const { data: pricingData, isLoading, refetch: refetchPricingData } = useQuery({
    queryKey: ['pricing-map-data', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async () => {
      const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

      console.log(`🔵 [FETCH] Buscando dados de ${startDateStr} a ${endDateStr}`);
      const response = await api.getPricingMapData({ startDate: startDateStr, endDate: endDateStr });
      return response.data;
    },
  });

  // Extract data from the single response
  const unitsData = pricingData?.units || [];
  const propertiesData = pricingData?.properties || [];
  const unitRatesData = pricingData?.rates || [];
  const ratesByUnit = pricingData?.ratesByUnit || {};

  // Initialize local prices from database
  useEffect(() => {
    if (!pricingData?.units) return;

    const prices: Record<number, Record<string, { daily: number; weekly: number; monthly: number }>> = {};

    // Use the selected date range, not today
    const periodStart = dateRange.from;
    const periodEnd = dateRange.to;
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create a map of existing rates from database
    const ratesMap = new Map<string, any>();
    if (pricingData.rates) {
      pricingData.rates.forEach((rate: any) => {
        // Fix: Use the date string directly to avoid timezone shifts (GMT-3 vs UTC)
        // If we use new Date("2026-01-25"), it becomes Jan 24th 21:00 in Brazil
        const dateStr = String(rate.date).split('T')[0];
        const key = `${rate.unitId}-${dateStr}`;
        ratesMap.set(key, rate);
      });
    }

    pricingData.units.forEach((unit: any) => {
      prices[unit.id] = {};
      const baseRates = {
        daily: Number(unit.rates?.daily) || 250,
        weekly: Number(unit.rates?.weekly) || 1500,
        monthly: Number(unit.rates?.monthly) || 5000
      };

      // Load prices for the entire selected date range
      for (let i = 0; i < totalDays; i++) {
        const currentDate = addDays(periodStart, i);
        const date = format(currentDate, "yyyy-MM-dd");
        const dayOfWeek = currentDate.getDay();
        const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 1;

        // Check if we have a saved rate for this date
        const key = `${unit.id}-${date}`;
        const savedRate = ratesMap.get(key);

        if (savedRate) {
          // Use saved rate from database - CONVERT TO NUMBER
          prices[unit.id][date] = {
            daily: Number(savedRate.dailyRate) || Math.round(baseRates.daily * weekendMultiplier),
            weekly: Number(savedRate.weeklyRate) || Math.round(baseRates.weekly * weekendMultiplier),
            monthly: Number(savedRate.monthlyRate) || Math.round(baseRates.monthly * weekendMultiplier),
          };
        } else {
          // Use base rate with weekend multiplier
          prices[unit.id][date] = {
            daily: Math.round(baseRates.daily * weekendMultiplier),
            weekly: Math.round(baseRates.weekly * weekendMultiplier),
            monthly: Math.round(baseRates.monthly * weekendMultiplier),
          };
        }
      }
    });

    setLocalPrices(prices);
  }, [pricingData, dateRange]);

  // Group units by Property → Room Type → Units
  const groupedUnits = () => {
    if (!unitsData || !propertiesData) return [];

    const propertyMap = new Map(propertiesData.map((p: any) => [p.id, p]));
    const result: any[] = [];

    // Group by property first
    const byProperty = unitsData.reduce((acc: any, unit: any) => {
      const propertyId = unit.propertyId;
      if (!acc[propertyId]) {
        acc[propertyId] = [];
      }
      acc[propertyId].push(unit);
      return acc;
    }, {});

    // For each property, group by room type
    Object.entries(byProperty).forEach(([propertyId, units]: [string, any]) => {
      const property = propertyMap.get(parseInt(propertyId));
      if (!property) return;

      // Group units by room type within this property
      const byRoomType = (units as any[]).reduce((acc: any, unit: any) => {
        const roomTypeId = unit.roomTypeId || 0;
        const roomTypeName = unit.roomType?.name || 'Sem Tipo';

        if (!acc[roomTypeId]) {
          acc[roomTypeId] = {
            id: `${propertyId}-${roomTypeId}`,
            propertyId: parseInt(propertyId),
            propertyName: property.name,
            propertyType: property.type as PropertyType,
            roomTypeId,
            roomTypeName,
            icon: BedDouble,
            color: propertyTypeConfig[property.type as keyof typeof propertyTypeConfig]?.color || 'from-blue-500 to-blue-600',
            bgColor: propertyTypeConfig[property.type as keyof typeof propertyTypeConfig]?.bgColor || 'bg-blue-500/10',
            borderColor: propertyTypeConfig[property.type as keyof typeof propertyTypeConfig]?.borderColor || 'border-blue-500/30',
            rooms: [],
          };
        }

        acc[roomTypeId].rooms.push({
          id: unit.id,
          number: unit.number,
          name: unit.name,
          basePrice: unit.rates?.daily || 250,
          weeklyPrice: unit.rates?.weekly || 1500,
          monthlyPrice: unit.rates?.monthly || 5000,
          capacity: unit.capacity || 2,
        });

        return acc;
      }, {});

      // Add all room types from this property to result
      Object.values(byRoomType).forEach((group: any) => {
        result.push(group);
      });
    });

    return result;
  };

  const filteredCategories = groupedUnits().filter(
    (cat: any) => selectedPropertyType === 'all' || cat.propertyType === selectedPropertyType
  );

  const visibleDates = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  const handleSelectAllRooms = () => {
    const allRoomIds = filteredCategories.flatMap((c: any) => c.rooms.map((r: any) => r.id));
    if (selectedRooms.length === allRoomIds.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(allRoomIds);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    const category = groupedUnits().find((c: any) => c.id === categoryId);
    if (!category) return;

    const categoryRoomIds = category.rooms.map((r: any) => r.id);
    const allSelected = categoryRoomIds.every((id: number) => selectedRooms.includes(id));

    if (allSelected) {
      setSelectedRooms(selectedRooms.filter((id: number) => !categoryRoomIds.includes(id)));
    } else {
      setSelectedRooms([...new Set([...selectedRooms, ...categoryRoomIds])]);
    }
  };

  const handleSelectRoom = (roomId: number) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter((id: number) => id !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  const handleBulkPriceUpdate = () => {
    if (!bulkPrice || selectedRooms.length === 0) {
      toast({ title: "Selecione unidades e informe o valor", variant: "destructive" });
      return;
    }

    const newPrices = { ...localPrices };
    const newPrice = parseFloat(bulkPrice);

    selectedRooms.forEach((unitId: number) => {
      visibleDates.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (date >= dateRange.from && date <= dateRange.to) {
          newPrices[unitId] = {
            ...newPrices[unitId],
            [dateStr]: {
              ...newPrices[unitId]?.[dateStr],
              [rateView]: newPrice
            }
          };
        }
      });
    });

    setLocalPrices(newPrices);
    toast({
      title: "Preços atualizados!",
      description: `${selectedRooms.length} unidades atualizadas para R$ ${newPrice.toFixed(2)} (${rateView})`,
    });
    setBulkPrice("");
  };

  const handlePercentageUpdate = (increase: boolean) => {
    if (!bulkPercentage || selectedRooms.length === 0) {
      toast({ title: "Selecione unidades e informe a porcentagem", variant: "destructive" });
      return;
    }

    const newPrices = { ...localPrices };
    const percentage = parseFloat(bulkPercentage) / 100;
    const multiplier = increase ? 1 + percentage : 1 - percentage;

    selectedRooms.forEach((unitId: number) => {
      visibleDates.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (date >= dateRange.from && date <= dateRange.to) {
          const currentPrice = newPrices[unitId]?.[dateStr]?.[rateView] || 0;
          newPrices[unitId] = {
            ...newPrices[unitId],
            [dateStr]: {
              ...newPrices[unitId]?.[dateStr],
              [rateView]: Math.round(currentPrice * multiplier)
            }
          };
        }
      });
    });

    setLocalPrices(newPrices);
    toast({
      title: "Preços atualizados!",
      description: `${increase ? "Aumento" : "Desconto"} de ${bulkPercentage}% aplicado (${rateView})`,
    });
    setBulkPercentage("");
  };

  const handleCellEdit = (unitId: number, date: string) => {
    setEditingCell({ unitId, date });
    setEditValue(localPrices[unitId]?.[date]?.[rateView]?.toString() || "");
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    const newPrices = { ...localPrices };
    const currentPriceData: { daily?: number; weekly?: number; monthly?: number } =
      newPrices[editingCell.unitId]?.[editingCell.date] || {};
    const newValue = parseFloat(editValue) || 0;

    // Ensure we have all three values (daily, weekly, monthly)
    // If a value doesn't exist, calculate it based on the new value
    const updatedPriceData = {
      daily: currentPriceData.daily || 0,
      weekly: currentPriceData.weekly || 0,
      monthly: currentPriceData.monthly || 0,
    };

    // Update the current view
    updatedPriceData[rateView] = newValue;

    // If other values are 0, calculate them proportionally
    if (rateView === 'daily' && newValue > 0) {
      if (updatedPriceData.weekly === 0) updatedPriceData.weekly = Math.round(newValue * 6);
      if (updatedPriceData.monthly === 0) updatedPriceData.monthly = Math.round(newValue * 20);
    } else if (rateView === 'weekly' && newValue > 0) {
      if (updatedPriceData.daily === 0) updatedPriceData.daily = Math.round(newValue / 6);
      if (updatedPriceData.monthly === 0) updatedPriceData.monthly = Math.round(newValue * 3.5);
    } else if (rateView === 'monthly' && newValue > 0) {
      if (updatedPriceData.daily === 0) updatedPriceData.daily = Math.round(newValue / 20);
      if (updatedPriceData.weekly === 0) updatedPriceData.weekly = Math.round(newValue / 3.5);
    }

    newPrices[editingCell.unitId] = {
      ...newPrices[editingCell.unitId],
      [editingCell.date]: updatedPriceData,
    };

    setLocalPrices(newPrices);
    setEditingCell(null);
    setEditValue("");
  };

  const handleSaveChanges = async () => {
    try {
      console.log('🔵 ========== INICIANDO SALVAMENTO ==========');
      console.log('🔵 [SAVE] localPrices:', localPrices);
      console.log('🔵 [SAVE] selectedRooms:', selectedRooms);
      console.log('🔵 [SAVE] Total de unidades em localPrices:', Object.keys(localPrices).length);

      // Collect all modified prices using Map for deduplication
      const ratesMap = new Map<string, any>();

      // Filter units to save: if units are selected, save only those. Otherwise, save all.
      const unitsToSave = selectedRooms.length > 0
        ? Object.keys(localPrices).filter(id => selectedRooms.includes(Number(id)))
        : Object.keys(localPrices);

      console.log(`🔵 [SAVE] Salvando ${unitsToSave.length} unidades:`, unitsToSave);

      unitsToSave.forEach((unitIdStr) => {
        const unitId = parseInt(unitIdStr);
        const dates = Object.keys(localPrices[unitId] || {});

        console.log(`🔵 [UNIT ${unitId}] Processando ${dates.length} datas`);

        dates.forEach((date) => {
          const priceData = localPrices[unitId][date];
          if (priceData) {
            // Only add if we have valid numeric values
            const dailyRate = priceData.daily;
            const weeklyRate = priceData.weekly;
            const monthlyRate = priceData.monthly;

            if (typeof dailyRate === 'number' && typeof weeklyRate === 'number' && typeof monthlyRate === 'number') {
              // Use a unique key to avoid duplicates
              const key = `${unitId}-${date}`;
              ratesMap.set(key, {
                unitId,
                date,
                dailyRate,
                weeklyRate,
                monthlyRate,
              });
            } else {
              console.warn(`  ⚠️ [${date}] INVÁLIDO - tipos:`, {
                daily: typeof dailyRate,
                weekly: typeof weeklyRate,
                monthly: typeof monthlyRate
              });
            }
          }
        });
      });

      // Convert map to array (automatically deduplicated)
      const ratesToSave = Array.from(ratesMap.values());

      console.log('🔵 ========== RESUMO ==========');
      console.log('🔵 [SAVE] Total de rates coletados:', ratesToSave.length);
      console.log('🔵 [SAVE] Primeiros 5 rates:', ratesToSave.slice(0, 5));

      if (ratesToSave.length === 0) {
        console.error('❌ [SAVE] ERRO: Nenhum rate válido para salvar!');
        toast({
          title: "Nenhuma alteração",
          description: "Não há preços para salvar.",
          variant: "destructive",
        });
        return;
      }

      // Save to database
      console.log('🟢 ========== ENVIANDO PARA API ==========');
      console.log('🟢 [API] Chamando bulkUpsertUnitRates com', ratesToSave.length, 'rates');

      const apiResponse = await api.bulkUpsertUnitRates(ratesToSave);

      console.log('🟢 [API] Resposta recebida:', apiResponse);
      console.log('🟢 ========== API RESPONDEU COM SUCESSO ==========');

      // Also update unit base rates with averages
      const unitUpdates = selectedRooms.map(async (unitId) => {
        const dates = Object.keys(localPrices[unitId] || {});
        if (dates.length === 0) return;

        const avgDaily = Math.round(
          dates.reduce((sum, date) => sum + (localPrices[unitId][date]?.daily || 0), 0) / dates.length
        );
        const avgWeekly = Math.round(
          dates.reduce((sum, date) => sum + (localPrices[unitId][date]?.weekly || 0), 0) / dates.length
        );
        const avgMonthly = Math.round(
          dates.reduce((sum, date) => sum + (localPrices[unitId][date]?.monthly || 0), 0) / dates.length
        );

        // Only update if we have valid positive numbers
        if (avgDaily > 0 && avgWeekly > 0 && avgMonthly > 0) {
          return api.updateUnit(unitId, {
            rates: {
              daily: avgDaily,
              weekly: avgWeekly,
              monthly: avgMonthly,
            },
          });
        }
      });

      await Promise.all(unitUpdates);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['pricing-map-data'] });
      refetchPricingData();

      toast({
        title: "Alterações salvas!",
        description: `${ratesToSave.length} preços salvos no banco de dados.`,
      });
    } catch (error) {
      console.error('Error saving rates:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const isDateInRange = (date: Date) => date >= dateRange.from && date <= dateRange.to;

  const getBasePrice = (unitId: number) => {
    const unit = unitsData?.find((u: any) => u.id === unitId);
    if (!unit) return 0;
    return rateView === 'daily' ? (unit.rates?.daily || 250) : rateView === 'weekly' ? (unit.rates?.weekly || 1500) : (unit.rates?.monthly || 5000);
  };

  const getPriceVariation = (unitId: number, date: string) => {
    const currentPrice = localPrices[unitId]?.[date]?.[rateView] || 0;
    const basePrice = getBasePrice(unitId);
    if (basePrice === 0) return 0;
    return ((currentPrice - basePrice) / basePrice) * 100;
  };

  const totalUnits = filteredCategories.reduce((acc: number, cat: any) => acc + cat.rooms.length, 0);

  // Calculate stats
  const calculateStats = () => {
    const allPrices: number[] = [];
    filteredCategories.forEach((cat: any) => {
      cat.rooms.forEach((room: any) => {
        visibleDates.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const price = localPrices[room.id]?.[dateStr]?.[rateView] || getBasePrice(room.id);
          allPrices.push(price);
        });
      });
    });

    const validPrices = allPrices.filter(p => !isNaN(p) && p > 0);
    const avgPrice = validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;
    const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

    return { avgPrice, maxPrice };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando mapa de tarifação...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Mapa de Tarifação Híbrido
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie preços por tipo de propriedade e período
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Sugestão IA
            </Button>
            <Button onClick={handleSaveChanges} className="gap-2 bg-gradient-to-r from-primary to-primary/80">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>

        {/* Property Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPropertyType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPropertyType('all')}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Todos
            <Badge variant="secondary" className="ml-1">{unitsData?.length || 0}</Badge>
          </Button>
          {Object.entries(propertyTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = groupedUnits().filter((c: any) => c.propertyType === type).reduce((acc: number, c: any) => acc + c.rooms.length, 0);
            return (
              <Button
                key={type}
                variant={selectedPropertyType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPropertyType(type as PropertyType)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {config.label}
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </Button>
            );
          })}
        </div>

        {/* Rate View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Visualizar tarifa:</span>
          <div className="flex bg-secondary rounded-lg p-1">
            {[
              { id: 'daily', label: 'Diária', icon: CalendarIcon },
              { id: 'weekly', label: 'Semanal', icon: CalendarDays },
              { id: 'monthly', label: 'Mensal', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={rateView === id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRateView(id as RateView)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 via-background to-background border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarifa Média</p>
                <p className="text-2xl font-bold">R$ {stats.avgPrice.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Tarifa</p>
                <p className="text-2xl font-bold">R$ {stats.maxPrice.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-background to-background border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selecionadas</p>
                <p className="text-2xl font-bold">{selectedRooms.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 via-background to-background border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Unidades</p>
                <p className="text-2xl font-bold">{totalUnits}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-rose-500/10 via-background to-background border-rose-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Propriedades</p>
                <p className="text-2xl font-bold">{propertiesData?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions Panel */}
        <Card className="p-6 bg-gradient-to-br from-card via-card to-muted/20 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Alteração em Massa</h3>
              <p className="text-sm text-muted-foreground">Aplique mudanças em múltiplas unidades ({rateView})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Período</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 h-11">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Preço Fixo (R$)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0,00"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="h-11"
                />
                <Button onClick={handleBulkPriceUpdate} className="h-11 px-4 bg-gradient-to-r from-blue-500 to-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ajuste Percentual (%)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="10"
                  value={bulkPercentage}
                  onChange={(e) => setBulkPercentage(e.target.value)}
                  className="h-11"
                />
                <Button
                  onClick={() => handlePercentageUpdate(true)}
                  className="h-11 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handlePercentageUpdate(false)}
                  variant="destructive"
                  className="h-11 px-3"
                >
                  <TrendingDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Ações Rápidas</label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSelectAllRooms} className="flex-1 h-11 gap-2">
                  <Filter className="w-4 h-4" />
                  {selectedRooms.length === totalUnits ? "Limpar" : "Todos"}
                </Button>
                <Button variant="outline" onClick={() => setLocalPrices({})} className="h-11 px-3">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Grid */}
        <Card className="overflow-hidden border-border/50">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                  setDateRange({
                    from: addDays(dateRange.from, -(daysDiff + 1)),
                    to: addDays(dateRange.to, -(daysDiff + 1))
                  });
                  setStartDate(addDays(dateRange.from, -(daysDiff + 1)));
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newFrom = new Date(e.target.value);
                    setDateRange({
                      from: newFrom,
                      to: dateRange.to
                    });
                    setStartDate(newFrom);
                  }}
                  className="w-36 h-8 border-0 bg-transparent"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="date"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newTo = new Date(e.target.value);
                    setDateRange({
                      from: dateRange.from,
                      to: newTo
                    });
                  }}
                  className="w-36 h-8 border-0 bg-transparent"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
                  setDateRange({
                    from: addDays(dateRange.from, daysDiff + 1),
                    to: addDays(dateRange.to, daysDiff + 1)
                  });
                  setStartDate(addDays(dateRange.from, daysDiff + 1));
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    from: today,
                    to: addDays(today, 6)
                  });
                  setStartDate(today);
                }}
              >
                Próximos 7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    from: today,
                    to: addDays(today, 13)
                  });
                  setStartDate(today);
                }}
              >
                Próximos 14 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateRange({
                    from: today,
                    to: addDays(today, 29)
                  });
                  setStartDate(today);
                }}
              >
                Próximos 30 dias
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="sticky left-0 z-10 bg-muted/50 backdrop-blur-sm p-3 text-left min-w-[220px] border-r border-border/30">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedRooms.length === totalUnits && totalUnits > 0}
                        onCheckedChange={handleSelectAllRooms}
                      />
                      <span className="text-sm font-medium">Unidade</span>
                    </div>
                  </th>
                  {visibleDates.map((date) => {
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const isInRange = isDateInRange(date);
                    return (
                      <th
                        key={date.toISOString()}
                        className={cn(
                          "p-2 text-center min-w-[90px] border-r border-border/30",
                          isWeekend && "bg-amber-500/5",
                          isInRange && "bg-primary/5"
                        )}
                      >
                        <div className="text-xs text-muted-foreground">
                          {format(date, "EEE", { locale: ptBR })}
                        </div>
                        <div className={cn(
                          "text-sm font-semibold",
                          isWeekend && "text-amber-600",
                          isSameDay(date, new Date()) && "text-primary"
                        )}>
                          {format(date, "dd")}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category: any) => {
                  const typeConfig = propertyTypeConfig[category.propertyType as keyof typeof propertyTypeConfig];
                  const TypeIcon = typeConfig?.icon || Hotel;
                  return (
                    <React.Fragment key={category.id}>
                      <tr className="bg-gradient-to-r from-muted/50 to-transparent">
                        <td
                          colSpan={visibleDates.length + 1}
                          className="sticky left-0 z-10 p-3 bg-gradient-to-r from-muted/50 to-transparent backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={category.rooms.every((r: any) => selectedRooms.includes(r.id))}
                              onCheckedChange={() => handleSelectCategory(category.id)}
                            />
                            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", category.color)}>
                              <category.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{category.propertyName}</span>
                              <span className="text-xs text-muted-foreground">{category.roomTypeName}</span>
                            </div>
                            <Badge variant="secondary" className={`text-xs ${typeConfig?.bgColor}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeConfig?.label}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {category.rooms.length} unid.
                            </Badge>
                          </div>
                        </td>
                      </tr>
                      {category.rooms.map((room: any) => (
                        <tr key={room.id} className="hover:bg-muted/20 transition-colors">
                          <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-sm p-3 border-r border-border/30">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedRooms.includes(room.id)}
                                onCheckedChange={() => handleSelectRoom(room.id)}
                              />
                              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm", category.bgColor, category.borderColor, "border")}>
                                {room.number}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">Unid. {room.number}</span>
                                <span className="text-xs text-muted-foreground">{room.capacity} hósp.</span>
                              </div>
                            </div>
                          </td>
                          {visibleDates.map((date) => {
                            const dateStr = format(date, "yyyy-MM-dd");
                            const priceData = localPrices[room.id]?.[dateStr];
                            const price = priceData?.[rateView] || getBasePrice(room.id);
                            const variation = getPriceVariation(room.id, dateStr);
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            const isInRange = isDateInRange(date);
                            const isEditing = editingCell?.unitId === room.id && editingCell?.date === dateStr;

                            return (
                              <td
                                key={dateStr}
                                className={cn(
                                  "p-1 text-center border-r border-border/30 cursor-pointer transition-all",
                                  isWeekend && "bg-amber-500/5",
                                  isInRange && selectedRooms.includes(room.id) && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                                  !isEditing && "hover:bg-muted/50"
                                )}
                                onClick={() => !isEditing && handleCellEdit(room.id, dateStr)}
                              >
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={handleCellSave}
                                    onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                                    className="h-8 text-center text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="flex flex-col items-center py-1">
                                    <span className="text-sm font-semibold">
                                      R$ {price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
                                    </span>
                                    {variation !== 0 && (
                                      <span className={cn(
                                        "text-[10px] font-medium flex items-center gap-0.5",
                                        variation > 0 ? "text-emerald-500" : "text-red-500"
                                      )}>
                                        {variation > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                        {Math.abs(variation).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border/50 bg-muted/20 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
              <span className="text-muted-foreground">Fim de Semana</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20 border border-primary/40" />
              <span className="text-muted-foreground">Período Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-muted-foreground">Acima do Base</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-muted-foreground">Abaixo do Base</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Clique em uma célula para editar</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import React from "react";
