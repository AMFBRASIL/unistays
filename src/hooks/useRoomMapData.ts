import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type PropertyType = "hotel" | "apart-hotel" | "loft" | "temporada";

export interface Room {
    id: number;
    number: string;
    type: string;
    floor: number;
    capacity: number;
    beds: string;
    amenities: string[];
    status: string;
    propertyId: number;
    propertyType: PropertyType; // Added for dashboard filtering
    propertyName: string;
    guest?: {
        name: string;
        phone: string;
        checkIn: string;
        checkOut: string;
        stayType: string;
        contractValue?: number;
    };
    rates: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    images?: string[];
    view?: string;
    name?: string;
    sizeM2?: number;
    roomTypeId?: number;
    activeTask?: any;
}

export function useRoomMapData() {
    return useQuery({
        queryKey: ["room-map-data"],
        queryFn: async () => {
            const [unitsRes, tasksRes, resRes, propsRes] = await Promise.all([
                api.getUnits(),
                api.getHousekeepingTasks({ status: 'pending,in_progress' }),
                api.getReservations({
                    status: 'pending,confirmed,checked_in'
                }),
                api.getProperties()
            ]);

            const units = unitsRes.success ? unitsRes.data?.units || [] : [];
            const activeTasks = tasksRes.success ? tasksRes.data?.tasks || [] : [];
            const allReservations = resRes.success ? resRes.data?.reservations || [] : [];
            const rawProperties = propsRes.success ? propsRes.data?.properties || [] : [];

            const now = new Date();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Filter reservations active today
            const activeReservations = allReservations.filter((r: any) => {
                if (!r.checkIn || !r.checkOut) return false;

                // Handle both ISO strings and DB Date objects
                const parseDate = (d: any) => {
                    if (d instanceof Date) return d;
                    const dateStr = d.toString();
                    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
                    const [y, m, dNum] = cleanStr.split('-').map(Number);
                    return new Date(y, m - 1, dNum);
                };

                const checkIn = parseDate(r.checkIn);
                const checkOut = parseDate(r.checkOut);
                checkIn.setHours(0, 0, 0, 0);
                checkOut.setHours(23, 59, 59, 999);

                return today >= checkIn && today <= checkOut;
            });

            const validUnits = (units || []).map((u: any) => {
                const currentUnitId = u.id?.toString();
                const unitPropertyId = (u.propertyId || u.property_id)?.toString();

                // 1. Validate Property Existence
                const property = rawProperties.find((p: any) => p.id?.toString() === unitPropertyId);

                // Strict Validation: If property not found (e.g. deleted), skip this unit
                if (!property) return null;

                // Find active tasks or reservations for this unit with ultra-robust ID matching
                const task = currentUnitId ? (activeTasks || []).find((t: any) => {
                    const tUnitId = (t.unitId || t.unit_id || t.unit_id_col || t.id)?.toString();
                    return tUnitId === currentUnitId;
                }) : null;

                const guestRes = currentUnitId ? (activeReservations || []).find((r: any) => {
                    const rUnitId = (r.unitId || r.unit_id || r.unit_id_col)?.toString();
                    return rUnitId === currentUnitId;
                }) : null;

                // Determine displayed status based on business priority:
                // Initial status from unit, but if it's a service status without an active task, default to available
                let baseStatus = u.status || 'available';

                // Auto-detect checkout passed
                let isCheckoutPassed = false;
                if (guestRes) {
                    const settings = typeof property.settings === 'string' ? JSON.parse(property.settings) : property.settings;
                    const checkoutTimeStr = settings?.checkOutTime || "11:00"; // default if missing

                    const [hours, minutes] = (checkoutTimeStr || "11:00").split(':').map(Number);

                    if (guestRes.checkOut) {
                        // Re-parse checkOut to local date object for comparison
                        const checkOutDateParts = guestRes.checkOut.toString().split('T')[0].split('-').map(Number);
                        const checkoutDateTime = new Date(checkOutDateParts[0], checkOutDateParts[1] - 1, checkOutDateParts[2], hours, minutes, 0, 0);

                        if (now > checkoutDateTime) {
                            isCheckoutPassed = true;
                        }
                    }
                }
                if (['cleaning', 'maintenance', 'arrangement'].includes(baseStatus) && !task) {
                    baseStatus = 'available';
                }

                let displayedStatus = baseStatus;

                // Priority Logic:
                // 1. Blocked/Maintenance takes precedence if explicitly set via task or status
                // 2. Occupied if there is a guest
                // 3. Cleaning if checkout passed or cleaning task exists

                if (task) {
                    const category = (task.category || task.type)?.toLowerCase();
                    if (category === 'cleaning' || category === 'limpeza') displayedStatus = 'cleaning';
                    else if (category === 'maintenance' || category === 'manutencao') displayedStatus = 'maintenance';
                    else if (category === 'arrangement' || category === 'arrumacao') displayedStatus = 'arrangement';
                } else if (isCheckoutPassed) {
                    displayedStatus = 'cleaning';
                } else if (guestRes) {
                    displayedStatus = 'occupied';
                } else if (u.status === 'maintenance') {
                    displayedStatus = 'maintenance';
                }

                return {
                    id: u.id,
                    number: u.number,
                    type: u.type || u.roomType?.name || "Standard",
                    floor: u.floor || 0,
                    capacity: u.capacity || 2,
                    beds: u.beds || "1 Cama",
                    amenities: u.amenities || [],
                    status: displayedStatus,
                    originalStatus: u.status,
                    propertyId: u.propertyId || u.property_id,
                    propertyType: property.type || 'hotel',
                    propertyName: property.name || 'Desconhecida',
                    guest: guestRes ? {
                        name: guestRes.guest?.name || guestRes.guestName || "Hóspede",
                        phone: guestRes.guest?.phone || guestRes.guestPhone || "",
                        checkIn: guestRes.checkIn,
                        checkOut: guestRes.checkOut,
                        stayType: guestRes.stayType || 'daily',
                        contractValue: guestRes.totalAmount || guestRes.total_amount
                    } : null,
                    rates: u.rates || { daily: u.basePrice || u.base_price || 0, weekly: (u.basePrice || u.base_price || 0) * 7, monthly: (u.basePrice || u.base_price || 0) * 30 },
                    images: u.images || [],
                    view: u.view || u.settings?.view || u.viewType || "",
                    name: u.name,
                    sizeM2: u.sizeM2 || u.size || 0,
                    roomTypeId: u.roomTypeId || u.room_type_id ? Number(u.roomTypeId || u.room_type_id) : undefined,
                    activeTask: task
                };
            }).filter(Boolean) as Room[];

            return validUnits;
        },
        refetchInterval: 30000 // Refresh every 30s
    });
}
