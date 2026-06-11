/**
 * Event Bus centralizado para disparar workflows e outros listeners.
 * Os emissores (controllers, services) emitem eventos; os listeners (ex: WorkflowService)
 * processam em um único lugar.
 */

export type WorkflowEvent =
  | 'reservation.created'
  | 'reservation.cancelled'
  | 'reservation.checkin'
  | 'reservation.checkout'
  | 'guest.created'
  | 'payment.received'
  | 'maintenance.requested'
  | 'financial.reservation_payment'
  | 'financial.reservation_commission'
  | 'task.created'
  | 'transaction.created'
  | 'purchase_order.created';

type Listener<T = unknown> = (data: T) => void | Promise<void>;

const listeners: Partial<Record<WorkflowEvent, Listener[]>> = {};

export const EventBus = {
  /**
   * Emite um evento. Todos os listeners registrados serão chamados (em background).
   */
  emit<T = unknown>(event: WorkflowEvent, data: T): void {
    const fns = listeners[event];
    if (!fns?.length) return;
    fns.forEach((fn) => {
      Promise.resolve(fn(data as unknown)).catch((err) => {
        console.error(`[EventBus] Erro no listener do evento "${event}":`, err);
      });
    });
  },

  /**
   * Registra um listener para um evento.
   */
  on<T = unknown>(event: WorkflowEvent, fn: Listener<T>): () => void {
    if (!listeners[event]) listeners[event] = [];
    listeners[event]!.push(fn as Listener);
    return () => {
      listeners[event] = listeners[event]?.filter((f) => f !== fn) ?? [];
    };
  },
};
