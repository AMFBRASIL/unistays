import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Thermometer,
  Zap,
  Droplets,
  Wind,
  Sun,
  Moon,
  Lightbulb,
  Wifi,
  Activity,
  TrendingDown,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Filter,
  BedDouble,
  Building,
  DoorOpen,
  Power,
  Gauge,
  Timer,
  Target,
  BarChart3,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  MoreVertical,
  Sparkles,
  MapPin,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { NewDeviceModal } from "@/components/energy/NewDeviceModal";
import { EnergySettingsModal } from "@/components/energy/EnergySettingsModal";

const energyStats = {
  totalConsumption: 12450,
  savings: 18,
  connectedDevices: 156,
  activeAutomations: 12,
  carbonReduction: 2.4,
  avgTemperature: 22,
  occupiedRooms: 78,
  efficiency: 94,
};

const consumptionData = [
  { hour: "00:00", kwh: 180, baseline: 220 },
  { hour: "04:00", kwh: 120, baseline: 180 },
  { hour: "08:00", kwh: 280, baseline: 320 },
  { hour: "12:00", kwh: 450, baseline: 520 },
  { hour: "16:00", kwh: 380, baseline: 440 },
  { hour: "20:00", kwh: 320, baseline: 380 },
  { hour: "23:00", kwh: 220, baseline: 260 },
];

