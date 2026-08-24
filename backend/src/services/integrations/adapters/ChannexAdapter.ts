import type {
  AvailabilityUpdateInput,
  ChannelManagerAdapter,
  ExternalListingSummary,
  ExternalPropertySummary,
  ExternalReservationSummary,
  TestConnectionResult,
} from '../types';

export type ChannexEnvironment = 'staging' | 'production';

const CHANNEX_BASE: Record<ChannexEnvironment, string> = {
  staging: 'https://staging.channex.io/api/v1',
  production: 'https://app.channex.io/api/v1',
};

export interface ChannexRoomTypeSummary {
  externalId: string;
  title: string;
  propertyExternalId: string;
  countOfRooms: number;
  occAdults?: number;
  defaultOccupancy?: number;
}

export interface ChannexRatePlanSummary {
  externalId: string;
  title: string;
  propertyExternalId: string;
  roomTypeExternalId: string;
  currency?: string;
  sellMode?: string;
}

export interface ChannexRestrictionValue {
  property_id: string;
  rate_plan_id: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  rate?: string | number;
  min_stay?: number;
  min_stay_arrival?: number;
  min_stay_through?: number;
  max_stay?: number;
  stop_sell?: boolean | 0 | 1;
  closed_to_arrival?: boolean | 0 | 1;
  closed_to_departure?: boolean | 0 | 1;
}

export interface ChannexAvailabilityValue {
  property_id: string;
  room_type_id: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  availability: number;
}

export interface ChannexBookingRevision {
  revisionId: string;
  bookingId: string;
  uniqueId: string;
  propertyExternalId: string;
  otaName: string;
  otaReservationCode?: string | null;
  status: string;
  customer?: {
    name?: string;
    surname?: string;
    mail?: string;
    phone?: string;
  };
  rooms: Array<{
    roomTypeId: string;
    ratePlanId?: string;
    checkinDate: string;
    checkoutDate: string;
    amount?: string | number | null;
    adults?: number;
    children?: number;
  }>;
  raw?: Record<string, unknown>;
}

/**
 * Channex Channel Manager adapter (PMS → OTAs).
 * Docs: https://docs.channex.io/
 * Auth header: user-api-key
 */
export class ChannexAdapter implements ChannelManagerAdapter {
  readonly providerCode = 'channex';

  private resolveBase(credentials: Record<string, string>): string {
    const env = (credentials.environment === 'production' ? 'production' : 'staging') as ChannexEnvironment;
    return CHANNEX_BASE[env];
  }

  private apiKey(credentials: Record<string, string>): string {
    return (credentials.apiKey || credentials.accessToken || '').trim();
  }

