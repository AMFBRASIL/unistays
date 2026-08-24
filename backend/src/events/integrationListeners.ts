/**
 * Listeners de Channel Manager (Channex): empurram disponibilidade quando
 * reservas locais nascem ou são canceladas.
 */

import { EventBus } from './EventBus';
import { IntegrationService } from '@/services/integrations';

interface ReservationEventPayload {
  reservation?: {
    id?: number;
    unitId?: number | null;
    checkIn?: string | Date;
    checkOut?: string | Date;
    externalId?: string | null;
  };
  skipChannelManagerSync?: boolean;
}

export function registerIntegrationListeners(): void {
  EventBus.on<ReservationEventPayload>('reservation.created', async (data) => {
    const r = data?.reservation;
    await IntegrationService.syncAvailabilityForReservation({
      unitId: r?.unitId,
      checkIn: r?.checkIn,
      checkOut: r?.checkOut,
      available: false,
      externalId: r?.externalId,
      reservationId: r?.id,
      skipChannelManagerSync: data?.skipChannelManagerSync,
    });
  });

  EventBus.on<ReservationEventPayload>('reservation.cancelled', async (data) => {
    const r = data?.reservation;
    await IntegrationService.syncAvailabilityForReservation({
      unitId: r?.unitId,
      checkIn: r?.checkIn,
      checkOut: r?.checkOut,
      available: true,
      externalId: r?.externalId,
      reservationId: r?.id,
      skipChannelManagerSync: data?.skipChannelManagerSync,
    });
  });

  console.log('[EventBus] Integration listeners registrados para: reservation.created, reservation.cancelled');
}