const distributionData = [
  { name: "HVAC", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Iluminação", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Equipamentos", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Aquecimento", value: 12, color: "hsl(var(--chart-4))" },
];

const rooms = [
  { id: 1, number: "101", floor: 1, status: "occupied", temperature: 22, setpoint: 22, hvac: true, lights: 40, motion: true },
  { id: 2, number: "102", floor: 1, status: "vacant", temperature: 24, setpoint: 26, hvac: false, lights: 0, motion: false },
  { id: 3, number: "103", floor: 1, status: "occupied", temperature: 21, setpoint: 21, hvac: true, lights: 80, motion: true },
  { id: 4, number: "201", floor: 2, status: "occupied", temperature: 23, setpoint: 22, hvac: true, lights: 60, motion: false },
  { id: 5, number: "202", floor: 2, status: "vacant", temperature: 25, setpoint: 26, hvac: false, lights: 0, motion: false },
  { id: 6, number: "203", floor: 2, status: "maintenance", temperature: 20, setpoint: 20, hvac: false, lights: 100, motion: true },
  { id: 7, number: "301", floor: 3, status: "occupied", temperature: 22, setpoint: 22, hvac: true, lights: 50, motion: true },
  { id: 8, number: "302", floor: 3, status: "occupied", temperature: 21, setpoint: 21, hvac: true, lights: 70, motion: true },
];

const sensors = [
  { id: 1, type: "temperature", location: "Lobby", value: 23, unit: "°C", status: "normal", icon: Thermometer },
  { id: 2, type: "humidity", location: "Lobby", value: 55, unit: "%", status: "normal", icon: Droplets },
  { id: 3, type: "co2", location: "Restaurante", value: 680, unit: "ppm", status: "warning", icon: Wind },
  { id: 4, type: "light", location: "Área Externa", value: 850, unit: "lux", status: "normal", icon: Sun },
  { id: 5, type: "motion", location: "Corredor 2º andar", value: "Ativo", unit: "", status: "active", icon: Users },
  { id: 6, type: "power", location: "Quadro Principal", value: 42, unit: "kW", status: "normal", icon: Zap },
];

const automations = [
  { id: 1, name: "Check-out Automático", description: "Desliga HVAC e luzes após check-out", status: "active", triggers: 45 },
  { id: 2, name: "Modo Noturno", description: "Reduz iluminação externa após 23h", status: "active", triggers: 30 },
  { id: 3, name: "Pré-aquecimento", description: "Liga HVAC 30min antes do check-in", status: "active", triggers: 28 },
  { id: 4, name: "Sensor de Presença", description: "Ajusta HVAC baseado em ocupação", status: "active", triggers: 156 },
  { id: 5, name: "Economia Pico", description: "Reduz consumo em horários de pico", status: "paused", triggers: 12 },
];

export default function EnergyManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
  const [isNewDeviceModalOpen, setIsNewDeviceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleToggleDevice = (roomId: number, device: string) => {
    toast({
      title: "Dispositivo Atualizado",
      description: `${device} do quarto foi alterado.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied": return "bg-green-500";
      case "vacant": return "bg-gray-500";
      case "maintenance": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              Gestão de Energia & IoT
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle inteligente de termostatos, sensores e automações
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              onClick={() => setIsNewDeviceModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Dispositivo
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-yellow-500/10 w-fit mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.totalConsumption.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">kWh Hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500">-{energyStats.savings}%</p>
              <p className="text-xs text-muted-foreground">Economia</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-2">
                <Wifi className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.connectedDevices}</p>
              <p className="text-xs text-muted-foreground">Dispositivos</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.activeAutomations}</p>
              <p className="text-xs text-muted-foreground">Automações</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 w-fit mb-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.carbonReduction}t</p>
              <p className="text-xs text-muted-foreground">CO₂ Evitado</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 w-fit mb-2">
                <Thermometer className="w-4 h-4 text-cyan-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.avgTemperature}°C</p>
              <p className="text-xs text-muted-foreground">Temp. Média</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-orange-500/10 w-fit mb-2">
                <BedDouble className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.occupiedRooms}%</p>
              <p className="text-xs text-muted-foreground">Ocupação</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-white/10">
            <CardContent className="pt-4">
              <div className="p-2 rounded-lg bg-teal-500/10 w-fit mb-2">
                <Activity className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-2xl font-bold">{energyStats.efficiency}%</p>
              <p className="text-xs text-muted-foreground">Eficiência</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-white/10 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BedDouble className="w-4 h-4 mr-2" />
              Quartos
            </TabsTrigger>
            <TabsTrigger value="sensors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Sensores
            </TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Automações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Consumption Chart */}
              <Card className="lg:col-span-2 bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Consumo de Energia</CardTitle>
                      <CardDescription>Comparativo com baseline</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Atual
                      </Badge>
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                        <div className="w-2 h-2 rounded-full bg-gray-500 mr-2" />
                        Baseline
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={consumptionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="baseline"
                          stroke="hsl(var(--muted-foreground))"
                          fill="hsl(var(--muted-foreground))"
                          fillOpacity={0.1}
                        />
                        <Area
                          type="monotone"
                          dataKey="kwh"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution */}
              <Card className="bg-card/50 backdrop-blur-xl border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Distribuição por Área</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {distributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium ml-auto">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`bg-card/50 backdrop-blur-xl border-white/10 cursor-pointer transition-all hover:border-primary/30 ${selectedRoom?.id === room.id ? 'border-primary/50' : ''
                    }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">Quarto {room.number}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)}`} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-cyan-500" />
                          <span className="text-sm">Temperatura</span>
                        </div>
                        <span className="font-medium">{room.temperature}°C</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Setpoint</span>
                        </div>
                        <span className="font-medium">{room.setpoint}°C</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">HVAC</span>
                        </div>
                        <Switch checked={room.hvac} onCheckedChange={() => handleToggleDevice(room.id, "HVAC")} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Luzes</span>
                        </div>
                        <span className="text-sm font-medium">{room.lights}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Presença</span>
                        </div>
                        <Badge variant="outline" className={room.motion ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}>
                          {room.motion ? "Detectado" : "Vazio"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sensors Tab */}
          <TabsContent value="sensors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sensors.map((sensor) => (
                <Card key={sensor.id} className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sensor.status === 'warning' ? 'bg-amber-500/20' :
                          sensor.status === 'active' ? 'bg-green-500/20' : 'bg-blue-500/20'
                          }`}>
                          <sensor.icon className={`w-5 h-5 ${sensor.status === 'warning' ? 'text-amber-500' :
                            sensor.status === 'active' ? 'text-green-500' : 'text-blue-500'
                            }`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{sensor.type}</p>
                          <p className="text-sm text-muted-foreground">{sensor.location}</p>
                        </div>
                      </div>
                      {sensor.status === 'warning' && (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold">{sensor.value}</p>
                        <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                      </div>
                      <Badge variant="outline" className={
                        sensor.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                          sensor.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }>
                        {sensor.status === 'warning' ? 'Alerta' : sensor.status === 'active' ? 'Ativo' : 'Normal'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automations.map((automation) => (
                <Card key={automation.id} className="bg-card/50 backdrop-blur-xl border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${automation.status === 'active' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                          <Sparkles className={`w-5 h-5 ${automation.status === 'active' ? 'text-green-500' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{automation.name}</h4>
                          <p className="text-sm text-muted-foreground">{automation.description}</p>
                        </div>
                      </div>
                      <Switch checked={automation.status === 'active'} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-sm text-muted-foreground">
                        {automation.triggers} execuções este mês
                      </span>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Suggestion */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <Sparkles className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Sugestão de Otimização</h3>
                    <p className="text-sm text-muted-foreground">
                      Detectamos que os quartos desocupados mantêm temperatura de 24°C. Aumentar para 26°C pode gerar economia de R$ 450/mês.
                    </p>
                  </div>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NewDeviceModal
        open={isNewDeviceModalOpen}
        onOpenChange={setIsNewDeviceModalOpen}
      />

      <EnergySettingsModal
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
      />
    </DashboardLayout>
  );
}
