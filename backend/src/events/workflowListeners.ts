/**
 * Listeners centralizados para workflows.
 * Registra o WorkflowService em todos os eventos do EventBus.
 * Chamado no bootstrap da aplicação.
 */

import { EventBus, WorkflowEvent } from './EventBus';
import { WorkflowService } from '@/services/WorkflowService';

interface EventPayload {
  propertyId?: number | null;
  [key: string]: unknown;
}

function createWorkflowListener(event: WorkflowEvent) {
  return (data: EventPayload) => {
    const propertyId = data?.propertyId ?? (data?.reservation as { propertyId?: number } | undefined)?.propertyId ?? null;
    WorkflowService.processTrigger({
      triggerType: event,
      eventData: data,
      propertyId,
    });
  };
}

export function registerWorkflowListeners(): void {
  const events: WorkflowEvent[] = [
    'reservation.created',
    'reservation.cancelled',
    'reservation.checkin',
    'reservation.checkout',
    'guest.created',
    'payment.received',
    'maintenance.requested',
    'financial.reservation_payment',
    'financial.reservation_commission',
    'task.created',
    'transaction.created',
    'purchase_order.created',
  ];

  events.forEach((event) => {
    EventBus.on(event, createWorkflowListener(event));
  });

  console.log('[EventBus] Workflow listeners registrados para:', events.join(', '));
}
