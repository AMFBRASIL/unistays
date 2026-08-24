import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '@/config/database';
import { env } from '@/config/env';
import { AppError } from '@/middlewares/error.middleware';
import { In, Not } from 'typeorm';
import { Reservation, ReservationStatus } from '@/entities/Reservation.entity';
import { Guest } from '@/entities/Guest.entity';
import { Unit, UnitStatus } from '@/entities/Unit.entity';
import { Property, PropertyType } from '@/entities/Property.entity';
import { RoomType } from '@/entities/RoomType.entity';
import { UnitRate } from '@/entities/UnitRate.entity';
import { ensureIntegrationSchema } from './ensureIntegrationSchema';
import { decryptCredentials, encryptCredentials } from './credentialVault';
import { ChannexAdapter } from './adapters/ChannexAdapter';
import { scheduleChannexPush } from './ChannexAriDebouncer';
import type {
  ChannelManagerAdapter,
  ExternalListingSummary,
  ExternalPropertySummary,
  ExternalReservationSummary,
  IntegrationConnection,
  IntegrationEntityMapping,
  IntegrationProvider,
  TestConnectionResult,
} from './types';

const CHANNEX_EXTERNAL_PREFIX = 'channex:';
const BLOCKING_UNIT_STATUSES = new Set<UnitStatus>([
  UnitStatus.MAINTENANCE,
  UnitStatus.BLOCKED,
]);

