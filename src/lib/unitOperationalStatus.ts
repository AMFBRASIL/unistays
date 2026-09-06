/**
 * Status operacional exibido / usado para bloquear reserva.
 * Alinha mapa de quartos e nova reserva: status de serviço sem tarefa ativa = disponível.
 */
export type UnitOperationalStatus =
  | "available"
  | "occupied"
  | "checkout"
  | "cleaning"
  | "maintenance"
  | "blocked"
  | "arrangement";

const SERVICE_STATUSES = new Set<UnitOperationalStatus>([
  "cleaning",
  "maintenance",
  "arrangement",
]);

export function resolveUnitOperationalStatus(options: {
  unitStatus?: string | null;
  activeTask?: { category?: string | null } | null;
  isOccupiedByReservation?: boolean;
  isCheckoutPassed?: boolean;
}): UnitOperationalStatus {
  const raw = (options.unitStatus || "available").toLowerCase() as UnitOperationalStatus;
  let status: UnitOperationalStatus = SERVICE_STATUSES.has(raw) || raw === "blocked" || raw === "occupied"
    ? raw
    : "available";

  if (options.isOccupiedByReservation) {
    return "occupied";
  }

  if (options.activeTask?.category) {
    const category = String(options.activeTask.category).toLowerCase();
    if (category === "cleaning") return "cleaning";
    if (category === "maintenance") return "maintenance";
    if (category === "arrangement") return "arrangement";
  }

  if (options.isCheckoutPassed) {
    return "cleaning";
  }

  // Status de governança sem tarefa ativa = disponível (evita bloqueio fantasma)
  if (SERVICE_STATUSES.has(status)) {
    return "available";
  }

  return status;
}