  private async request<T = unknown>(
    credentials: Record<string, string>,
    path: string,
    init?: RequestInit,
    attempt: number = 0,
  ): Promise<{ ok: boolean; status: number; data: T; errorMsg?: string }> {
    const key = this.apiKey(credentials);
    if (!key) {
      return { ok: false, status: 401, data: {} as T, errorMsg: 'API Key Channex não informada' };
    }

    try {
      const response = await fetch(`${this.resolveBase(credentials)}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'user-api-key': key,
          ...(init?.headers || {}),
        },
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Retry transient failures (skill: 429 / 5xx with backoff)
      if ((response.status === 429 || response.status >= 500) && attempt < 4) {
        const delayMs = Math.min(8000, 400 * Math.pow(2, attempt));
        await new Promise((r) => setTimeout(r, delayMs));
        return this.request(credentials, path, init, attempt + 1);
      }

      if (!response.ok) {
        const err = data?.errors;
        const errorMsg =
          (typeof err?.title === 'string' && err.title) ||
          (Array.isArray(err?.details) ? err.details.join(', ') : null) ||
          (typeof err?.details === 'string' ? err.details : null) ||
          (typeof err === 'string' ? err : null) ||
          `Channex HTTP ${response.status}`;
        return { ok: false, status: response.status, data: data as T, errorMsg };
      }

      return { ok: true, status: response.status, data: data as T };
    } catch (err: any) {
      if (attempt < 3) {
        const delayMs = Math.min(5000, 300 * Math.pow(2, attempt));
        await new Promise((r) => setTimeout(r, delayMs));
        return this.request(credentials, path, init, attempt + 1);
      }
      return {
        ok: false,
        status: 0,
        data: {} as T,
        errorMsg: err?.message || 'Falha de rede Channex',
      };
    }
  }

  async testConnection(credentials: Record<string, string>): Promise<TestConnectionResult> {
    const result = await this.request<any>(credentials, '/properties?pagination[page]=1&pagination[limit]=1');
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao conectar na Channex' };
    }

    const list = await this.request<any>(
      credentials,
      '/properties?pagination[page]=1&pagination[limit]=100',
    );
    const items = Array.isArray(list.data?.data) ? list.data.data : [];
    return {
      ok: true,
      message: `Conexão Channex OK (${credentials.environment === 'production' ? 'produção' : 'staging'})`,
      propertyCount: items.length,
    };
  }

  async listProperties(credentials: Record<string, string>): Promise<ExternalPropertySummary[]> {
    const result = await this.request<any>(
      credentials,
      '/properties?pagination[page]=1&pagination[limit]=100',
    );
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao listar properties Channex');
    }

    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    return items
      .map((item: any) => {
        const attrs = item.attributes || item;
        return {
          externalId: String(item.id || attrs.id || ''),
          title: String(attrs.title || attrs.name || `Property ${item.id}`),
          address: attrs.address
            ? [attrs.address, attrs.city, attrs.country].filter(Boolean).join(', ')
            : attrs.city || null,
          raw: item,
        };
      })
      .filter((p: ExternalPropertySummary) => !!p.externalId);
  }

  async listRoomTypes(
    credentials: Record<string, string>,
    propertyExternalId?: string,
  ): Promise<ChannexRoomTypeSummary[]> {
    const qs = new URLSearchParams({
      'pagination[page]': '1',
      'pagination[limit]': '100',
    });
    if (propertyExternalId) qs.set('filter[property_id]', propertyExternalId);

    const result = await this.request<any>(credentials, `/room_types?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao listar room types Channex');
    }

    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    return items
      .map((item: any) => {
        const attrs = item.attributes || item;
        const propRel = item.relationships?.property?.data?.id;
        return {
          externalId: String(item.id || attrs.id || ''),
          title: String(attrs.title || `Room ${item.id}`),
          propertyExternalId: String(propRel || attrs.property_id || propertyExternalId || ''),
          countOfRooms: Number(attrs.count_of_rooms ?? 1) || 1,
          occAdults: attrs.occ_adults != null ? Number(attrs.occ_adults) : undefined,
          defaultOccupancy:
            attrs.default_occupancy != null ? Number(attrs.default_occupancy) : undefined,
        };
      })
      .filter((r: ChannexRoomTypeSummary) => !!r.externalId);
  }

  /** Prefer updateRoomTypeAvailability — Channex inventory is per room_type. */
  async updateAvailabilities(
    credentials: Record<string, string>,
    _input: AvailabilityUpdateInput,
  ): Promise<{ ok: boolean; message?: string }> {
    return {
      ok: false,
      message: 'Use updateRoomTypeAvailability para Channex (disponibilidade por room_type)',
    };
  }

  async createProperty(
    credentials: Record<string, string>,
    input: {
      title: string;
      currency?: string;
      email?: string | null;
      phone?: string | null;
      zipCode?: string | null;
      country?: string | null;
      state?: string | null;
      city?: string | null;
      address?: string | null;
      timezone?: string | null;
      propertyType?: string | null;
    },
  ): Promise<{ ok: boolean; id?: string; message?: string }> {
    const body = {
      property: {
        title: input.title,
        currency: (input.currency || 'BRL').toUpperCase().slice(0, 3),
        email: input.email || undefined,
        phone: input.phone || undefined,
        zip_code: input.zipCode || undefined,
        country: input.country || 'BR',
        state: input.state || undefined,
        city: input.city || undefined,
        address: input.address || undefined,
        timezone: input.timezone || 'America/Sao_Paulo',
        property_type: input.propertyType || 'hotel',
        facilities: [],
        settings: {
          allow_availability_autoupdate_on_confirmation: true,
          allow_availability_autoupdate_on_modification: false,
          allow_availability_autoupdate_on_cancellation: false,
          min_stay_type: 'both',
          state_length: 500,
          cut_off_time: '00:00:00',
          cut_off_days: 0,
        },
      },
    };

    const result = await this.request<any>(credentials, '/properties', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao criar property Channex' };
    }
    const id = result.data?.data?.id ?? result.data?.data?.attributes?.id;
    return { ok: true, id: id != null ? String(id) : undefined, message: 'Property criada na Channex' };
  }

  async createRoomType(
    credentials: Record<string, string>,
    input: {
      propertyExternalId: string;
      title: string;
      countOfRooms: number;
      occAdults?: number;
      occChildren?: number;
      occInfants?: number;
      defaultOccupancy?: number;
      roomKind?: 'room' | 'dorm';
      description?: string | null;
    },
  ): Promise<{ ok: boolean; id?: string; message?: string }> {
    const adults = Math.max(1, input.occAdults ?? 2);
    const body = {
      room_type: {
        property_id: input.propertyExternalId,
        title: input.title,
        count_of_rooms: Math.max(1, Math.floor(input.countOfRooms)),
        occ_adults: adults,
        occ_children: Math.max(0, input.occChildren ?? 0),
        occ_infants: Math.max(0, input.occInfants ?? 0),
        default_occupancy: Math.min(adults, Math.max(1, input.defaultOccupancy ?? adults)),
        room_kind: input.roomKind || 'room',
        facilities: [],
        content: input.description ? { description: input.description } : undefined,
      },
    };

    const result = await this.request<any>(credentials, '/room_types', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao criar room type Channex' };
    }
    const id = result.data?.data?.id ?? result.data?.data?.attributes?.id;
    return { ok: true, id: id != null ? String(id) : undefined, message: 'Room type criado na Channex' };
  }

  async updateRoomType(
    credentials: Record<string, string>,
    roomTypeId: string,
    input: {
      title?: string;
      countOfRooms?: number;
      occAdults?: number;
      occChildren?: number;
      occInfants?: number;
      defaultOccupancy?: number;
    },
  ): Promise<{ ok: boolean; message?: string }> {
    const room_type: Record<string, unknown> = {};
    if (input.title != null) room_type.title = input.title;
    if (input.countOfRooms != null) room_type.count_of_rooms = Math.max(1, Math.floor(input.countOfRooms));
    if (input.occAdults != null) room_type.occ_adults = input.occAdults;
    if (input.occChildren != null) room_type.occ_children = input.occChildren;
    if (input.occInfants != null) room_type.occ_infants = input.occInfants;
    if (input.defaultOccupancy != null) room_type.default_occupancy = input.defaultOccupancy;

    const result = await this.request(credentials, `/room_types/${encodeURIComponent(roomTypeId)}`, {
      method: 'PUT',
      body: JSON.stringify({ room_type }),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao atualizar room type Channex' };
    }
    return { ok: true, message: 'Room type atualizado' };
  }

  async listRatePlans(
    credentials: Record<string, string>,
    propertyExternalId?: string,
  ): Promise<ChannexRatePlanSummary[]> {
    const qs = new URLSearchParams({
      'pagination[page]': '1',
      'pagination[limit]': '100',
    });
    if (propertyExternalId) qs.set('filter[property_id]', propertyExternalId);

    const result = await this.request<any>(credentials, `/rate_plans?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao listar rate plans Channex');
    }

    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    return items
      .map((item: any) => {
        const attrs = item.attributes || item;
        return {
          externalId: String(item.id || attrs.id || ''),
          title: String(attrs.title || `Rate ${item.id}`),
          propertyExternalId: String(
            item.relationships?.property?.data?.id || attrs.property_id || propertyExternalId || '',
          ),
          roomTypeExternalId: String(
            item.relationships?.room_type?.data?.id || attrs.room_type_id || '',
          ),
          currency: attrs.currency != null ? String(attrs.currency) : undefined,
          sellMode: attrs.sell_mode != null ? String(attrs.sell_mode) : undefined,
        };
      })
      .filter((r: ChannexRatePlanSummary) => !!r.externalId);
  }

  async createRatePlan(
    credentials: Record<string, string>,
    input: {
      propertyExternalId: string;
      roomTypeExternalId: string;
      title: string;
      currency?: string;
      occupancy?: number;
      sellMode?: 'per_room' | 'per_person';
    },
  ): Promise<{ ok: boolean; id?: string; message?: string }> {
    const occupancy = Math.max(1, input.occupancy ?? 2);
    const body = {
      rate_plan: {
        title: input.title,
        property_id: input.propertyExternalId,
        room_type_id: input.roomTypeExternalId,
        currency: (input.currency || 'BRL').toUpperCase().slice(0, 3),
        sell_mode: input.sellMode || 'per_room',
        rate_mode: 'manual',
        children_fee: '0.00',
        infant_fee: '0.00',
        max_stay: [0, 0, 0, 0, 0, 0, 0],
        min_stay_arrival: [1, 1, 1, 1, 1, 1, 1],
        min_stay_through: [1, 1, 1, 1, 1, 1, 1],
        closed_to_arrival: [false, false, false, false, false, false, false],
        closed_to_departure: [false, false, false, false, false, false, false],
        stop_sell: [false, false, false, false, false, false, false],
        options: [{ occupancy, is_primary: true, rate: 0 }],
        inherit_rate: false,
        inherit_closed_to_arrival: false,
        inherit_closed_to_departure: false,
        inherit_stop_sell: false,
        inherit_min_stay_arrival: false,
        inherit_min_stay_through: false,
        inherit_max_stay: false,
        inherit_max_sell: false,
        inherit_max_availability: false,
        inherit_availability_offset: false,
      },
    };

    const result = await this.request<any>(credentials, '/rate_plans', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao criar rate plan Channex' };
    }
    const id = result.data?.data?.id ?? result.data?.data?.attributes?.id;
    return { ok: true, id: id != null ? String(id) : undefined, message: 'Rate plan criado na Channex' };
  }

  async updateRestrictions(
    credentials: Record<string, string>,
    values: ChannexRestrictionValue[],
  ): Promise<{ ok: boolean; message?: string; warnings?: unknown[] }> {
    if (!values.length) {
      return { ok: true, message: 'Nenhuma restrição para enviar' };
    }

    const result = await this.request<any>(credentials, '/restrictions', {
      method: 'POST',
      body: JSON.stringify({ values }),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao atualizar rates/restrictions Channex' };
    }
    const warnings = Array.isArray(result.data?.meta?.warnings) ? result.data.meta.warnings : [];
    return {
      ok: true,
      message: warnings.length
        ? `Rates enviados com ${warnings.length} aviso(s)`
        : 'Rates/restrictions enviados à Channex',
      warnings,
    };
  }

  async updateAvailabilityValues(
    credentials: Record<string, string>,
    values: ChannexAvailabilityValue[],
  ): Promise<{ ok: boolean; message?: string }> {
    if (!values.length) {
      return { ok: true, message: 'Nenhuma disponibilidade para enviar' };
    }

    const result = await this.request(credentials, '/availability', {
      method: 'POST',
      body: JSON.stringify({
        values: values.map((v) => ({
          ...v,
          availability: Math.max(0, Math.floor(v.availability)),
        })),
      }),
    });

    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao atualizar disponibilidade Channex' };
    }
    return { ok: true, message: 'Disponibilidade enviada à Channex' };
  }

  async updateRoomTypeAvailability(
    credentials: Record<string, string>,
    input: {
      propertyExternalId: string;
      roomTypeExternalId: string;
      startDate: string;
      endDate: string;
      availability: number;
    },
  ): Promise<{ ok: boolean; message?: string }> {
    return this.updateAvailabilityValues(credentials, [
      {
        property_id: input.propertyExternalId,
        room_type_id: input.roomTypeExternalId,
        date_from: input.startDate,
        date_to: input.endDate,
        availability: input.availability,
      },
    ]);
  }

  async listBookingRevisionsFeed(
    credentials: Record<string, string>,
    propertyExternalId?: string,
  ): Promise<ChannexBookingRevision[]> {
    const page = await this.listBookingRevisionsFeedPage(credentials, {
      propertyExternalId,
      limit: 100,
    });
    return page.revisions;
  }

  /** Feed paginado — drain até meta.total = 0 (skill: não cair no cliff de 30 min). */
  async listBookingRevisionsFeedPage(
    credentials: Record<string, string>,
    opts?: { propertyExternalId?: string; limit?: number; page?: number },
  ): Promise<{
    revisions: ChannexBookingRevision[];
    meta: { total: number; limit: number; page: number };
  }> {
    const qs = new URLSearchParams({
      'pagination[limit]': String(opts?.limit ?? 100),
      'pagination[page]': String(opts?.page ?? 1),
    });
    if (opts?.propertyExternalId) {
      qs.set('filter[property_id]', opts.propertyExternalId);
    }
    const result = await this.request<any>(credentials, `/booking_revisions/feed?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao buscar feed de reservas Channex');
    }
    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    const meta = result.data?.meta || {};
    return {
      revisions: items.map((item: any) => this.mapRevision(item)),
      meta: {
        total: Number(meta.total ?? items.length) || 0,
        limit: Number(meta.limit ?? opts?.limit ?? 100) || 100,
        page: Number(meta.page ?? opts?.page ?? 1) || 1,
      },
    };
  }

  async getBookingRevision(
    credentials: Record<string, string>,
    revisionId: string,
  ): Promise<ChannexBookingRevision | null> {
    const result = await this.request<any>(
      credentials,
      `/booking_revisions/${encodeURIComponent(revisionId)}`,
    );
    if (!result.ok) {
      return null;
    }
    const item = result.data?.data;
    if (!item) return null;
    return this.mapRevision(item);
  }

  async acknowledgeBookingRevision(
    credentials: Record<string, string>,
    revisionId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    const result = await this.request(credentials, `/booking_revisions/${encodeURIComponent(revisionId)}/ack`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao acknowledge reserva Channex' };
    }
    return { ok: true, message: 'Booking revision acknowledged' };
  }

  /** Readback de disponibilidade (skill: não confiar só no 200). */
  async getAvailability(
    credentials: Record<string, string>,
    input: { propertyExternalId: string; dateFrom: string; dateTo: string },
  ): Promise<Record<string, Record<string, number>>> {
    const qs = new URLSearchParams({
      'filter[property_id]': input.propertyExternalId,
      'filter[date][gte]': input.dateFrom,
      'filter[date][lte]': input.dateTo,
    });
    const result = await this.request<any>(credentials, `/availability?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao ler availability Channex');
    }
    return (result.data?.data || {}) as Record<string, Record<string, number>>;
  }

  /** Readback de restrictions — filter[restrictions] é OBRIGATÓRIO. */
  async getRestrictions(
    credentials: Record<string, string>,
    input: {
      propertyExternalId: string;
      dateFrom: string;
      dateTo: string;
      fields?: string;
    },
  ): Promise<Record<string, Record<string, Record<string, unknown>>>> {
    const qs = new URLSearchParams({
      'filter[property_id]': input.propertyExternalId,
      'filter[date][gte]': input.dateFrom,
      'filter[date][lte]': input.dateTo,
      'filter[restrictions]': input.fields || 'rate,min_stay_arrival,min_stay_through,stop_sell',
    });
    const result = await this.request<any>(credentials, `/restrictions?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao ler restrictions Channex');
    }
    return (result.data?.data || {}) as Record<string, Record<string, Record<string, unknown>>>;
  }

  /**
   * Recovery após outage >30 min (skill: manual/time-scoped, não cron cego).
   * GET /bookings?filter[inserted_at][gte]=...
   */
  async listBookingsSince(
    credentials: Record<string, string>,
    input: { insertedAtGte: string; propertyExternalId?: string; page?: number; limit?: number },
  ): Promise<{ bookings: any[]; meta: { total: number; limit: number; page: number } }> {
    const qs = new URLSearchParams({
      'pagination[page]': String(input.page ?? 1),
      'pagination[limit]': String(input.limit ?? 50),
      'filter[inserted_at][gte]': input.insertedAtGte,
    });
    if (input.propertyExternalId) {
      qs.set('filter[property_id]', input.propertyExternalId);
    }
    const result = await this.request<any>(credentials, `/bookings?${qs.toString()}`);
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao listar bookings Channex (recovery)');
    }
    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    const meta = result.data?.meta || {};
    return {
      bookings: items,
      meta: {
        total: Number(meta.total ?? items.length) || 0,
        limit: Number(meta.limit ?? input.limit ?? 50) || 50,
        page: Number(meta.page ?? input.page ?? 1) || 1,
      },
    };
  }

  async getReservation(
    credentials: Record<string, string>,
    params: { stayCode?: string; reservationCode?: string },
  ): Promise<ExternalReservationSummary | null> {
    // Channex uses feed/revisions; this maps a single unique_id lookup via list if needed
    const feed = await this.listBookingRevisionsFeed(credentials);
    const hit = feed.find(
      (r) =>
        r.uniqueId === params.stayCode ||
        r.uniqueId === params.reservationCode ||
        r.bookingId === params.stayCode,
    );
    if (!hit || !hit.rooms[0]) return null;
    const room = hit.rooms[0];
    return {
      reservationCode: hit.uniqueId,
      stayCode: hit.revisionId,
      propertyExternalId: hit.propertyExternalId,
      channelType: hit.otaName || 'channex',
      channelReservationId: hit.otaReservationCode,
      status: hit.status,
      checkInDate: room.checkinDate,
      checkOutDate: room.checkoutDate,
      guestName: [hit.customer?.name, hit.customer?.surname].filter(Boolean).join(' ') || null,
      guestEmail: hit.customer?.mail || null,
      guestPhone: hit.customer?.phone || null,
      adults: room.adults || 1,
      children: room.children || 0,
      totalAmount: room.amount != null ? Number(room.amount) : null,
      raw: hit.raw,
    };
  }

  async createWebhook(
    credentials: Record<string, string>,
    input: { url: string; events?: string[]; propertyExternalId?: string; isGlobal?: boolean },
  ): Promise<{ ok: boolean; message?: string; id?: string }> {
    const eventMask = input.events?.length
      ? input.events.join(';')
      : 'booking_new;booking_modification;booking_cancellation';
    const body: Record<string, unknown> = {
      webhook: {
        callback_url: input.url,
        event_mask: eventMask,
        is_active: true,
        send_data: true,
        is_global: input.isGlobal !== false && !input.propertyExternalId,
        ...(input.propertyExternalId ? { property_id: input.propertyExternalId } : {}),
      },
    };

    const result = await this.request<any>(credentials, '/webhooks', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      return { ok: false, message: result.errorMsg || 'Falha ao criar webhook Channex' };
    }

    const id = result.data?.data?.id ?? result.data?.data?.attributes?.id;
    return { ok: true, message: 'Webhook Channex criado', id: id != null ? String(id) : undefined };
  }

  async listWebhooks(
    credentials: Record<string, string>,
  ): Promise<Array<{ id: string; url: string; events?: string[] }>> {
    const result = await this.request<any>(credentials, '/webhooks?pagination[page]=1&pagination[limit]=100');
    if (!result.ok) {
      throw new Error(result.errorMsg || 'Erro ao listar webhooks Channex');
    }
    const items = Array.isArray(result.data?.data) ? result.data.data : [];
    return items.map((item: any) => {
      const attrs = item.attributes || item;
      return {
        id: String(item.id || attrs.id || ''),
        url: String(attrs.callback_url || ''),
        events: attrs.event_mask ? String(attrs.event_mask).split(',') : undefined,
      };
    }).filter((w: { id: string; url: string }) => !!w.id);
  }

  async listListings(): Promise<ExternalListingSummary[]> {
    return [];
  }

  private mapRevision(item: any): ChannexBookingRevision {
    const attrs = item.attributes || item;
    const roomsRaw = Array.isArray(attrs.rooms) ? attrs.rooms : [];
    return {
      revisionId: String(item.id || attrs.id || ''),
      bookingId: String(attrs.booking_id || ''),
      uniqueId: String(attrs.unique_id || attrs.ota_reservation_code || item.id || ''),
      propertyExternalId: String(attrs.property_id || ''),
      otaName: String(attrs.ota_name || 'channex'),
      otaReservationCode: attrs.ota_reservation_code != null ? String(attrs.ota_reservation_code) : null,
      status: String(attrs.status || 'new'),
      customer: attrs.customer || {},
      rooms: roomsRaw.map((r: any) => ({
        roomTypeId: String(r.room_type_id || ''),
        ratePlanId: r.rate_plan_id != null ? String(r.rate_plan_id) : undefined,
        checkinDate: String(r.checkin_date || '').slice(0, 10),
        checkoutDate: String(r.checkout_date || '').slice(0, 10),
        amount: r.amount ?? null,
        adults: Number(r.occupancy?.adults ?? 1) || 1,
        children: Number(r.occupancy?.children ?? 0) || 0,
      })),
      raw: item,
    };
  }
}
