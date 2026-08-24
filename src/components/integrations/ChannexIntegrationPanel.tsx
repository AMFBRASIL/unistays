import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Loader2,
  Plug,
  RefreshCw,
  Trash2,
  ExternalLink,
  Shield,
  Building2,
  Calendar,
  AlertTriangle,
  KeyRound,
  Link2,
  Unlink,
  Copy,
  Download,
  Wifi,
  WifiOff,
  Upload,
  DollarSign,
  Plus,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectionChange?: () => void;
}

interface ConnectionRow {
  id: number;
  uuid: string;
  name: string;
  status: string;
  settings: Record<string, unknown>;
  lastSyncAt: string | null;
  lastError: string | null;
  hasCredentials: boolean;
  webhookUrl?: string | null;
}

interface RoomTypeRow {
  externalId: string;
  title: string;
  propertyExternalId: string;
  countOfRooms: number;
}

interface MappingRow {
  id: number;
  localId: number;
  externalId: string;
}

interface UnitOption {
  id: number;
  number: string;
  name?: string | null;
  propertyName?: string;
  propertyId?: number;
  roomTypeId?: number | null;
}

interface PropertyOption {
  id: number;
  name: string;
}

const ADD_UNIT = "__add__";

export function ChannexIntegrationPanel({ open, onOpenChange, onConnectionChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connection, setConnection] = useState<ConnectionRow | null>(null);
  const [name, setName] = useState("Channex — Channel Manager");
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"staging" | "production">("staging");
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [activeTab, setActiveTab] = useState("connection");
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [provisionPropertyId, setProvisionPropertyId] = useState<string>("");
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [savingMapId, setSavingMapId] = useState<string | null>(null);
  const [registeringWebhook, setRegisteringWebhook] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [syncingAvail, setSyncingAvail] = useState(false);
  const [syncingRates, setSyncingRates] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [doctoring, setDoctoring] = useState(false);
  const [doctorResult, setDoctorResult] = useState<{
    ok: boolean;
    checks: Array<{ name: string; ok: boolean; detail: string }>;
  } | null>(null);

  const isConnected = connection?.status === "connected";

  const modules = useMemo(() => {
    const m = (connection?.settings?.modules || {}) as Record<string, boolean>;
    return {
      reservations: m.reservations !== false,
      availability: m.availability !== false,
      rates: m.rates !== false,
    };
  }, [connection?.settings]);

  const webhookUrl =
    connection?.webhookUrl ||
    (connection?.settings?.channexWebhookUrl as string) ||
    "";
  const webhookIsLocal = /localhost|127\.0\.0\.1/.test(webhookUrl);

  const mappingsByExternal = useMemo(() => {
    const map = new Map<string, MappingRow[]>();
    mappings.forEach((m) => {
      const list = map.get(m.externalId) || [];
      list.push(m);
      map.set(m.externalId, list);
    });
    return map;
  }, [mappings]);

  const mappedUnitIds = useMemo(() => new Set(mappings.map((m) => m.localId)), [mappings]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrationConnections({ provider: "channex" });
      if (res.success && res.data?.connections?.length) {
        const current = res.data.connections[0] as ConnectionRow;
        setConnection(current);
        setName(current.name);
        const env = current.settings?.environment;
        setEnvironment(env === "production" ? "production" : "staging");
        setShowTokenForm(current.status !== "connected");
      } else {
        setConnection(null);
        setShowTokenForm(true);
      }
    } catch {
      toast.error("Falha ao carregar conexão Channex");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMappings = async (connectionId: number) => {
    const mapRes = await api.getIntegrationMappings(connectionId, "unit");
    if (mapRes.success && mapRes.data?.mappings) {
      setMappings(
        mapRes.data.mappings.map((m) => ({
          id: m.id,
          localId: m.localId,
          externalId: m.externalId,
        })),
      );
    }
  };

  const loadInventory = async (connectionId: number) => {
    setLoadingInventory(true);
    try {
      const [rtRes, mapRes, unitsRes, propsRes] = await Promise.all([
        api.getIntegrationExternalRoomTypes(connectionId),
        api.getIntegrationMappings(connectionId, "unit"),
        api.getUnits(),
        api.getProperties(),
      ]);
      if (rtRes.success && rtRes.data?.roomTypes) {
        setRoomTypes(rtRes.data.roomTypes);
      } else {
        setRoomTypes([]);
        toast.error(rtRes.error?.message || "Falha ao listar room types Channex");
      }
      if (mapRes.success && mapRes.data?.mappings) {
        setMappings(
          mapRes.data.mappings.map((m) => ({
            id: m.id,
            localId: m.localId,
            externalId: m.externalId,
          })),
        );
      }
      if (unitsRes.success && unitsRes.data?.units) {
        setUnits(
          (unitsRes.data.units as any[]).map((u) => ({
            id: Number(u.id),
            number: String(u.number || ""),
            name: u.name || null,
            propertyName: u.property?.name,
            propertyId: u.propertyId != null ? Number(u.propertyId) : undefined,
            roomTypeId: u.roomTypeId != null ? Number(u.roomTypeId) : null,
          })),
        );
      }
      if (propsRes.success && propsRes.data?.properties) {
        const list = (propsRes.data.properties as any[]).map((p) => ({
          id: Number(p.id),
          name: String(p.name || `Property ${p.id}`),
        }));
        setProperties(list);
        if (!provisionPropertyId && list.length) {
          setProvisionPropertyId(String(list[0].id));
        }
      }
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (open) {
      setApiKey("");
      setActiveTab("connection");
      void load();
    }
  }, [open, load]);

  useEffect(() => {
    if (open && connection?.status === "connected") {
      void loadInventory(connection.id);
    } else {
      setRoomTypes([]);
      setMappings([]);
    }
  }, [open, connection?.id, connection?.status]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast.error("Informe a API Key da Channex");
      return;
    }
    setSaving(true);
    try {
      if (connection) {
        const res = await api.updateIntegrationConnection(connection.id, {
          name,
          accessToken: apiKey.trim(),
          settings: { environment, modules },
        });
        if (!res.success) {
          toast.error(res.error?.message || "Falha ao atualizar");
          return;
        }
        toast.success("Conexão Channex atualizada");
      } else {
        const res = await api.createIntegrationConnection({
          providerCode: "channex",
          name: name.trim() || "Channex — Channel Manager",
          accessToken: apiKey.trim(),
          settings: {
            environment,
            modules: { reservations: true, availability: true, rates: true },
          },
        });
        if (!res.success) {
          toast.error(res.error?.message || "Falha ao conectar Channex");
          return;
        }
        toast.success("Channex conectada");
      }
      setApiKey("");
      setShowTokenForm(false);
      await load();
      onConnectionChange?.();
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    if (!window.confirm("Desconectar Channex? Mappings serão removidos.")) return;
    setSaving(true);
    try {
      await api.deleteIntegrationConnection(connection.id);
      toast.success("Channex desconectada");
      setConnection(null);
      onConnectionChange?.();
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnitToRoomType = async (rt: RoomTypeRow, unitIdStr: string) => {
    if (!connection || unitIdStr === ADD_UNIT) return;
    setSavingMapId(rt.externalId);
    try {
      const res = await api.upsertIntegrationMapping(connection.id, {
        localId: Number(unitIdStr),
        externalId: rt.externalId,
        externalLabel: rt.title,
        metadata: { channexPropertyId: rt.propertyExternalId },
      });
      if (!res.success) {
        toast.error(res.error?.message || "Falha ao vincular");
        return;
      }
      toast.success("Unit adicionada ao room type (inventário compartilhado)");
      await refreshMappings(connection.id);
    } finally {
      setSavingMapId(null);
    }
  };

  const handleRemoveUnitMapping = async (mapping: MappingRow) => {
    if (!connection) return;
    setSavingMapId(mapping.externalId);
    try {
      await api.deleteIntegrationMapping(connection.id, mapping.id);
      toast.success("Vínculo removido");
      await refreshMappings(connection.id);
    } finally {
      setSavingMapId(null);
    }
  };

  const handleToggleModule = async (
    key: "reservations" | "availability" | "rates",
    value: boolean,
  ) => {
    if (!connection) return;
    setSaving(true);
    try {
      const next = { ...modules, [key]: value };
      await api.updateIntegrationConnection(connection.id, {
        settings: { environment, modules: next },
      });
      toast.success(value ? `Módulo ${key} ligado` : `Módulo ${key} desligado`);
      await load();
      if (key === "reservations" && value) {
        await api.registerIntegrationWebhook(connection.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterWebhook = async () => {
    if (!connection) return;
    setRegisteringWebhook(true);
    try {
      const res = await api.registerIntegrationWebhook(connection.id);
      if (res.data?.registered) toast.success(res.data.message || "Webhook registrado");
      else toast.message(res.data?.message || "Não registrado — confira API_PUBLIC_URL");
      await load();
    } finally {
      setRegisteringWebhook(false);
    }
  };

  const handlePullBookings = async () => {
    if (!connection) return;
    setPulling(true);
    try {
      const res = await api.pullIntegrationBookings(connection.id);
      if (res.success) toast.success(res.data?.message || "Feed processado");
      else toast.error(res.error?.message || "Falha no pull");
      await load();
    } finally {
      setPulling(false);
    }
  };

  const handleSyncAvailability = async () => {
    if (!connection) return;
    setSyncingAvail(true);
    try {
      const res = await api.syncIntegrationAvailability(connection.id, { daysAhead: 90 });
      if (res.success) toast.success(res.data?.message || "Disponibilidade enviada");
      else toast.error(res.error?.message || "Falha no sync");
    } finally {
      setSyncingAvail(false);
    }
  };

  const handleSyncRates = async () => {
    if (!connection) return;
    setSyncingRates(true);
    try {
      const res = await api.syncIntegrationRates(connection.id, { daysAhead: 90 });
      if (res.success) toast.success(res.data?.message || "Rates enviados");
      else toast.error(res.error?.message || "Falha no sync de rates");
    } finally {
      setSyncingRates(false);
    }
  };

  const handleDoctor = async () => {
    if (!connection) return;
    setDoctoring(true);
    try {
      const res = await api.doctorIntegration(connection.id);
      if (res.success && res.data) {
        setDoctorResult(res.data);
        if (res.data.ok) toast.success("Doctor OK — integração saudável");
        else toast.message("Doctor encontrou problemas — veja o relatório");
      } else {
        toast.error(res.error?.message || "Falha no doctor");
      }
    } finally {
      setDoctoring(false);
    }
  };

  const handleRecover = async () => {
    if (!connection) return;
    const since = window.prompt(
      "Recovery após outage (>30 min). Informe início ISO (ex. 2026-08-06T12:00:00Z):",
      new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    );
    if (!since?.trim()) return;
    setPulling(true);
    try {
      const res = await api.recoverIntegrationBookings(connection.id, {
        insertedAtGte: since.trim(),
      });
      if (res.success) toast.success(res.data?.message || "Recovery concluído");
      else toast.error(res.error?.message || "Falha no recovery");
    } finally {
      setPulling(false);
    }
  };

  const handleProvision = async () => {
    if (!connection || !provisionPropertyId) {
      toast.error("Selecione uma property Unistays");
      return;
    }
    if (
      !window.confirm(
        "Criar Property + Room Types + Rate Plans na Channex a partir desta property e mapear todas as units?",
      )
    ) {
      return;
    }
    setProvisioning(true);
    try {
      const res = await api.provisionIntegrationFromUnistays(connection.id, {
        propertyId: Number(provisionPropertyId),
        daysAhead: 90,
        currency: "BRL",
      });
      if (!res.success) {
        toast.error(res.error?.message || "Falha no provisionamento");
        return;
      }
      const d = res.data;
      toast.success(
        `Criado: ${d?.roomTypesCreated} room type(s), ${d?.ratePlansCreated} rate plan(s), ${d?.unitsMapped} unit(s)`,
      );
      await loadInventory(connection.id);
      setActiveTab("inventory");
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              CX
            </div>
            <div>
              <div className="flex items-center gap-2">
                Painel Channex
                {connection ? (
                  <Badge variant="outline" className="text-xs gap-1">
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isConnected ? "Conectado" : connection.status}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Não conectado</Badge>
                )}
              </div>
              <p className="text-sm font-normal text-muted-foreground">
                Channel Manager PMS — Booking.com, Airbnb, Expedia e outros via{" "}
                <a
                  href="https://docs.channex.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline inline-flex items-center gap-0.5"
                >
                  Channex.io
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-3">
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="connection" className="gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Conexão
                </TabsTrigger>
                <TabsTrigger value="provision" disabled={!connection} className="gap-1.5">
                  <Rocket className="w-3.5 h-3.5" />
                  Provisionar
                </TabsTrigger>
                <TabsTrigger value="inventory" disabled={!connection} className="gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Room Types
                </TabsTrigger>
                <TabsTrigger value="modules" disabled={!connection} className="gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Módulos
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="max-h-[62vh] px-6 py-4">
              <TabsContent value="connection" className="mt-0 space-y-4">
                {connection && isConnected && (
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-semibold">Channex conectada</p>
                          <p className="text-sm text-muted-foreground">
                            {connection.name} · ambiente{" "}
                            {String(connection.settings?.environment || environment)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("provision")}>
                          Provisionar property
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("inventory")}>
                          Mapear room types
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={pulling}
                          onClick={() => void handlePullBookings()}
                        >
                          {pulling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          Puxar reservas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={syncingAvail}
                          onClick={() => void handleSyncAvailability()}
                        >
                          {syncingAvail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Sync disponibilidade
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={syncingRates}
                          onClick={() => void handleSyncRates()}
                        >
                          {syncingRates ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
                          Sync rates
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={doctoring}
                          onClick={() => void handleDoctor()}
                        >
                          {doctoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                          Doctor
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={pulling}
                          onClick={() => void handleRecover()}
                        >
                          Recovery bookings
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowTokenForm((v) => !v)}>
                          Atualizar API Key
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600"
                          onClick={() => void handleDisconnect()}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Desconectar
                        </Button>
                      </div>
                      {connection.lastError && (
                        <div className="text-sm text-rose-700 flex gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {connection.lastError}
                        </div>
                      )}
                      {doctorResult && (
                        <div className="rounded-lg border p-3 space-y-2 text-sm">
                          <p className="font-medium">
                            Doctor {doctorResult.ok ? "✓ saudável" : "⚠ com alertas"}
                          </p>
                          {doctorResult.checks.map((c) => (
                            <div key={c.name} className="flex gap-2">
                              <span className={c.ok ? "text-emerald-600" : "text-amber-700"}>
                                {c.ok ? "OK" : "!!"}
                              </span>
                              <span>
                                <code className="text-xs">{c.name}</code> — {c.detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {(!connection || showTokenForm) && (
                  <div className="space-y-4">
                    <Card className="border-teal-500/20 bg-teal-500/5">
                      <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
                        <p>
                          1. Crie conta no{" "}
                          <a
                            href="https://staging.channex.io/"
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-teal-700"
                          >
                            staging Channex
                          </a>{" "}
                          (ou produção).
                        </p>
                        <p>2. Gere uma API Key no perfil do usuário.</p>
                        <p>
                          3. Defina <code className="text-xs">API_PUBLIC_URL</code> no backend
                          (HTTPS público) para webhooks.
                        </p>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ambiente</Label>
                      <Select
                        value={environment}
                        onValueChange={(v) => setEnvironment(v as "staging" | "production")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staging">Staging (staging.channex.io)</SelectItem>
                          <SelectItem value="production">Produção (app.channex.io)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole a user-api-key"
                        autoComplete="off"
                      />
                    </div>
                    <Button
                      onClick={() => void handleConnect()}
                      disabled={saving || !apiKey.trim()}
                      className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />}
                      {connection ? "Salvar API Key" : "Conectar Channex"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="provision" className="mt-0 space-y-4">
                <div>
                  <h4 className="font-medium">Criar inventário na Channex via API</h4>
                  <p className="text-sm text-muted-foreground">
                    Cria Property, Room Types (agrupados por tipo Unistays), Rate Plan BAR e mapeia
                    N units → 1 room type. Em seguida envia disponibilidade e rates (90 dias).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Property Unistays</Label>
                  <Select value={provisionPropertyId} onValueChange={setProvisionPropertyId}>
                    <SelectTrigger>
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
                <Button
                  className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white"
                  disabled={provisioning || !provisionPropertyId}
                  onClick={() => void handleProvision()}
                >
                  {provisioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  Provisionar na Channex
                </Button>
              </TabsContent>

              <TabsContent value="inventory" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium">Room Types ↔ Units (inventário compartilhado)</h4>
                    <p className="text-sm text-muted-foreground">
                      Várias units no mesmo room type = hotel (ex.: 14 quartos Standard). Contagem
                      livre é enviada à Channex. VR/apto: 1 unit por room type.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingInventory || !connection}
                    onClick={() => connection && void loadInventory(connection.id)}
                  >
                    {loadingInventory ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>

                {loadingInventory ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                ) : roomTypes.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground space-y-3">
                      <p>Nenhum room type na Channex.</p>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("provision")}>
                        Provisionar a partir do Unistays
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {roomTypes.map((rt) => {
                      const linked = mappingsByExternal.get(rt.externalId) || [];
                      const savingRow = savingMapId === rt.externalId;
                      const availableUnits = units.filter((u) => !mappedUnitIds.has(u.id));
                      return (
                        <Card key={rt.externalId}>
                          <CardContent className="p-3 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{rt.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  qty Channex {rt.countOfRooms} · mapeadas {linked.length} ·{" "}
                                  {rt.externalId.slice(0, 8)}…
                                </p>
                              </div>
                              {linked.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    linked.length > 1 ? "text-teal-700" : "text-emerald-700",
                                  )}
                                >
                                  <Link2 className="w-3 h-3 mr-1" />
                                  {linked.length > 1 ? `Compartilhado (${linked.length})` : "1:1"}
                                </Badge>
                              )}
                            </div>

                            {linked.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {linked.map((m) => {
                                  const u = units.find((x) => x.id === m.localId);
                                  return (
                                    <Badge
                                      key={m.id}
                                      variant="secondary"
                                      className="gap-1 pr-1 font-normal"
                                    >
                                      {u
                                        ? [u.propertyName, u.name || `Unit ${u.number}`]
                                            .filter(Boolean)
                                            .join(" · ")
                                        : `Unit #${m.localId}`}
                                      <button
                                        type="button"
                                        className="ml-1 rounded p-0.5 hover:bg-rose-100 text-rose-600"
                                        disabled={savingRow}
                                        onClick={() => void handleRemoveUnitMapping(m)}
                                        aria-label="Remover vínculo"
                                      >
                                        <Unlink className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}

                            <Select
                              value={ADD_UNIT}
                              onValueChange={(v) => void handleAddUnitToRoomType(rt, v)}
                              disabled={savingRow || availableUnits.length === 0}
                            >
                              <SelectTrigger className="sm:w-[280px]">
                                <SelectValue placeholder="Adicionar unit…" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ADD_UNIT} disabled>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Plus className="w-3.5 h-3.5" /> Adicionar unit…
                                  </span>
                                </SelectItem>
                                {availableUnits.map((u) => (
                                  <SelectItem key={u.id} value={String(u.id)}>
                                    {[u.propertyName, u.name || `Unit ${u.number}`]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="modules" className="mt-0 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Fluxo oficial Channex: ARI OUT (availability + rates/restrictions) e Booking
                  Revisions Feed IN com ACK. Webhook só notifica — o Unistays puxa o feed.
                </p>

                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div className="flex-1">
                      <p className="font-medium">Disponibilidade (outbound)</p>
                      <p className="text-xs text-muted-foreground">
                        Contagem de units livres → POST /availability
                      </p>
                    </div>
                    <Switch
                      checked={modules.availability}
                      onCheckedChange={(v) => void handleToggleModule("availability", v)}
                      disabled={saving}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    <div className="flex-1">
                      <p className="font-medium">Rates / restrictions (outbound)</p>
                      <p className="text-xs text-muted-foreground">
                        unit_rates → POST /restrictions (rate, min stay, stop sell)
                      </p>
                    </div>
                    <Switch
                      checked={modules.rates}
                      onCheckedChange={(v) => void handleToggleModule("rates", v)}
                      disabled={saving}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <div className="flex-1">
                      <p className="font-medium">Reservas (inbound)</p>
                      <p className="text-xs text-muted-foreground">
                        Webhook booking → feed → unit livre → ACK
                      </p>
                    </div>
                    <Switch
                      checked={modules.reservations}
                      onCheckedChange={(v) => void handleToggleModule("reservations", v)}
                      disabled={saving}
                    />
                  </CardContent>
                </Card>

                <Card className={webhookIsLocal ? "border-amber-500/40 bg-amber-500/5" : undefined}>
                  <CardContent className="p-4 space-y-3">
                    <p className="font-medium">Webhook Channex → Unistays</p>
                    {webhookIsLocal && (
                      <div className="text-sm text-amber-800 flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        URL local — a Channex não alcança. Defina{" "}
                        <code className="text-xs">API_PUBLIC_URL</code> com HTTPS público (ngrok /
                        cloudflared / produção) e registre o webhook de novo.
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input readOnly className="font-mono text-xs" value={webhookUrl || "—"} />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (webhookUrl) {
                            void navigator.clipboard.writeText(webhookUrl);
                            toast.success("URL copiada");
                          }
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={registeringWebhook || !modules.reservations}
                      onClick={() => void handleRegisterWebhook()}
                    >
                      {registeringWebhook ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plug className="w-4 h-4" />
                      )}
                      Registrar webhook global (event: booking)
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
