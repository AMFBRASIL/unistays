/**
 * Domain types for Channel Manager integrations.
 * Adapters (Channex) must map TO these — never leak provider DTOs into Unistays domain.
 */

export type IntegrationProviderCode = 'channex' | string;

export type IntegrationConnectionStatus =
  | 'disconnected'
  | 'connected'
  | 'error'
  | 'disabled';

export type IntegrationEntityType =
  | 'property'
  | 'unit'
  | 'room_type'
  | 'rate_plan'
  | 'listing'
  | 'channel';

export type IntegrationModule =
  | 'connection'
  | 'reservations'
  | 'availability'
  | 'rates'
  | 'messages'
  | 'reviews'
  | 'tasks'
  | 'webhooks'
  | 'other';

export interface IntegrationProvider {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  capabilities: Record<string, boolean>;
}

export interface IntegrationConnection {
  id: number;
  uuid: string;
  providerId: number;
  providerCode: string;
  providerName: string;
  propertyId: number | null;
  name: string;
  status: IntegrationConnectionStatus;
  authType: 'access_token' | 'oauth';
  settings: Record<string, unknown>;
  externalAccountId: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
  hasCredentials: boolean;
  webhookUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationEntityMapping {
  id: number;
  connectionId: number;
  entityType: IntegrationEntityType;
  localId: number;
  externalId: string;
  externalLabel: string | null;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalPropertySummary {
  externalId: string;
  title: string;
  address?: string | null;
  raw?: Record<string, unknown>;
}

export interface ExternalListingSummary {
  listingId: string;
  channelType: string;
  title?: string;
  propertyExternalId?: string;
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  externalAccountHint?: string;
  propertyCount?: number;
}

export interface AvailabilityUpdateInput {
  propertyExternalIds: string[];
  startDate: string;
  endDate: string;
  available: boolean;
}

export interface ExternalReservationSummary {
  reservationCode: string;
  stayCode: string;
  propertyExternalId: string;
  channelType: string;
  channelReservationId?: string | null;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  adults?: number;
  children?: number;
  totalAmount?: number | null;
  currency?: string | null;
  raw?: Record<string, unknown>;
}

export interface ChannelManagerAdapter {
  readonly providerCode: string;

  testConnection(credentials: Record<string, string>): Promise<TestConnectionResult>;

  listProperties(credentials: Record<string, string>): Promise<ExternalPropertySummary[]>;

  listListings?(
    credentials: Record<string, string>,
    params?: { channelAccountId?: string },
  ): Promise<ExternalListingSummary[]>;

  updateAvailabilities?(
    credentials: Record<string, string>,
    input: AvailabilityUpdateInput,
  ): Promise<{ ok: boolean; message?: string }>;

  /** Channex: availability is per room_type (inventory count). */
  updateRoomTypeAvailability?(
    credentials: Record<string, string>,
    input: {
      propertyExternalId: string;
      roomTypeExternalId: string;
      startDate: string;
      endDate: string;
      availability: number;
    },
  ): Promise<{ ok: boolean; message?: string }>;

  getReservation?(
    credentials: Record<string, string>,
    params: { stayCode?: string; reservationCode?: string },
  ): Promise<ExternalReservationSummary | null>;

  listWebhooks?(credentials: Record<string, string>): Promise<Array<{ id: string; url: string; events?: string[] }>>;

  createWebhook?(
    credentials: Record<string, string>,
    input: { url: string; events?: string[]; propertyExternalId?: string; isGlobal?: boolean },
  ): Promise<{ ok: boolean; message?: string; id?: string }>;

  deleteWebhook?(credentials: Record<string, string>, webhookId: string): Promise<{ ok: boolean }>;
}