function toDateOnly(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Nights occupied: check-in inclusive, check-out exclusive → last blocked night = checkout - 1 day */
function stayNightRange(checkIn: Date | string, checkOut: Date | string): { startDate: string; endDate: string } | null {
  const start = toDateOnly(checkIn);
  const endExclusive = toDateOnly(checkOut);
  if (!start || !endExclusive || endExclusive <= start) return null;

  const endDateObj = new Date(`${endExclusive}T12:00:00`);
  endDateObj.setDate(endDateObj.getDate() - 1);
  const endDate = toDateOnly(endDateObj);
  if (endDate < start) return null;
  return { startDate: start, endDate };
}

function eachDateInclusive(startDate: string, endDate: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  while (cur <= end) {
    out.push(toDateOnly(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function collapseAvailabilityByDay(
  propertyExternalId: string,
  roomTypeExternalId: string,
  dayMap: Map<string, number>,
): Array<{
  property_id: string;
  room_type_id: string;
  date_from: string;
  date_to: string;
  availability: number;
}> {
  const dates = [...dayMap.keys()].sort();
  if (!dates.length) return [];

  const values: Array<{
    property_id: string;
    room_type_id: string;
    date_from: string;
    date_to: string;
    availability: number;
  }> = [];

  let rangeStart = dates[0];
  let prev = dates[0];
  let avail = dayMap.get(dates[0]) ?? 0;

  for (let i = 1; i < dates.length; i++) {
    const d = dates[i];
    const a = dayMap.get(d) ?? 0;
    const prevObj = new Date(`${prev}T12:00:00`);
    prevObj.setDate(prevObj.getDate() + 1);
    const expectedNext = toDateOnly(prevObj);
    if (d === expectedNext && a === avail) {
      prev = d;
      continue;
    }
    values.push({
      property_id: propertyExternalId,
      room_type_id: roomTypeExternalId,
      date_from: rangeStart,
      date_to: prev,
      availability: avail,
    });
    rangeStart = d;
    prev = d;
    avail = a;
  }

  values.push({
    property_id: propertyExternalId,
    room_type_id: roomTypeExternalId,
    date_from: rangeStart,
    date_to: prev,
    availability: avail,
  });
  return values;
}

function parseGuestName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = String(fullName || 'Hóspede Canal').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Hóspede', lastName: 'Canal' };
  if (parts.length === 1) return { firstName: parts[0], lastName: 'Canal' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function mapUnistaysPropertyType(type: PropertyType | string): string {
  switch (type) {
    case PropertyType.HOTEL:
      return 'hotel';
    case PropertyType.APART_HOTEL:
      return 'apart_hotel';
    case PropertyType.HOSTEL:
      return 'hostel';
    case PropertyType.RESORT:
      return 'resort';
    case PropertyType.LOFT:
    case PropertyType.TEMPORADA:
    default:
      return 'apartment';
  }
}

function countryToAlpha2(country?: string | null): string {
  const c = String(country || '').trim().toLowerCase();
  if (!c || c === 'brasil' || c === 'brazil' || c === 'br') return 'BR';
  if (c.length === 2) return c.toUpperCase();
  return 'BR';
}

function formatRateForChannex(amount: number): number {
  // Skill/api.md: writes use MINOR units (cents)
  return Math.max(1, Math.round(Number(amount) * 100));
}

function todayDateOnly(): string {
  return toDateOnly(new Date());
}

/** Never send past dates — Channex rejects them. */
function clampRangeToFuture(startDate: string, endDate: string): { startDate: string; endDate: string } | null {
  const today = todayDateOnly();
  const start = startDate < today ? today : startDate;
  if (endDate < today || endDate < start) return null;
  return { startDate: start, endDate };
}

function mapChannelBookingStatus(status: string): ReservationStatus {
  switch (String(status || '').toLowerCase()) {
    case 'accepted':
    case 'new':
    case 'modified':
      return ReservationStatus.CONFIRMED;
    case 'cancelled':
    case 'denied':
    case 'timeout':
      return ReservationStatus.CANCELLED;
    case 'wait_accept':
    case 'wait_pay':
    default:
      return ReservationStatus.PENDING;
  }
}

/**
 * Facade de Channel Manager / integrações externas.
 * Domínio Unistays usa só esta classe — adapters (Channex) ficam isolados.
 */
export class IntegrationService {
  private static adapters: Record<string, ChannelManagerAdapter> = {
    channex: new ChannexAdapter(),
  };

  static getAdapter(providerCode: string): ChannelManagerAdapter {
    const adapter = this.adapters[providerCode];
    if (!adapter) {
      throw new AppError(`Provedor de integração não suportado: ${providerCode}`, 400);
    }
    return adapter;
  }

  static buildWebhookUrl(connectionUuid: string, providerCode: string = 'channex'): string {
    const base = (env.API_PUBLIC_URL || `http://localhost:${env.PORT}`).replace(/\/$/, '');
    return `${base}/api/${env.API_VERSION}/integrations/webhooks/${providerCode}/${connectionUuid}`;
  }

  static async listProviders(): Promise<IntegrationProvider[]> {
    await ensureIntegrationSchema();
    const rows = await AppDataSource.query(
      `SELECT id, code, name, category, description, logo_url, is_active, capabilities
       FROM integration_providers
       WHERE is_active = 1
       ORDER BY category, name`,
    );

    return rows.map((row: any) => ({
      id: Number(row.id),
      code: row.code,
      name: row.name,
      category: row.category,
      description: row.description,
      logoUrl: row.logo_url,
      isActive: row.is_active === 1 || row.is_active === true,
      capabilities:
        typeof row.capabilities === 'string'
          ? JSON.parse(row.capabilities || '{}')
          : row.capabilities || {},
    }));
  }

  static async listConnections(params?: {
    providerCode?: string;
  }): Promise<IntegrationConnection[]> {
    await ensureIntegrationSchema();
    const where: string[] = [];
    const args: unknown[] = [];
    if (params?.providerCode) {
      where.push('p.code = ?');
      args.push(params.providerCode);
    }
    const sql = `
      SELECT c.*, p.code AS provider_code, p.name AS provider_name
      FROM integration_connections c
      INNER JOIN integration_providers p ON p.id = c.provider_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY c.updated_at DESC
    `;
    const rows = await AppDataSource.query(sql, args);
    return rows.map((row: any) => this.mapConnection(row));
  }

  static async getConnection(id: number): Promise<IntegrationConnection> {
    await ensureIntegrationSchema();
    const rows = await AppDataSource.query(
      `SELECT c.*, p.code AS provider_code, p.name AS provider_name
       FROM integration_connections c
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE c.id = ?
       LIMIT 1`,
      [id],
    );
    if (!rows.length) throw new AppError('Conexão de integração não encontrada', 404);
    return this.mapConnection(rows[0]);
  }

  static async getConnectionByUuid(uuid: string): Promise<IntegrationConnection & { credentialsEncrypted?: string }> {
    await ensureIntegrationSchema();
    const rows = await AppDataSource.query(
      `SELECT c.*, p.code AS provider_code, p.name AS provider_name
       FROM integration_connections c
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE c.uuid = ?
       LIMIT 1`,
      [uuid],
    );
    if (!rows.length) throw new AppError('Conexão de integração não encontrada', 404);
    return { ...this.mapConnection(rows[0]), credentialsEncrypted: rows[0].credentials_encrypted };
  }

  static async createConnection(input: {
    providerCode: string;
    name: string;
    propertyId?: number | null;
    accessToken: string;
    settings?: Record<string, unknown>;
    createdBy?: number | null;
  }): Promise<IntegrationConnection> {
    await ensureIntegrationSchema();
    const providers = await this.listProviders();
    const provider = providers.find((p) => p.code === input.providerCode);
    if (!provider) throw new AppError('Provedor não encontrado', 404);

    const environment = String(input.settings?.environment || 'staging');
    const adapter = this.getAdapter(input.providerCode);
    const test = await adapter.testConnection({
      accessToken: input.accessToken,
      apiKey: input.accessToken,
      environment,
    });
    if (!test.ok) {
      throw new AppError(test.message || 'Falha ao validar credenciais', 400);
    }

    const uuid = uuidv4();
    const credentials = encryptCredentials({
      accessToken: input.accessToken,
      apiKey: input.accessToken,
    });
    const settings = JSON.stringify({
      modules: {
        reservations: true,
        availability: true,
        rates: true,
        messages: false,
        reviews: false,
        ...(input.settings?.modules || {}),
      },
      ...input.settings,
      environment,
      lastTestPropertyCount: test.propertyCount ?? 0,
    });

    const result = await AppDataSource.query(
      `INSERT INTO integration_connections
        (uuid, provider_id, property_id, name, status, auth_type, credentials_encrypted, settings, last_sync_at, last_error, created_by)
       VALUES (?, ?, ?, ?, 'connected', 'access_token', ?, ?, NOW(), NULL, ?)`,
      [
        uuid,
        provider.id,
        input.propertyId ?? null,
        input.name,
        credentials,
        settings,
        input.createdBy ?? null,
      ],
    );

    const insertId = Number(result.insertId);
    await this.addSyncLog(insertId, {
      direction: 'outbound',
      module: 'connection',
      action: 'test_connection',
      status: 'success',
      responseSummary: { propertyCount: test.propertyCount, message: test.message },
    });

    try {
      if (input.providerCode === 'channex') {
        await this.ensureChannexWebhook(insertId);
      }
    } catch (err) {
      console.warn('[IntegrationService] webhook register skipped:', err);
    }

    return this.getConnection(insertId);
  }

  static async updateConnection(
    id: number,
    input: {
      name?: string;
      propertyId?: number | null;
      accessToken?: string;
      settings?: Record<string, unknown>;
      status?: string;
    },
  ): Promise<IntegrationConnection> {
    await ensureIntegrationSchema();
    const current = await this.getConnection(id);
    const adapter = this.getAdapter(current.providerCode);

    let credentialsBlob: string | null = null;
    if (input.accessToken?.trim()) {
      const environment = String(
        input.settings?.environment || current.settings?.environment || 'staging',
      );
      const test = await adapter.testConnection({
        accessToken: input.accessToken.trim(),
        apiKey: input.accessToken.trim(),
        environment,
      });
      if (!test.ok) throw new AppError(test.message || 'Token inválido', 400);
      credentialsBlob = encryptCredentials({
        accessToken: input.accessToken.trim(),
        apiKey: input.accessToken.trim(),
      });
    }

    let settings: string | null = null;
    if (input.settings != null) {
      const currentModules =
        current.settings?.modules && typeof current.settings.modules === 'object'
          ? (current.settings.modules as Record<string, unknown>)
          : {};
      const incomingModules =
        input.settings.modules && typeof input.settings.modules === 'object'
          ? (input.settings.modules as Record<string, unknown>)
          : {};
      settings = JSON.stringify({
        ...current.settings,
        ...input.settings,
        modules: { ...currentModules, ...incomingModules },
      });
    }

    await AppDataSource.query(
      `UPDATE integration_connections SET
         name = COALESCE(?, name),
         property_id = COALESCE(?, property_id),
         credentials_encrypted = COALESCE(?, credentials_encrypted),
         settings = COALESCE(?, settings),
         status = COALESCE(?, status),
         last_error = NULL,
         updated_at = NOW()
       WHERE id = ?`,
      [
        input.name ?? null,
        input.propertyId === undefined ? null : input.propertyId,
        credentialsBlob,
        settings,
        input.status ?? (credentialsBlob ? 'connected' : null),
        id,
      ],
    );

    if (credentialsBlob || input.settings?.modules) {
      try {
        if (current.providerCode === 'channex') {
          await this.ensureChannexWebhook(id);
        }
      } catch (err) {
        console.warn('[IntegrationService] webhook register skipped:', err);
      }
    }

    return this.getConnection(id);
  }

  static async deleteConnection(id: number): Promise<void> {
    await ensureIntegrationSchema();
    await AppDataSource.query(`DELETE FROM integration_connections WHERE id = ?`, [id]);
  }

  static async testConnection(id: number): Promise<TestConnectionResult> {
    await ensureIntegrationSchema();
    const rows = await AppDataSource.query(
      `SELECT c.*, p.code AS provider_code
       FROM integration_connections c
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE c.id = ? LIMIT 1`,
      [id],
    );
    if (!rows.length) throw new AppError('Conexão não encontrada', 404);

    const adapter = this.getAdapter(rows[0].provider_code);
    let settings: Record<string, any> = {};
    try {
      settings =
        typeof rows[0].settings === 'string'
          ? JSON.parse(rows[0].settings || '{}')
          : rows[0].settings || {};
    } catch {
      settings = {};
    }
    const decrypted = decryptCredentials(rows[0].credentials_encrypted);
    const credentials = {
      ...decrypted,
      apiKey: decrypted.apiKey || decrypted.accessToken || '',
      environment: String(settings.environment || 'staging'),
    };
    const result = await adapter.testConnection(credentials);

    await AppDataSource.query(
      `UPDATE integration_connections SET
         status = ?,
         last_sync_at = NOW(),
         last_error = ?,
         settings = CASE
           WHEN ? IS NOT NULL THEN JSON_SET(COALESCE(settings, JSON_OBJECT()), '$.lastTestPropertyCount', ?)
           ELSE settings
         END,
         updated_at = NOW()
       WHERE id = ?`,
      [
        result.ok ? 'connected' : 'error',
        result.ok ? null : result.message,
        result.ok && result.propertyCount != null ? 1 : null,
        result.propertyCount ?? 0,
        id,
      ],
    );

    await this.addSyncLog(id, {
      direction: 'outbound',
      module: 'connection',
      action: 'test_connection',
      status: result.ok ? 'success' : 'error',
      responseSummary: result as unknown as Record<string, unknown>,
      errorMessage: result.ok ? null : result.message,
    });

    return result;
  }

  static async listExternalProperties(connectionId: number): Promise<ExternalPropertySummary[]> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    return adapter.listProperties(credentials);
  }

  static async listExternalListings(connectionId: number): Promise<ExternalListingSummary[]> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    if (!adapter.listListings) return [];
    return adapter.listListings(credentials);
  }

  // â”€â”€â”€ Mappings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  static async listMappings(
    connectionId: number,
    entityType: string = 'unit',
  ): Promise<IntegrationEntityMapping[]> {
    await ensureIntegrationSchema();
    await this.getConnection(connectionId);
    const rows = await AppDataSource.query(
      `SELECT * FROM integration_entity_mappings
       WHERE connection_id = ? AND entity_type = ? AND is_active = 1
       ORDER BY id ASC`,
      [connectionId, entityType],
    );
    return rows.map((row: any) => this.mapMapping(row));
  }

  static async upsertUnitMapping(
    connectionId: number,
    input: {
      localId: number;
      externalId: string;
      externalLabel?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<IntegrationEntityMapping> {
    await ensureIntegrationSchema();
    await this.getConnection(connectionId);

    const localId = Number(input.localId);
    const externalId = String(input.externalId).trim();
    if (!localId || !externalId) {
      throw new AppError('localId e externalId são obrigatórios', 400);
    }

    const unit = await AppDataSource.getRepository(Unit).findOne({ where: { id: localId } });
    if (!unit) throw new AppError('Unit Unistays não encontrada', 404);

    // Uma unit → um room type; várias units podem compartilhar o mesmo room type
    await AppDataSource.query(
      `DELETE FROM integration_entity_mappings
       WHERE connection_id = ? AND entity_type = 'unit' AND local_id = ?`,
      [connectionId, localId],
    );

    const metadata = {
      propertyId: unit.propertyId,
      ...(input.metadata || {}),
    };

    const result = await AppDataSource.query(
      `INSERT INTO integration_entity_mappings
        (connection_id, entity_type, local_id, external_id, external_label, metadata, is_active)
       VALUES (?, 'unit', ?, ?, ?, ?, 1)`,
      [
        connectionId,
        localId,
        externalId,
        input.externalLabel ?? null,
        JSON.stringify(metadata),
      ],
    );

    const rows = await AppDataSource.query(
      `SELECT * FROM integration_entity_mappings WHERE id = ? LIMIT 1`,
      [Number(result.insertId)],
    );
    return this.mapMapping(rows[0]);
  }

  static async deleteMapping(connectionId: number, mappingId: number): Promise<void> {
    await ensureIntegrationSchema();
    const result = await AppDataSource.query(
      `DELETE FROM integration_entity_mappings WHERE id = ? AND connection_id = ?`,
      [mappingId, connectionId],
    );
    if (!result.affectedRows) throw new AppError('Mapping não encontrado', 404);
  }

  static async deleteMappingByExternalId(
    connectionId: number,
    externalId: string,
  ): Promise<void> {
    await ensureIntegrationSchema();
    await AppDataSource.query(
      `DELETE FROM integration_entity_mappings
       WHERE connection_id = ? AND entity_type = 'unit' AND external_id = ?`,
      [connectionId, String(externalId)],
    );
  }

  // --- Availability OUT (shared inventory) ---

  static async syncAvailabilityForReservation(payload: {
    unitId?: number | null;
    checkIn?: Date | string | null;
    checkOut?: Date | string | null;
    available: boolean;
    externalId?: string | null;
    reservationId?: number | null;
    skipChannelManagerSync?: boolean;
  }): Promise<void> {
    if (payload.skipChannelManagerSync) return;
    const ext = payload.externalId ? String(payload.externalId) : '';
    // Evita loop quando a própria reserva veio da Channex (ainda recalcula contagem)
    if (!payload.unitId || !payload.checkIn || !payload.checkOut) return;

    const range = stayNightRange(payload.checkIn, payload.checkOut);
    if (!range) return;

    await ensureIntegrationSchema();
    const mappingRows = await AppDataSource.query(
      `SELECT m.external_id, m.connection_id, c.settings, p.code AS provider_code
       FROM integration_entity_mappings m
       INNER JOIN integration_connections c ON c.id = m.connection_id
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE m.entity_type = 'unit'
         AND m.local_id = ?
         AND m.is_active = 1
         AND c.status = 'connected'
         AND p.code = 'channex'`,
      [payload.unitId],
    );

    for (const row of mappingRows) {
      let settings: Record<string, any> = {};
      try {
        settings =
          typeof row.settings === 'string'
            ? JSON.parse(row.settings || '{}')
            : row.settings || {};
      } catch {
        settings = {};
      }
      if (settings.modules?.availability === false) continue;

      // Reservas inbound Channex: ainda sincroniza (fonte de verdade Unistays)
      if (ext.startsWith(CHANNEX_EXTERNAL_PREFIX) && settings.modules?.availability === false) {
        continue;
      }

      const connId = Number(row.connection_id);
      const roomTypeExternalId = String(row.external_id);
      scheduleChannexPush(`avail:${connId}:${roomTypeExternalId}`, async () => {
        await this.pushRoomTypeAvailability(connId, roomTypeExternalId, range.startDate, range.endDate, {
          reservationId: payload.reservationId,
          unitId: payload.unitId,
        });
      });
    }
  }

  /**
   * Conta units livres por noite e envia POST /availability (N, não só 0/1).
   */
  static async pushRoomTypeAvailability(
    connectionId: number,
    roomTypeExternalId: string,
    startDate: string,
    endDate: string,
    context?: { reservationId?: number | null; unitId?: number | null },
  ): Promise<{ ok: boolean; message?: string; valuesSent?: number }> {
    const connection = await this.getConnection(connectionId);
    if (connection.providerCode !== 'channex') {
      throw new AppError('Disponibilidade compartilhada só para Channex', 400);
    }
    const modules = (connection.settings?.modules || {}) as Record<string, boolean>;
    if (modules.availability === false) {
      return { ok: false, message: 'Módulo availability desligado' };
    }

    const mappings = await this.listMappings(connectionId, 'unit');
    const roomMappings = mappings.filter((m) => m.externalId === roomTypeExternalId);
    if (!roomMappings.length) {
      return { ok: false, message: 'Room type sem units mapeadas' };
    }

    const propertyExternalId = String(
      roomMappings[0].metadata?.channexPropertyId ||
        roomMappings[0].metadata?.propertyExternalId ||
        '',
    );
    if (!propertyExternalId) {
      return { ok: false, message: 'Mapping sem channexPropertyId' };
    }

    const unitIds = roomMappings.map((m) => m.localId);
    const clamped = clampRangeToFuture(startDate, endDate);
    if (!clamped) {
      return { ok: true, message: 'Intervalo só com datas passadas — ignorado', valuesSent: 0 };
    }
    const dayMap = await this.computeSharedAvailabilityByDay(
      unitIds,
      clamped.startDate,
      clamped.endDate,
    );
    const values = collapseAvailabilityByDay(propertyExternalId, roomTypeExternalId, dayMap);

    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    const result = await channex.updateAvailabilityValues(credentials, values);

    await this.addSyncLog(connectionId, {
      direction: 'outbound',
      module: 'availability',
      action: 'push_shared_inventory',
      status: result.ok ? 'success' : 'error',
      externalRef: roomTypeExternalId,
      requestSummary: {
        startDate,
        endDate,
        unitCount: unitIds.length,
        values,
        ...context,
      },
      responseSummary: result as unknown as Record<string, unknown>,
      errorMessage: result.ok ? null : result.message,
    });

    if (result.ok) {
      await AppDataSource.query(
        `UPDATE integration_connections SET last_sync_at = NOW(), last_error = NULL WHERE id = ?`,
        [connectionId],
      );
    }

    return { ...result, valuesSent: values.length };
  }

  static async syncAvailabilityWindow(
    connectionId: number,
    daysAhead: number = 90,
  ): Promise<{ ok: boolean; message: string; roomTypes: number }> {
    const startDate = toDateOnly(new Date());
    const endObj = new Date();
    endObj.setDate(endObj.getDate() + Math.max(1, Math.min(daysAhead, 730)));
    const endDate = toDateOnly(endObj);

    const mappings = await this.listMappings(connectionId, 'unit');
    const byRoom = new Map<string, IntegrationEntityMapping[]>();
    for (const m of mappings) {
      const list = byRoom.get(m.externalId) || [];
      list.push(m);
      byRoom.set(m.externalId, list);
    }

    let okCount = 0;
    let errCount = 0;
    for (const roomTypeExternalId of byRoom.keys()) {
      const result = await this.pushRoomTypeAvailability(
        connectionId,
        roomTypeExternalId,
        startDate,
        endDate,
      );
      if (result.ok) okCount += 1;
      else errCount += 1;
    }

    return {
      ok: errCount === 0,
      message: `Disponibilidade: ${okCount} room type(s) OK${errCount ? `, ${errCount} erro(s)` : ''} · ${startDate}→${endDate}`,
      roomTypes: byRoom.size,
    };
  }

  static async syncRatesWindow(
    connectionId: number,
    daysAhead: number = 90,
  ): Promise<{ ok: boolean; message: string; ratePlans: number }> {
    const connection = await this.getConnection(connectionId);
    if (connection.providerCode !== 'channex') {
      throw new AppError('Rates só para Channex', 400);
    }
    const modules = (connection.settings?.modules || {}) as Record<string, boolean>;
    if (modules.rates === false) {
      return { ok: false, message: 'Módulo rates desligado', ratePlans: 0 };
    }

    const startDate = toDateOnly(new Date());
    const endObj = new Date();
    endObj.setDate(endObj.getDate() + Math.max(1, Math.min(daysAhead, 730)));
    const endDate = toDateOnly(endObj);

    const rateMappings = await this.listMappings(connectionId, 'rate_plan');
    if (!rateMappings.length) {
      return {
        ok: false,
        message: 'Nenhum rate plan mapeado — provisione inventário ou mapeie um rate plan',
        ratePlans: 0,
      };
    }

    const unitMappings = await this.listMappings(connectionId, 'unit');
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    const unitRateRepo = AppDataSource.getRepository(UnitRate);

    const values: Array<{
      property_id: string;
      rate_plan_id: string;
      date: string;
      rate?: string | number;
      min_stay_through?: number;
      stop_sell?: boolean;
    }> = [];

    for (const rp of rateMappings) {
      const propertyExternalId = String(
        rp.metadata?.channexPropertyId || rp.metadata?.propertyExternalId || '',
      );
      const roomTypeExternalId = String(rp.metadata?.channexRoomTypeId || '');
      if (!propertyExternalId) continue;

      const linkedUnits = roomTypeExternalId
        ? unitMappings.filter((u) => u.externalId === roomTypeExternalId)
        : unitMappings.filter((u) => Number(u.metadata?.ratePlanLocalHint) === rp.localId);

      const unitIds = linkedUnits.length
        ? linkedUnits.map((u) => u.localId)
        : [rp.localId];

      const rates = await unitRateRepo
        .createQueryBuilder('ur')
        .where('ur.unit_id IN (:...unitIds)', { unitIds })
        .andWhere('ur.date >= :start', { start: startDate })
        .andWhere('ur.date <= :end', { end: endDate })
        .getMany();

      const byDate = new Map<string, UnitRate[]>();
      for (const r of rates) {
        const d = toDateOnly(r.date as unknown as Date);
        const list = byDate.get(d) || [];
        list.push(r);
        byDate.set(d, list);
      }

      // fallback: unit.rates.daily / room type base
      let fallbackRate: number | null = null;
      const unit = await AppDataSource.getRepository(Unit).findOne({ where: { id: unitIds[0] } });
      if (unit?.rates?.daily != null) fallbackRate = Number(unit.rates.daily);
      if (fallbackRate == null && unit?.roomTypeId) {
        const rt = await AppDataSource.getRepository(RoomType).findOne({
          where: { id: unit.roomTypeId },
        });
        if (rt?.basePrice != null) fallbackRate = Number(rt.basePrice);
      }

      for (const date of eachDateInclusive(startDate, endDate)) {
        const dayRates = byDate.get(date) || [];
        const priced = dayRates.find((r) => r.dailyRate != null && Number(r.dailyRate) > 0);
        const amount = priced?.dailyRate != null ? Number(priced.dailyRate) : fallbackRate;
        const minStay = priced?.minStay != null ? Number(priced.minStay) : undefined;
        const stopSell = priced ? priced.available === false : false;

        if (amount == null || amount <= 0) {
          if (stopSell) {
            values.push({
              property_id: propertyExternalId,
              rate_plan_id: rp.externalId,
              date,
              stop_sell: true,
            });
          }
          continue;
        }

        values.push({
          property_id: propertyExternalId,
          rate_plan_id: rp.externalId,
          date,
          rate: formatRateForChannex(amount),
          ...(minStay && minStay > 0 ? { min_stay_through: minStay } : {}),
          ...(stopSell ? { stop_sell: true } : { stop_sell: false }),
        });
      }
    }

    // Filtra datas passadas
    const today = todayDateOnly();
    const futureValues = values.filter((v) => !v.date || v.date >= today);

    // Batch em chunks de 200
    let warnings = 0;
    for (let i = 0; i < futureValues.length; i += 200) {
      const chunk = futureValues.slice(i, i + 200);
      const result = await channex.updateRestrictions(credentials, chunk);
      if (!result.ok) {
        await this.addSyncLog(connectionId, {
          direction: 'outbound',
          module: 'rates',
          action: 'push_restrictions',
          status: 'error',
          errorMessage: result.message,
          requestSummary: { chunkSize: chunk.length, startDate, endDate },
        });
        return {
          ok: false,
          message: result.message || 'Falha ao enviar rates',
          ratePlans: rateMappings.length,
        };
      }
      warnings += Array.isArray(result.warnings) ? result.warnings.length : 0;
    }

    await this.addSyncLog(connectionId, {
      direction: 'outbound',
      module: 'rates',
      action: 'push_restrictions',
      status: 'success',
      requestSummary: {
        startDate,
        endDate,
        valueCount: futureValues.length,
        ratePlans: rateMappings.length,
        warnings,
      },
    });

    await AppDataSource.query(
      `UPDATE integration_connections SET last_sync_at = NOW(), last_error = NULL WHERE id = ?`,
      [connectionId],
    );

    return {
      ok: true,
      message: `${futureValues.length} valor(es) de rate/restriction enviados · ${rateMappings.length} rate plan(s)`,
      ratePlans: rateMappings.length,
    };
  }

  /**
   * Cria Property + Room Types + Rate Plans na Channex a partir de um Property Unistays
   * e mapeia todas as units (inventário compartilhado por room type).
   */
  static async provisionFromUnistays(
    connectionId: number,
    unistaysPropertyId: number,
    options?: { daysAhead?: number; currency?: string },
  ): Promise<{
    propertyExternalId: string;
    roomTypesCreated: number;
    ratePlansCreated: number;
    unitsMapped: number;
    availability?: { ok: boolean; message: string };
    rates?: { ok: boolean; message: string };
  }> {
    const connection = await this.getConnection(connectionId);
    if (connection.providerCode !== 'channex') {
      throw new AppError('Provisionamento só para Channex', 400);
    }

    const property = await AppDataSource.getRepository(Property).findOne({
      where: { id: unistaysPropertyId },
    });
    if (!property) throw new AppError('Property Unistays não encontrada', 404);

    const units = await AppDataSource.getRepository(Unit).find({
      where: { propertyId: unistaysPropertyId },
      order: { number: 'ASC' },
    });
    if (!units.length) throw new AppError('Property sem units para provisionar', 400);

    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;

    // Property mapping (reuse if exists)
    const propMaps = await this.listMappings(connectionId, 'property');
    let propertyExternalId = propMaps.find((m) => m.localId === unistaysPropertyId)?.externalId;

    if (!propertyExternalId) {
      const created = await channex.createProperty(credentials, {
        title: property.name,
        currency: options?.currency || 'BRL',
        email: property.email,
        phone: property.phone,
        zipCode: property.zipCode,
        country: countryToAlpha2(property.country),
        state: property.state,
        city: property.city,
        address: [property.address, property.addressNumber].filter(Boolean).join(', ') || null,
        timezone: 'America/Sao_Paulo',
        propertyType: mapUnistaysPropertyType(property.type),
      });
      if (!created.ok || !created.id) {
        throw new AppError(created.message || 'Falha ao criar property na Channex', 400);
      }
      propertyExternalId = created.id;
      await this.upsertEntityMapping(connectionId, {
        entityType: 'property',
        localId: unistaysPropertyId,
        externalId: propertyExternalId,
        externalLabel: property.name,
      });
    }

    // Group units by roomTypeId (null → each unit is its own VR inventory of 1)
    const groups = new Map<string, Unit[]>();
    for (const unit of units) {
      const key = unit.roomTypeId != null ? `rt:${unit.roomTypeId}` : `unit:${unit.id}`;
      const list = groups.get(key) || [];
      list.push(unit);
      groups.set(key, list);
    }

    const roomTypes = await AppDataSource.getRepository(RoomType).find({
      where: { propertyId: unistaysPropertyId },
    });
    const roomTypeById = new Map(roomTypes.map((r) => [r.id, r]));

    let roomTypesCreated = 0;
    let ratePlansCreated = 0;
    let unitsMapped = 0;

    for (const [, groupUnits] of groups) {
      const sample = groupUnits[0];
      const rt = sample.roomTypeId != null ? roomTypeById.get(sample.roomTypeId) : null;
      const title = rt?.name || sample.name || `Unit ${sample.number}`;
      const countOfRooms = groupUnits.length;
      const occAdults = rt?.maxAdults || sample.maxCapacity || sample.capacity || 2;
      const occChildren = rt?.maxChildren ?? 0;
      const defaultOccupancy = Math.min(occAdults, rt?.maxGuests || sample.capacity || occAdults);

      const createdRt = await channex.createRoomType(credentials, {
        propertyExternalId,
        title,
        countOfRooms,
        occAdults,
        occChildren,
        occInfants: 0,
        defaultOccupancy,
        description: rt?.description || null,
      });
      if (!createdRt.ok || !createdRt.id) {
        throw new AppError(createdRt.message || `Falha ao criar room type ${title}`, 400);
      }
      roomTypesCreated += 1;

      if (rt) {
        await this.upsertEntityMapping(connectionId, {
          entityType: 'room_type',
          localId: rt.id,
          externalId: createdRt.id,
          externalLabel: title,
          metadata: { channexPropertyId: propertyExternalId, countOfRooms },
        });
      }

      const createdRp = await channex.createRatePlan(credentials, {
        propertyExternalId,
        roomTypeExternalId: createdRt.id,
        title: `${title} — BAR`,
        currency: options?.currency || 'BRL',
        occupancy: defaultOccupancy,
      });
      if (!createdRp.ok || !createdRp.id) {
        throw new AppError(createdRp.message || `Falha ao criar rate plan para ${title}`, 400);
      }
      ratePlansCreated += 1;

      await this.upsertEntityMapping(connectionId, {
        entityType: 'rate_plan',
        localId: sample.id,
        externalId: createdRp.id,
        externalLabel: `${title} — BAR`,
        metadata: {
          channexPropertyId: propertyExternalId,
          channexRoomTypeId: createdRt.id,
          unistaysRoomTypeId: rt?.id ?? null,
        },
      });

      for (const unit of groupUnits) {
        await this.upsertUnitMapping(connectionId, {
          localId: unit.id,
          externalId: createdRt.id,
          externalLabel: title,
          metadata: {
            channexPropertyId: propertyExternalId,
            channexRatePlanId: createdRp.id,
            unistaysRoomTypeId: rt?.id ?? null,
          },
        });
        unitsMapped += 1;
      }
    }

    const daysAhead = options?.daysAhead ?? 90;
    const availability = await this.syncAvailabilityWindow(connectionId, daysAhead);
    const rates = await this.syncRatesWindow(connectionId, daysAhead);

    await this.addSyncLog(connectionId, {
      direction: 'outbound',
      module: 'connection',
      action: 'provision_from_unistays',
      status: 'success',
      requestSummary: {
        unistaysPropertyId,
        propertyExternalId,
        roomTypesCreated,
        ratePlansCreated,
        unitsMapped,
      },
    });

    return {
      propertyExternalId,
      roomTypesCreated,
      ratePlansCreated,
      unitsMapped,
      availability: { ok: availability.ok, message: availability.message },
      rates: { ok: rates.ok, message: rates.message },
    };
  }

  static async upsertEntityMapping(
    connectionId: number,
    input: {
      entityType: string;
      localId: number;
      externalId: string;
      externalLabel?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): Promise<IntegrationEntityMapping> {
    await ensureIntegrationSchema();
    await this.getConnection(connectionId);

    await AppDataSource.query(
      `DELETE FROM integration_entity_mappings
       WHERE connection_id = ? AND entity_type = ? AND local_id = ?`,
      [connectionId, input.entityType, input.localId],
    );

    const result = await AppDataSource.query(
      `INSERT INTO integration_entity_mappings
        (connection_id, entity_type, local_id, external_id, external_label, metadata, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        connectionId,
        input.entityType,
        input.localId,
        input.externalId,
        input.externalLabel ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );

    const rows = await AppDataSource.query(
      `SELECT * FROM integration_entity_mappings WHERE id = ? LIMIT 1`,
      [Number(result.insertId)],
    );
    return this.mapMapping(rows[0]);
  }

  private static async computeSharedAvailabilityByDay(
    unitIds: number[],
    startDate: string,
    endDate: string,
  ): Promise<Map<string, number>> {
    const dayMap = new Map<string, number>();
    const dates = eachDateInclusive(startDate, endDate);
    for (const d of dates) dayMap.set(d, unitIds.length);

    if (!unitIds.length) return dayMap;

    const units = await AppDataSource.getRepository(Unit).find({
      where: { id: In(unitIds) },
    });
    const permanentlyBlocked = new Set(
      units.filter((u) => BLOCKING_UNIT_STATUSES.has(u.status)).map((u) => u.id),
    );
    for (const d of dates) {
      dayMap.set(d, Math.max(0, unitIds.length - permanentlyBlocked.size));
    }

    const sellableIds = unitIds.filter((id) => !permanentlyBlocked.has(id));
    if (!sellableIds.length) {
      for (const d of dates) dayMap.set(d, 0);
      return dayMap;
    }

    const reservations = await AppDataSource.getRepository(Reservation).find({
      where: {
        unitId: In(sellableIds),
        status: Not(ReservationStatus.CANCELLED),
      },
    });

    // Por noite: ocupados = units distintas com reserva sobreposta
    const occupiedByDay = new Map<string, Set<number>>();
    for (const d of dates) occupiedByDay.set(d, new Set());

    for (const res of reservations) {
      if (res.unitId == null) continue;
      const overlap = stayNightRange(res.checkIn, res.checkOut);
      if (!overlap) continue;
      for (const d of eachDateInclusive(overlap.startDate, overlap.endDate)) {
        occupiedByDay.get(d)?.add(res.unitId);
      }
    }

    for (const d of dates) {
      const occupied = occupiedByDay.get(d)?.size ?? 0;
      dayMap.set(d, Math.max(0, sellableIds.length - occupied));
    }

    return dayMap;
  }

  // --- Channex ---

  static async listExternalRoomTypes(
    connectionId: number,
    propertyExternalId?: string,
  ): Promise<Array<{
    externalId: string;
    title: string;
    propertyExternalId: string;
    countOfRooms: number;
  }>> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    if (typeof channex.listRoomTypes !== 'function') {
      throw new AppError('Provedor sem room types', 400);
    }
    return channex.listRoomTypes(credentials, propertyExternalId);
  }

  static async listExternalRatePlans(
    connectionId: number,
    propertyExternalId?: string,
  ): Promise<Array<{
    externalId: string;
    title: string;
    propertyExternalId: string;
    roomTypeExternalId: string;
    currency?: string;
  }>> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    return channex.listRatePlans(credentials, propertyExternalId);
  }

  static async ensureChannexWebhook(
    connectionId: number,
  ): Promise<{ url: string; registered: boolean; message?: string }> {
    const { adapter, credentials, row } = await this.getAdapterForConnection(connectionId);
    const connection = this.mapConnection(row);
    const url = this.buildWebhookUrl(connection.uuid, 'channex');

    let settings: Record<string, any> = connection.settings || {};
    const modules = (settings.modules || {}) as Record<string, boolean>;
    if (modules.reservations === false) {
      return { url, registered: false, message: 'Módulo de reservas desligado' };
    }

    if (/localhost|127\.0\.0\.1/.test(url)) {
      console.warn(
        '[IntegrationService] Webhook Channex aponta para localhost. Defina API_PUBLIC_URL (ex.: ngrok) para staging receber eventos.',
      );
    }

    if (!adapter.listWebhooks || !adapter.createWebhook) {
      return { url, registered: false, message: 'Adapter sem suporte a webhooks' };
    }

    const existing = await adapter.listWebhooks(credentials);
    const already = existing.find((w) => w.url === url);
    if (already) {
      settings = { ...settings, channexWebhookId: already.id, channexWebhookUrl: url };
      await AppDataSource.query(
        `UPDATE integration_connections SET settings = ?, updated_at = NOW() WHERE id = ?`,
        [JSON.stringify(settings), connectionId],
      );
      return { url, registered: true, message: 'Webhook já registrado na Channex' };
    }

    const created = await adapter.createWebhook(credentials, {
      url,
      events: ['booking_new', 'booking_modification', 'booking_cancellation'],
      isGlobal: true,
    });

    if (!created.ok) {
      await this.addSyncLog(connectionId, {
        direction: 'outbound',
        module: 'webhooks',
        action: 'register_webhook',
        status: 'error',
        requestSummary: { url },
        errorMessage: created.message,
      });
      return { url, registered: false, message: created.message };
    }

    settings = {
      ...settings,
      channexWebhookId: created.id || null,
      channexWebhookUrl: url,
    };
    await AppDataSource.query(
      `UPDATE integration_connections SET settings = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(settings), connectionId],
    );

    await this.addSyncLog(connectionId, {
      direction: 'outbound',
      module: 'webhooks',
      action: 'register_webhook',
      status: 'success',
      requestSummary: { url },
      responseSummary: created as unknown as Record<string, unknown>,
    });

    return { url, registered: true, message: created.message };
  }

  /** Webhook = sinal → puxa revision por id (ou drain do feed) → apply → ACK. */
  static async handleChannexWebhook(
    connectionUuid: string,
    body: Record<string, any>,
  ): Promise<{ handled: boolean; message: string; processed?: number }> {
    const connection = await this.getConnectionByUuid(connectionUuid);
    if (connection.status !== 'connected') {
      return { handled: false, message: 'Conexão não está ativa' };
    }
    const modules = (connection.settings?.modules || {}) as Record<string, boolean>;
    if (modules.reservations === false) {
      return { handled: false, message: 'Módulo de reservas desligado' };
    }

    const event = String(body?.event || '');
    const revisionId =
      body?.payload?.revision_id ||
      body?.revision_id ||
      body?.payload?.booking_revision_id ||
      null;

    await this.addSyncLog(connection.id, {
      direction: 'inbound',
      module: 'webhooks',
      action: event || 'channex_webhook',
      status: 'success',
      requestSummary: {
        event,
        property_id: body?.property_id || body?.payload?.property_id,
        booking_id: body?.payload?.booking_id,
        revision_id: revisionId,
      },
    });

    const pulled = await this.pullChannexBookings(connection.id, {
      drain: true,
      revisionId: revisionId ? String(revisionId) : undefined,
    });
    return {
      handled: true,
      message: pulled.message,
      processed: pulled.processed,
    };
  }

  static async pullChannexBookings(
    connectionId: number,
    options?: { drain?: boolean; revisionId?: string },
  ): Promise<{ processed: number; skipped: number; errors: number; message: string }> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    if (typeof channex.listBookingRevisionsFeedPage !== 'function') {
      throw new AppError('Provedor sem booking feed', 400);
    }

    const mappedPropertyIds = await this.getMappedChannexPropertyIds(connectionId);
    let processed = 0;
    let skipped = 0;
    let errors = 0;

    const applyRevision = async (rev: {
      revisionId: string;
      bookingId: string;
      uniqueId: string;
      propertyExternalId: string;
      otaName: string;
      otaReservationCode?: string | null;
      status: string;
      customer?: any;
      rooms: any[];
      raw?: any;
    }) => {
      // Skill: feed is account-wide — skip+ack foreign properties
      if (
        rev.propertyExternalId &&
        mappedPropertyIds.size > 0 &&
        !mappedPropertyIds.has(rev.propertyExternalId)
      ) {
        await channex.acknowledgeBookingRevision(credentials, rev.revisionId);
        skipped += 1;
        await this.addSyncLog(connectionId, {
          direction: 'inbound',
          module: 'reservations',
          action: 'skip_foreign_property',
          status: 'skipped',
          externalRef: rev.revisionId,
          requestSummary: { propertyExternalId: rev.propertyExternalId },
        });
        return;
      }

      const statusRaw = String(rev.status || 'new').toLowerCase();
      let roomProcessed = 0;

      for (const room of rev.rooms || []) {
        if (!room.roomTypeId || !room.checkinDate || !room.checkoutDate) continue;

        const mappings = await this.listMappings(connectionId, 'unit');
        const candidates = mappings.filter((m) => m.externalId === room.roomTypeId);
        if (!candidates.length) {
          errors += 1;
          await this.addSyncLog(connectionId, {
            direction: 'inbound',
            module: 'reservations',
            action: 'unmapped_room_type',
            status: 'error',
            externalRef: rev.uniqueId,
            errorMessage: `Room type Channex ${room.roomTypeId} sem mapping`,
          });
          continue;
        }

        const stayCode = `${rev.bookingId || rev.uniqueId}:${room.roomTypeId}`;
        const externalId = `${CHANNEX_EXTERNAL_PREFIX}${stayCode}`;

        // Skill: modified → apply with review flag (não drop)
        const external: ExternalReservationSummary = {
          reservationCode: rev.uniqueId || rev.bookingId,
          stayCode,
          propertyExternalId: room.roomTypeId,
          channelType: rev.otaName || 'channex',
          channelReservationId: rev.otaReservationCode,
          status:
            statusRaw === 'cancelled'
              ? 'cancelled'
              : statusRaw === 'modified'
                ? 'accepted'
                : 'accepted',
          checkInDate: room.checkinDate,
          checkOutDate: room.checkoutDate,
          guestName: [rev.customer?.name, rev.customer?.surname].filter(Boolean).join(' ') || null,
          guestEmail: rev.customer?.mail || null,
          guestPhone: rev.customer?.phone || null,
          adults: room.adults || 1,
          children: room.children || 0,
          totalAmount: room.amount != null ? Number(room.amount) : null,
          raw: rev.raw,
        };

        let unitId =
          statusRaw === 'cancelled'
            ? candidates[0].localId
            : await this.pickFreeUnitForStay(
                candidates.map((c) => c.localId),
                room.checkinDate,
                room.checkoutDate,
                externalId,
              );

        let overbooking = false;
        if (unitId == null && statusRaw !== 'cancelled') {
          // Skill: never drop OTA booking — ingest flagged as overbooking
          unitId = candidates[0].localId;
          overbooking = true;
        }

        await this.upsertFromChannexRoom(connectionId, unitId!, external, rev.revisionId, {
          overbooking,
          modified: statusRaw === 'modified',
          channexBookingId: rev.bookingId,
        });
        roomProcessed += 1;
        processed += 1;
      }

      // Ack even if rooms empty (after skip handling) — but not if all rooms errored unmapped?
      // Skill: ack after apply success; leave unacked on hard failure. We ack if at least
      // one room applied OR foreign was skipped OR cancelled with no rooms.
      if (roomProcessed > 0 || statusRaw === 'cancelled' || !(rev.rooms || []).length) {
        await channex.acknowledgeBookingRevision(credentials, rev.revisionId);
        await this.addSyncLog(connectionId, {
          direction: 'inbound',
          module: 'reservations',
          action: 'ack_revision',
          status: 'success',
          externalRef: rev.revisionId,
        });
      } else {
        errors += 1;
        await this.addSyncLog(connectionId, {
          direction: 'inbound',
          module: 'reservations',
          action: 'defer_ack',
          status: 'error',
          externalRef: rev.revisionId,
          errorMessage: 'Nenhum room aplicado — revision permanece no feed para retry',
        });
      }
    };

    // Webhook path: fetch one revision by id first
    if (options?.revisionId) {
      try {
        const one = await channex.getBookingRevision(credentials, options.revisionId);
        if (one) await applyRevision(one);
      } catch (err: any) {
        errors += 1;
        await this.addSyncLog(connectionId, {
          direction: 'inbound',
          module: 'reservations',
          action: 'import_revision',
          status: 'error',
          externalRef: options.revisionId,
          errorMessage: err?.message || String(err),
        });
      }
    }

    // Drain feed until empty (skill)
    const maxPages = options?.drain === false ? 1 : 50;
    for (let page = 0; page < maxPages; page++) {
      const { revisions, meta } = await channex.listBookingRevisionsFeedPage(credentials, {
        limit: 100,
      });
      if (!revisions.length) break;

      for (const rev of revisions) {
        try {
          await applyRevision(rev);
        } catch (err: any) {
          errors += 1;
          await this.addSyncLog(connectionId, {
            direction: 'inbound',
            module: 'reservations',
            action: 'import_revision',
            status: 'error',
            externalRef: rev.revisionId,
            errorMessage: err?.message || String(err),
          });
          // continue draining — don't break on first error
        }
      }

      if (meta.total <= revisions.length || revisions.length === 0) break;
    }

    await AppDataSource.query(
      `UPDATE integration_connections SET last_sync_at = NOW() WHERE id = ?`,
      [connectionId],
    );

    return {
      processed,
      skipped,
      errors,
      message: processed
        ? `${processed} reserva(s) processada(s)${skipped ? `, ${skipped} ignorada(s)` : ''}${errors ? `, ${errors} erro(s)` : ''}`
        : skipped
          ? `${skipped} revision(s) de outras properties ignorada(s)`
          : 'Nenhuma revision pendente no feed',
    };
  }

  /** Recovery manual após outage >30 min (skill: time-scoped, não cron). */
  static async recoverChannexBookings(
    connectionId: number,
    insertedAtGte: string,
  ): Promise<{ created: number; message: string }> {
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    let created = 0;
    let page = 1;
    const mappedPropertyIds = await this.getMappedChannexPropertyIds(connectionId);

    while (page <= 20) {
      const { bookings, meta } = await channex.listBookingsSince(credentials, {
        insertedAtGte,
        page,
        limit: 50,
      });
      if (!bookings.length) break;

      for (const item of bookings) {
        const attrs = item.attributes || item;
        const propertyId = String(attrs.property_id || item.relationships?.property?.data?.id || '');
        if (mappedPropertyIds.size && propertyId && !mappedPropertyIds.has(propertyId)) continue;

        const bookingId = String(item.id || attrs.id || attrs.booking_id || '');
        const rooms = Array.isArray(attrs.rooms) ? attrs.rooms : [];
        for (const room of rooms) {
          const roomTypeId = String(room.room_type_id || '');
          const stayCode = `${bookingId}:${roomTypeId}`;
          const externalId = `${CHANNEX_EXTERNAL_PREFIX}${stayCode}`;
          const existing = await AppDataSource.getRepository(Reservation).findOne({
            where: { externalId },
          });
          if (existing) continue;

          const mappings = await this.listMappings(connectionId, 'unit');
          const candidates = mappings.filter((m) => m.externalId === roomTypeId);
          if (!candidates.length) continue;

          const checkin = String(room.checkin_date || attrs.arrival_date || '').slice(0, 10);
          const checkout = String(room.checkout_date || attrs.departure_date || '').slice(0, 10);
          if (!checkin || !checkout) continue;

          let unitId = await this.pickFreeUnitForStay(
            candidates.map((c) => c.localId),
            checkin,
            checkout,
            externalId,
          );
          let overbooking = false;
          if (unitId == null) {
            unitId = candidates[0].localId;
            overbooking = true;
          }

          const customer = attrs.customer || {};
          await this.upsertFromChannexRoom(
            connectionId,
            unitId,
            {
              reservationCode: String(attrs.unique_id || bookingId),
              stayCode,
              propertyExternalId: roomTypeId,
              channelType: String(attrs.ota_name || 'channex'),
              channelReservationId: attrs.ota_reservation_code,
              status: String(attrs.status || 'new').toLowerCase() === 'cancelled' ? 'cancelled' : 'accepted',
              checkInDate: checkin,
              checkOutDate: checkout,
              guestName: [customer.name, customer.surname].filter(Boolean).join(' ') || null,
              guestEmail: customer.mail || null,
              guestPhone: customer.phone || null,
              adults: Number(room.occupancy?.adults ?? 1) || 1,
              children: Number(room.occupancy?.children ?? 0) || 0,
              totalAmount: room.amount != null ? Number(room.amount) : null,
              raw: item,
            },
            bookingId,
            { overbooking, channexBookingId: bookingId },
          );
          created += 1;
        }
      }

      if (page * meta.limit >= meta.total) break;
      page += 1;
    }

    await this.addSyncLog(connectionId, {
      direction: 'inbound',
      module: 'reservations',
      action: 'recovery_since',
      status: 'success',
      requestSummary: { insertedAtGte, created },
    });

    return {
      created,
      message: created
        ? `Recovery: ${created} reserva(s) reimportada(s) desde ${insertedAtGte}`
        : `Recovery: nada novo desde ${insertedAtGte}`,
    };
  }

  /** Doctor / health check (skill: readback + mappings + feed). */
  static async doctorChannex(connectionId: number): Promise<{
    ok: boolean;
    checks: Array<{ name: string; ok: boolean; detail: string }>;
    poller: {
      running: boolean;
      intervalMs: number;
      lastPollAt: string | null;
      consecutiveFailures: number;
    };
  }> {
    const { getChannexFeedPollerStatus } = await import('./ChannexFeedPoller');
    const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
    const { adapter, credentials } = await this.getAdapterForConnection(connectionId);
    const channex = adapter as ChannexAdapter;
    const connection = await this.getConnection(connectionId);

    const test = await adapter.testConnection(credentials);
    checks.push({
      name: 'api_key',
      ok: test.ok,
      detail: test.message,
    });

    const unitMaps = await this.listMappings(connectionId, 'unit');
    const rateMaps = await this.listMappings(connectionId, 'rate_plan');
    const propMaps = await this.listMappings(connectionId, 'property');
    checks.push({
      name: 'mappings',
      ok: unitMaps.length > 0,
      detail: `${propMaps.length} property · ${unitMaps.length} unit↔RT · ${rateMaps.length} rate plan`,
    });

    const webhookUrl = connection.webhookUrl || String(connection.settings?.channexWebhookUrl || '');
    const webhookPublic = !!webhookUrl && !/localhost|127\.0\.0\.1/.test(webhookUrl);
    checks.push({
      name: 'webhook_url',
      ok: webhookPublic || process.env.NODE_ENV !== 'production',
      detail: webhookUrl
        ? webhookPublic
          ? `OK · ${webhookUrl}`
          : `Localhost — defina API_PUBLIC_URL · ${webhookUrl}`
        : 'Webhook URL ausente',
    });

    // Sample readback (7 days) for first mapped room type
    if (unitMaps.length && test.ok) {
      try {
        const sample = unitMaps[0];
        const propertyExternalId = String(
          sample.metadata?.channexPropertyId || sample.metadata?.propertyExternalId || '',
        );
        if (propertyExternalId) {
          const from = todayDateOnly();
          const toObj = new Date();
          toObj.setDate(toObj.getDate() + 6);
          const to = toDateOnly(toObj);
          const local = await this.computeSharedAvailabilityByDay(
            unitMaps.filter((m) => m.externalId === sample.externalId).map((m) => m.localId),
            from,
            to,
          );
          const remote = await channex.getAvailability(credentials, {
            propertyExternalId,
            dateFrom: from,
            dateTo: to,
          });
          const remoteDays = remote[sample.externalId] || {};
          let mismatches = 0;
          for (const [d, localAvail] of local.entries()) {
            const remoteAvail = Number(remoteDays[d] ?? -1);
            if (remoteAvail !== localAvail) mismatches += 1;
          }
          checks.push({
            name: 'availability_readback',
            ok: mismatches === 0,
            detail:
              mismatches === 0
                ? `Readback OK (${from}→${to})`
                : `${mismatches} dia(s) divergente(s) no room type ${sample.externalId.slice(0, 8)}…`,
          });
        } else {
          checks.push({
            name: 'availability_readback',
            ok: false,
            detail: 'Mapping sem channexPropertyId',
          });
        }
      } catch (err: any) {
        checks.push({
          name: 'availability_readback',
          ok: false,
          detail: err?.message || String(err),
        });
      }

      try {
        const feed = await channex.listBookingRevisionsFeedPage(credentials, { limit: 10 });
        checks.push({
          name: 'booking_feed',
          ok: true,
          detail: `Feed OK · ${feed.meta.total} pending · poller ${getChannexFeedPollerStatus().running ? 'ativo' : 'parado'}`,
        });
      } catch (err: any) {
        checks.push({
          name: 'booking_feed',
          ok: false,
          detail: err?.message || String(err),
        });
      }
    }

    const poller = getChannexFeedPollerStatus();
    if (poller.consecutiveFailures >= 3) {
      checks.push({
        name: 'poller_health',
        ok: false,
        detail: `${poller.consecutiveFailures} falhas consecutivas — risco janela 30 min`,
      });
    } else {
      checks.push({
        name: 'poller_health',
        ok: poller.running,
        detail: poller.running
          ? `OK · last ${poller.lastPollAt || '—'}`
          : 'Poller não iniciado',
      });
    }

    return {
      ok: checks.every((c) => c.ok),
      checks,
      poller: {
        running: poller.running,
        intervalMs: poller.intervalMs,
        lastPollAt: poller.lastPollAt,
        consecutiveFailures: poller.consecutiveFailures,
      },
    };
  }

  /**
   * Timeline do fluxo Channel Manager (Channex) para uma reserva Unistays.
   * Combina metadados da reserva + integration_sync_logs relacionados.
   */
  static async getChannelManagerFlow(reservationId: number): Promise<{
    reservation: {
      id: number;
      reservationNumber: string;
      status: string;
      channel: string | null;
      externalId: string | null;
      unitId: number | null;
      checkIn: string | null;
      checkOut: string | null;
      createdAt: string | null;
      agencyNotes: string | null;
      internalNotes: string | null;
      isFromChannex: boolean;
      overbooking: boolean;
      otaModification: boolean;
    };
    mapping: {
      connected: boolean;
      connectionId: number | null;
      connectionName: string | null;
      roomTypeExternalId: string | null;
      channexPropertyId: string | null;
      mappedUnits: number;
    } | null;
    summary: {
      overall: 'ok' | 'warning' | 'error' | 'idle' | 'inbound' | 'outbound';
      label: string;
      hasErrors: boolean;
      lastSyncAt: string | null;
      eventsCount: number;
    };
    timeline: Array<{
      id: string;
      at: string;
      title: string;
      description: string;
      status: 'success' | 'error' | 'skipped' | 'pending' | 'info';
      direction?: 'inbound' | 'outbound' | 'local';
      module?: string;
      action?: string;
      externalRef?: string | null;
      details?: Record<string, unknown> | null;
      errorMessage?: string | null;
    }>;
  }> {
    await ensureIntegrationSchema();
    const reservation = await AppDataSource.getRepository(Reservation).findOne({
      where: { id: reservationId },
    });
    if (!reservation) throw new AppError('Reserva não encontrada', 404);

    const externalId = reservation.externalId ? String(reservation.externalId) : null;
    const isFromChannex = !!externalId?.startsWith(CHANNEX_EXTERNAL_PREFIX);
    const agencyNotes = reservation.agencyNotes || null;
    const internalNotes = reservation.internalNotes || null;
    const overbooking =
      /OVERBOOKING/i.test(internalNotes || '') || /OVERBOOKING/i.test(agencyNotes || '');
    const otaModification = /OTA MODIFICATION/i.test(agencyNotes || '');

    // Mapping unit → Channex room type
    let mapping: {
      connected: boolean;
      connectionId: number | null;
      connectionName: string | null;
      roomTypeExternalId: string | null;
      channexPropertyId: string | null;
      mappedUnits: number;
    } | null = null;

    if (reservation.unitId) {
      const mapRows = await AppDataSource.query(
        `SELECT m.*, c.id AS conn_id, c.name AS conn_name, c.status AS conn_status, p.code AS provider_code
         FROM integration_entity_mappings m
         INNER JOIN integration_connections c ON c.id = m.connection_id
         INNER JOIN integration_providers p ON p.id = c.provider_id
         WHERE m.entity_type = 'unit' AND m.local_id = ? AND m.is_active = 1 AND p.code = 'channex'
         LIMIT 1`,
        [reservation.unitId],
      );
      if (mapRows.length) {
        let meta: Record<string, any> = {};
        try {
          meta =
            typeof mapRows[0].metadata === 'string'
              ? JSON.parse(mapRows[0].metadata || '{}')
              : mapRows[0].metadata || {};
        } catch {
          meta = {};
        }
        const siblings = await AppDataSource.query(
          `SELECT COUNT(*) AS c FROM integration_entity_mappings
           WHERE connection_id = ? AND entity_type = 'unit' AND external_id = ? AND is_active = 1`,
          [mapRows[0].conn_id, mapRows[0].external_id],
        );
        mapping = {
          connected: mapRows[0].conn_status === 'connected',
          connectionId: Number(mapRows[0].conn_id),
          connectionName: mapRows[0].conn_name,
          roomTypeExternalId: String(mapRows[0].external_id),
          channexPropertyId: meta.channexPropertyId
            ? String(meta.channexPropertyId)
            : meta.propertyExternalId
              ? String(meta.propertyExternalId)
              : null,
          mappedUnits: Number(siblings[0]?.c || 1),
        };
      }
    }

    // Sync logs related to this reservation
    const params: unknown[] = [];
    const clauses: string[] = [];

    clauses.push(`JSON_UNQUOTE(JSON_EXTRACT(l.request_summary, '$.reservationId')) = ?`);
    params.push(String(reservationId));

    if (reservation.unitId) {
      clauses.push(
        `(JSON_UNQUOTE(JSON_EXTRACT(l.request_summary, '$.unitId')) = ? AND l.module IN ('availability','rates','reservations'))`,
      );
      params.push(String(reservation.unitId));
    }
    if (externalId) {
      clauses.push(`l.external_ref = ?`);
      params.push(externalId.replace(CHANNEX_EXTERNAL_PREFIX, ''));
      clauses.push(`l.external_ref LIKE ?`);
      params.push(`%${externalId.replace(CHANNEX_EXTERNAL_PREFIX, '').slice(0, 40)}%`);
      // booking id from channex:BOOKING:roomType
      const bare = externalId.replace(CHANNEX_EXTERNAL_PREFIX, '');
      const bookingPart = bare.split(':')[0];
      if (bookingPart) {
        clauses.push(`l.external_ref LIKE ?`);
        params.push(`%${bookingPart}%`);
      }
    }
    if (mapping?.roomTypeExternalId) {
      clauses.push(
        `(l.external_ref = ? AND l.module = 'availability' AND JSON_UNQUOTE(JSON_EXTRACT(l.request_summary, '$.unitId')) = ?)`,
      );
      params.push(mapping.roomTypeExternalId, String(reservation.unitId));
    }

    const logRows = await AppDataSource.query(
      `SELECT l.*, c.name AS connection_name, p.code AS provider_code, p.name AS provider_name
       FROM integration_sync_logs l
       INNER JOIN integration_connections c ON c.id = l.connection_id
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE p.code = 'channex' AND (${clauses.join(' OR ')})
       ORDER BY l.created_at ASC
       LIMIT 200`,
      params,
    );

    type TimelineItem = {
      id: string;
      at: string;
      title: string;
      description: string;
      status: 'success' | 'error' | 'skipped' | 'pending' | 'info';
      direction?: 'inbound' | 'outbound' | 'local';
      module?: string;
      action?: string;
      externalRef?: string | null;
      details?: Record<string, unknown> | null;
      errorMessage?: string | null;
    };

    const timeline: TimelineItem[] = [];

    // Anchor: local creation
    timeline.push({
      id: 'local-created',
      at: reservation.createdAt
        ? new Date(reservation.createdAt).toISOString()
        : new Date().toISOString(),
      title: isFromChannex ? 'Reserva criada no Unistays (importada)' : 'Reserva criada no Unistays',
      description: isFromChannex
        ? 'Registro local gerado a partir do Channel Manager / OTA.'
        : 'Reserva local. Se a unit estiver mapeada, a disponibilidade é enviada à Channex.',
      status: 'info',
      direction: 'local',
      details: {
        reservationNumber: reservation.reservationNumber,
        channel: reservation.channel,
        externalId,
      },
    });

    if (isFromChannex) {
      timeline.push({
        id: 'inbound-origin',
        at: reservation.createdAt
          ? new Date(reservation.createdAt).toISOString()
          : new Date().toISOString(),
        title: 'Origem Channel Manager (inbound)',
        description: `Importada via Channex · canal ${reservation.channel || 'OTA'}${externalId ? ` · ref ${externalId}` : ''}`,
        status: overbooking ? 'error' : 'success',
        direction: 'inbound',
        details: {
          externalId,
          agencyNotes,
          otaModification,
          overbooking,
        },
      });
    }

    if (mapping) {
      timeline.push({
        id: 'mapping',
        at: reservation.createdAt
          ? new Date(reservation.createdAt).toISOString()
          : new Date().toISOString(),
        title: mapping.connected
          ? 'Unit mapeada na Channex'
          : 'Mapping existe, conexão inativa',
        description: `Room type ${mapping.roomTypeExternalId?.slice(0, 8)}… · ${mapping.mappedUnits} unit(s) no inventário · conexão “${mapping.connectionName}”`,
        status: mapping.connected ? 'success' : 'error',
        direction: 'local',
        details: mapping as unknown as Record<string, unknown>,
      });
    } else {
      timeline.push({
        id: 'no-mapping',
        at: new Date().toISOString(),
        title: 'Sem mapping Channex',
        description:
          'Esta unit não está vinculada a um room type Channex. Availability OUT / import IN não se aplicam até mapear em Integrações.',
        status: 'skipped',
        direction: 'local',
      });
    }

    if (overbooking) {
      timeline.push({
        id: 'overbooking',
        at: reservation.createdAt
          ? new Date(reservation.createdAt).toISOString()
          : new Date().toISOString(),
        title: 'Overbooking detectado',
        description:
          'A OTA confirmou a reserva, mas não havia unit livre no Unistays. A reserva foi importada com flag — aloque manualmente.',
        status: 'error',
        direction: 'inbound',
        details: { internalNotes },
      });
    }

    if (otaModification) {
      timeline.push({
        id: 'ota-mod',
        at: reservation.updatedAt
          ? new Date(reservation.updatedAt).toISOString()
          : new Date().toISOString(),
        title: 'Modificação OTA recebida',
        description: 'A Channex enviou revision “modified”. Revise datas/unit/valores.',
        status: 'pending',
        direction: 'inbound',
      });
    }

    const actionTitle = (module: string, action: string, direction: string): string => {
      const key = `${direction}:${module}:${action}`;
      const map: Record<string, string> = {
        'outbound:availability:push_shared_inventory': 'Disponibilidade enviada à Channex',
        'outbound:availability:open_dates': 'Datas reabertas na Channex',
        'outbound:availability:block_dates': 'Datas bloqueadas na Channex',
        'outbound:rates:push_restrictions': 'Rates / restrictions enviados',
        'outbound:webhooks:register_webhook': 'Webhook registrado na Channex',
        'inbound:webhooks:booking': 'Webhook Channex recebido',
        'inbound:webhooks:booking_new': 'Webhook: nova reserva',
        'inbound:webhooks:booking_modification': 'Webhook: modificação',
        'inbound:webhooks:booking_cancellation': 'Webhook: cancelamento',
        'inbound:reservations:ack_revision': 'Revision ACK (confirmada na Channex)',
        'inbound:reservations:import_revision': 'Importação de revision',
        'inbound:reservations:unmapped_room_type': 'Room type sem mapping',
        'inbound:reservations:defer_ack': 'ACK adiado (erro)',
        'inbound:reservations:skip_foreign_property': 'Property ignorada (outra conta)',
        'inbound:reservations:recovery_since': 'Recovery de bookings',
      };
      return map[key] || `${module} · ${action}`;
    };

    for (const row of logRows) {
      let requestSummary: Record<string, unknown> | null = null;
      let responseSummary: Record<string, unknown> | null = null;
      try {
        requestSummary =
          typeof row.request_summary === 'string'
            ? JSON.parse(row.request_summary || 'null')
            : row.request_summary;
      } catch {
        requestSummary = null;
      }
      try {
        responseSummary =
          typeof row.response_summary === 'string'
            ? JSON.parse(row.response_summary || 'null')
            : row.response_summary;
      } catch {
        responseSummary = null;
      }

      const status = (row.status || 'pending') as TimelineItem['status'];
      const direction = (row.direction || 'outbound') as 'inbound' | 'outbound';
      const title = actionTitle(String(row.module), String(row.action), direction);
      let description = '';
      if (status === 'success') description = 'Operação concluída com sucesso.';
      else if (status === 'error') description = row.error_message || 'Falha na sincronização.';
      else if (status === 'skipped') description = 'Evento ignorado de propósito.';
      else description = 'Pendente / em processamento.';

      if (requestSummary && typeof requestSummary === 'object') {
        const rs = requestSummary as any;
        if (rs.startDate && rs.endDate) {
          description += ` · ${rs.startDate} → ${rs.endDate}`;
        }
        if (rs.available === false) description += ' · bloqueio';
        if (rs.available === true) description += ' · reabertura';
      }

      timeline.push({
        id: `log-${row.id}`,
        at: new Date(row.created_at).toISOString(),
        title,
        description,
        status: status === 'success' || status === 'error' || status === 'skipped' || status === 'pending'
          ? status
          : 'info',
        direction,
        module: row.module,
        action: row.action,
        externalRef: row.external_ref,
        details: {
          connection: row.connection_name,
          provider: row.provider_name,
          requestSummary,
          responseSummary,
        },
        errorMessage: row.error_message,
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    const hasErrors = timeline.some((t) => t.status === 'error');
    const hasSuccessOut = timeline.some(
      (t) => t.direction === 'outbound' && t.status === 'success' && t.module === 'availability',
    );
    const hasInbound = isFromChannex || timeline.some((t) => t.direction === 'inbound' && t.status === 'success');

    let overall: 'ok' | 'warning' | 'error' | 'idle' | 'inbound' | 'outbound' = 'idle';
    let label = 'Sem eventos de Channel Manager';
    if (hasErrors) {
      overall = 'error';
      label = 'Há falhas no caminho até a Channex';
    } else if (isFromChannex) {
      overall = overbooking ? 'error' : 'inbound';
      label = overbooking
        ? 'Importada da Channex com overbooking'
        : 'Importada da Channex (OTA → Unistays)';
    } else if (hasSuccessOut) {
      overall = 'outbound';
      label = 'Disponibilidade sincronizada com a Channex';
    } else if (mapping?.connected) {
      overall = 'warning';
      label = 'Mapeada, mas ainda sem log de sync para esta reserva';
    } else if (!mapping) {
      overall = 'idle';
      label = 'Não integrada ao Channel Manager';
    }

    const lastLog = logRows.length ? logRows[logRows.length - 1] : null;

    return {
      reservation: {
        id: reservation.id,
        reservationNumber: reservation.reservationNumber,
        status: reservation.status,
        channel: reservation.channel || null,
        externalId,
        unitId: reservation.unitId,
        checkIn: reservation.checkIn ? new Date(reservation.checkIn).toISOString() : null,
        checkOut: reservation.checkOut ? new Date(reservation.checkOut).toISOString() : null,
        createdAt: reservation.createdAt ? new Date(reservation.createdAt).toISOString() : null,
        agencyNotes,
        internalNotes,
        isFromChannex,
        overbooking,
        otaModification,
      },
      mapping,
      summary: {
        overall,
        label,
        hasErrors,
        lastSyncAt: lastLog ? new Date(lastLog.created_at).toISOString() : null,
        eventsCount: timeline.length,
      },
      timeline,
    };
  }

  private static async getMappedChannexPropertyIds(connectionId: number): Promise<Set<string>> {
    const ids = new Set<string>();
    const props = await this.listMappings(connectionId, 'property');
    for (const p of props) ids.add(p.externalId);
    const units = await this.listMappings(connectionId, 'unit');
    for (const u of units) {
      const pid = u.metadata?.channexPropertyId || u.metadata?.propertyExternalId;
      if (pid) ids.add(String(pid));
    }
    return ids;
  }

  private static async pickFreeUnitForStay(
    unitIds: number[],
    checkInDate: string,
    checkOutDate: string,
    existingExternalId?: string,
  ): Promise<number | null> {
    if (!unitIds.length) return null;

    // Prefer keep same unit if reservation already exists
    if (existingExternalId) {
      const existing = await AppDataSource.getRepository(Reservation).findOne({
        where: { externalId: existingExternalId },
      });
      if (existing?.unitId && unitIds.includes(existing.unitId)) {
        return existing.unitId;
      }
    }

    const units = await AppDataSource.getRepository(Unit).find({ where: { id: In(unitIds) } });
    const sellable = units
      .filter((u) => !BLOCKING_UNIT_STATUSES.has(u.status))
      .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }));

    const reservations = await AppDataSource.getRepository(Reservation).find({
      where: {
        unitId: In(sellable.map((u) => u.id)),
        status: Not(ReservationStatus.CANCELLED),
      },
    });

    const stay = stayNightRange(checkInDate, checkOutDate);
    if (!stay) return sellable[0]?.id ?? null;

    for (const unit of sellable) {
      const conflict = reservations.some((r) => {
        if (r.unitId !== unit.id) return false;
        if (existingExternalId && r.externalId === existingExternalId) return false;
        const other = stayNightRange(r.checkIn, r.checkOut);
        if (!other) return false;
        return !(other.endDate < stay.startDate || other.startDate > stay.endDate);
      });
      if (!conflict) return unit.id;
    }

    return null;
  }

  private static async upsertFromChannexRoom(
    connectionId: number,
    unitId: number,
    external: ExternalReservationSummary,
    revisionId: string,
    opts?: { overbooking?: boolean; modified?: boolean; channexBookingId?: string },
  ): Promise<void> {
    const unit = await AppDataSource.getRepository(Unit).findOne({ where: { id: unitId } });
    if (!unit) throw new AppError('Unit mapeada não encontrada', 404);

    const externalId = `${CHANNEX_EXTERNAL_PREFIX}${external.stayCode}`;
    const reservationRepo = AppDataSource.getRepository(Reservation);
    const guestRepo = AppDataSource.getRepository(Guest);

    let reservation = await reservationRepo.findOne({ where: { externalId } });
    // Also dedupe by channex booking id mapping
    if (!reservation && opts?.channexBookingId) {
      const bookingMaps = await this.listMappings(connectionId, 'channel');
      const hit = bookingMaps.find((m) => m.externalId === opts.channexBookingId);
      if (hit?.localId) {
        reservation = await reservationRepo.findOne({ where: { id: hit.localId } });
      }
    }

    const status = mapChannelBookingStatus(external.status);
    const { firstName, lastName } = parseGuestName(external.guestName);

    let guest: Guest | null = null;
    if (reservation?.guestId) {
      guest = await guestRepo.findOne({ where: { id: reservation.guestId } });
    }
    if (!guest && external.guestEmail) {
      guest = await guestRepo.findOne({ where: { email: external.guestEmail } });
    }
    if (!guest) {
      guest = guestRepo.create({
        firstName,
        lastName,
        email: external.guestEmail || null,
        phone: external.guestPhone || null,
      });
      await guestRepo.save(guest);
    }

    const checkIn = new Date(`${external.checkInDate}T14:00:00`);
    const checkOut = new Date(`${external.checkOutDate}T11:00:00`);
    const nights = Math.max(
      1,
      Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const flags: string[] = [];
    if (opts?.overbooking) flags.push('[OVERBOOKING CHANEX]');
    if (opts?.modified) flags.push('[OTA MODIFICATION — revisar]');
    const flagLine = flags.length ? `${flags.join(' ')} · ` : '';

    if (!reservation) {
      reservation = reservationRepo.create({
        reservationNumber: `CX-${revisionId}`.slice(0, 50),
        confirmationCode: external.reservationCode,
        propertyId: unit.propertyId,
        unitId: unit.id,
        guestId: guest.id,
        status,
        checkIn,
        checkOut,
        nights,
        adults: external.adults || 1,
        children: external.children || 0,
        channel: external.channelType || 'channex',
        externalId,
        totalAmount: external.totalAmount ?? 0,
        agencyName: external.channelType || 'channex',
        agencyNotes: `${flagLine}Importado Channex · ${external.reservationCode}${external.channelReservationId ? ` · OTA ${external.channelReservationId}` : ''}`,
        internalNotes: opts?.overbooking
          ? 'OVERBOOKING: nenhuma unit livre no momento da importação OTA — alocar manualmente.'
          : null,
        isAgency: true,
      } as unknown as Reservation);
    } else {
      reservation.status = status;
      reservation.checkIn = checkIn;
      reservation.checkOut = checkOut;
      reservation.nights = nights;
      reservation.unitId = unit.id;
      reservation.propertyId = unit.propertyId;
      reservation.channel = external.channelType || reservation.channel;
      if (external.totalAmount != null) reservation.totalAmount = external.totalAmount;
      if (flagLine) {
        reservation.agencyNotes = `${flagLine}${reservation.agencyNotes || ''}`.slice(0, 2000);
      }
      if (opts?.overbooking) {
        reservation.internalNotes = [
          reservation.internalNotes,
          'OVERBOOKING: nenhuma unit livre no momento da importação OTA — alocar manualmente.',
        ]
          .filter(Boolean)
          .join('\n');
      }
    }

    await reservationRepo.save(reservation);

    if (opts?.channexBookingId) {
      try {
        await this.upsertEntityMapping(connectionId, {
          entityType: 'channel',
          localId: reservation.id,
          externalId: opts.channexBookingId,
          externalLabel: external.channelReservationId || external.reservationCode,
          metadata: { stayCode: external.stayCode, revisionId },
        });
      } catch {
        /* ignore mapping conflicts */
      }
    }

    await this.syncAvailabilityForReservation({
      unitId: unit.id,
      checkIn,
      checkOut,
      available: status === ReservationStatus.CANCELLED,
      externalId: externalId,
      reservationId: reservation.id,
    });
  }

  private static async getAdapterForConnection(connectionId: number) {
    await ensureIntegrationSchema();
    const rows = await AppDataSource.query(
      `SELECT c.*, p.code AS provider_code, p.name AS provider_name
       FROM integration_connections c
       INNER JOIN integration_providers p ON p.id = c.provider_id
       WHERE c.id = ? LIMIT 1`,
      [connectionId],
    );
    if (!rows.length) throw new AppError('Conexão não encontrada', 404);
    const adapter = this.getAdapter(rows[0].provider_code);
    let settings: Record<string, any> = {};
    try {
      settings =
        typeof rows[0].settings === 'string'
          ? JSON.parse(rows[0].settings || '{}')
          : rows[0].settings || {};
    } catch {
      settings = {};
    }
    const credentials = {
      ...decryptCredentials(rows[0].credentials_encrypted),
      environment: String(settings.environment || 'staging'),
      apiKey:
        decryptCredentials(rows[0].credentials_encrypted).apiKey ||
        decryptCredentials(rows[0].credentials_encrypted).accessToken ||
        '',
    };
    return { adapter, credentials, row: rows[0] };
  }

  private static mapConnection(row: any): IntegrationConnection {
    let settings: Record<string, unknown> = {};
    try {
      settings =
        typeof row.settings === 'string'
          ? JSON.parse(row.settings || '{}')
          : row.settings || {};
    } catch {
      settings = {};
    }

    return {
      id: Number(row.id),
      uuid: row.uuid,
      providerId: Number(row.provider_id),
      providerCode: row.provider_code,
      providerName: row.provider_name,
      propertyId: row.property_id != null ? Number(row.property_id) : null,
      name: row.name,
      status: row.status,
      authType: row.auth_type,
      settings,
      externalAccountId: row.external_account_id,
      lastSyncAt: row.last_sync_at
        ? new Date(row.last_sync_at).toISOString()
        : null,
      lastError: row.last_error,
      hasCredentials: !!row.credentials_encrypted,
      webhookUrl: this.buildWebhookUrl(row.uuid, row.provider_code),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private static mapMapping(row: any): IntegrationEntityMapping {
    let metadata: Record<string, unknown> = {};
    try {
      metadata =
        typeof row.metadata === 'string'
          ? JSON.parse(row.metadata || '{}')
          : row.metadata || {};
    } catch {
      metadata = {};
    }

    return {
      id: Number(row.id),
      connectionId: Number(row.connection_id),
      entityType: row.entity_type,
      localId: Number(row.local_id),
      externalId: String(row.external_id),
      externalLabel: row.external_label,
      metadata,
      isActive: row.is_active === 1 || row.is_active === true,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private static async addSyncLog(
    connectionId: number,
    input: {
      direction: 'inbound' | 'outbound';
      module: string;
      action: string;
      status: 'success' | 'error' | 'skipped' | 'pending';
      externalRef?: string | null;
      requestSummary?: Record<string, unknown> | null;
      responseSummary?: Record<string, unknown> | null;
      errorMessage?: string | null;
    },
  ) {
    await AppDataSource.query(
      `INSERT INTO integration_sync_logs
        (connection_id, direction, module, action, status, external_ref, request_summary, response_summary, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        connectionId,
        input.direction,
        input.module,
        input.action,
        input.status,
        input.externalRef ?? null,
        input.requestSummary ? JSON.stringify(input.requestSummary) : null,
        input.responseSummary ? JSON.stringify(input.responseSummary) : null,
        input.errorMessage ?? null,
      ],
    );
  }
}
