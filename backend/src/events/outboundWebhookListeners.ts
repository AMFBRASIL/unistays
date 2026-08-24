import { EventBus, WorkflowEvent } from './EventBus';
import { OutboundWebhookService } from '@/services/webhooks/OutboundWebhookService';

const OUTBOUND_EVENTS: WorkflowEvent[] = [
  'reservation.created',
  'reservation.cancelled',
  'reservation.checkin',
  'reservation.checkout',
  'guest.created',
  'payment.received',
  'financial.reservation_payment',
  'financial.reservation_commission',
];

export function registerOutboundWebhookListeners(): void {
  OUTBOUND_EVENTS.forEach((event) => {
    EventBus.on(event, (data) => {
      void OutboundWebhookService.dispatch(event, data);
    });
  });

  console.log(
    '[EventBus] Outbound webhook listeners registrados para:',
    OUTBOUND_EVENTS.join(', '),
  );
}
