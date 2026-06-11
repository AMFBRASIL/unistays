import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';

export class DashboardController {
    /**
     * GET /api/v1/dashboard/stats
     * Retorna estatísticas consolidadas do dashboard
     */
    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const connection = AppDataSource;

            // 1. KPIs Gerais
            let kpis: any = {};
            try {
                const result = await connection.query(`
                    SELECT 
                      (SELECT COUNT(*) FROM units WHERE deleted_at IS NULL) as totalUnits,
                      (SELECT COUNT(DISTINCT u.id) 
                       FROM units u
                       INNER JOIN reservations r ON r.unit_id = u.id
                       WHERE r.deleted_at IS NULL
                       AND r.status IN ('confirmed', 'checked_in')
                       AND CURDATE() BETWEEN DATE(r.check_in) AND DATE(r.check_out)
                      ) as occupiedUnits,
                      (SELECT COALESCE(SUM(total_amount), 0)
                       FROM reservations
                       WHERE deleted_at IS NULL
                       AND payment_status = 'paid'
                       AND MONTH(check_in) = MONTH(CURDATE())
                       AND YEAR(check_in) = YEAR(CURDATE())
                      ) as monthlyRevenue,
                      (SELECT COUNT(*)
                       FROM reservations
                       WHERE deleted_at IS NULL
                       AND stay_type IN ('monthly', 'long_stay')
                       AND status IN ('confirmed', 'checked_in')
                       AND CURDATE() BETWEEN DATE(check_in) AND DATE(check_out)
                      ) as longStayContracts,
                      (SELECT COUNT(*)
                       FROM reservations
                       WHERE deleted_at IS NULL
                       AND MONTH(created_at) = MONTH(CURDATE())
                       AND YEAR(created_at) = YEAR(CURDATE())
                      ) as monthlyReservations,
                      (SELECT COUNT(DISTINCT guest_id)
                       FROM reservations
                       WHERE deleted_at IS NULL
                       AND guest_id IS NOT NULL
                       AND check_in >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                      ) as activeGuests
                `);

                // TypeORM returns an array of rows
                kpis = Array.isArray(result) && result.length > 0 ? result[0] : {};
            } catch (err) {
                console.error('[DashboardController] Error fetching KPIs:', err);
            }

            const occupancyRate = Number(kpis.totalUnits) > 0
                ? Math.round((Number(kpis.occupiedUnits) / Number(kpis.totalUnits)) * 100)
                : 0;

            // 2. Stats por tipo de propriedade
            let byPropertyType: any = {
                hotel: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
                'apart-hotel': { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
                loft: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
                temporada: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
            };

            try {
                const byPropertyTypeResult = await connection.query(`
                    SELECT 
                      p.type,
                      COUNT(DISTINCT u.id) as units,
                      COUNT(DISTINCT CASE 
                        WHEN r.status IN ('confirmed', 'checked_in') 
                        AND CURDATE() BETWEEN DATE(r.check_in) AND DATE(r.check_out)
                        THEN u.id 
                      END) as occupiedUnits,
                      COALESCE(SUM(CASE 
                        WHEN r.payment_status = 'paid'
                        AND MONTH(r.check_in) = MONTH(CURDATE())
                        AND YEAR(r.check_in) = YEAR(CURDATE())
                        THEN r.total_amount 
                        ELSE 0 
                      END), 0) as revenue,
                      COUNT(DISTINCT CASE 
                        WHEN r.stay_type IN ('monthly', 'long_stay')
                        AND r.status IN ('confirmed', 'checked_in')
                        AND CURDATE() BETWEEN DATE(r.check_in) AND DATE(r.check_out)
                        THEN r.id 
                      END) as longStay
                    FROM properties p
                    LEFT JOIN units u ON u.property_id = p.id AND u.deleted_at IS NULL
                    LEFT JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
                    WHERE p.deleted_at IS NULL
                    GROUP BY p.type
                `);

                if (Array.isArray(byPropertyTypeResult)) {
                    byPropertyTypeResult.forEach((row: any) => {
                        const type = row.type || 'hotel';
                        if (byPropertyType[type]) {
                            byPropertyType[type] = {
                                units: parseInt(row.units) || 0,
                                occupancy: Number(row.units) > 0
                                    ? Math.round((Number(row.occupiedUnits) / Number(row.units)) * 100)
                                    : 0,
                                revenue: parseFloat(row.revenue) || 0,
                                longStay: parseInt(row.longStay) || 0,
                            };
                        }
                    });
                }
            } catch (err) {
                console.error('[DashboardController] Error fetching Property Type Stats:', err);
            }

            // 3. Stats de proprietários
            let owners: any = { total: 0, activeContracts: 0, pendingPayments: 0, totalCommission: 0 };
            try {
                const ownersResult = await connection.query(`
                    SELECT 
                      COUNT(DISTINCT p.owner_id) as total,
                      COUNT(DISTINCT CASE 
                        WHEN r.status IN ('confirmed', 'checked_in')
                        AND CURDATE() BETWEEN DATE(r.check_in) AND DATE(r.check_out)
                        THEN r.id 
                      END) as activeContracts,
                      0 as pendingPayments,
                      COALESCE(SUM(CASE 
                        WHEN r.payment_status = 'paid'
                        AND MONTH(r.check_in) = MONTH(CURDATE())
                        AND YEAR(r.check_in) = YEAR(CURDATE())
                        THEN r.total_amount * 0.15
                        ELSE 0 
                      END), 0) as totalCommission
                    FROM properties p
                    LEFT JOIN units u ON u.property_id = p.id AND u.deleted_at IS NULL
                    LEFT JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
                    WHERE p.deleted_at IS NULL
                    AND p.owner_id IS NOT NULL
                `);

                if (Array.isArray(ownersResult) && ownersResult.length > 0) {
                    owners = ownersResult[0];
                }
            } catch (err) {
                console.error('[DashboardController] Error fetching Owner Stats:', err);
            }

            // 4. Stats de serviços
            const services = { coworking: 0, rooftop: 0, cleaning: 0 };
            try {
                const servicesResult = await connection.query(`
                  SELECT 
                    SUM(CASE WHEN LOWER(item_name) LIKE '%cowork%' THEN quantity ELSE 0 END) as coworking,
                    SUM(CASE WHEN LOWER(item_name) LIKE '%rooftop%' THEN quantity ELSE 0 END) as rooftop,
                    SUM(CASE WHEN LOWER(item_name) LIKE '%limpeza%' OR LOWER(item_name) LIKE '%cleaning%' THEN quantity ELSE 0 END) as cleaning
                  FROM reservation_items
                  WHERE MONTH(created_at) = MONTH(CURDATE())
                  AND YEAR(created_at) = YEAR(CURDATE())
                `);

                // Expect array with one row
                if (Array.isArray(servicesResult) && servicesResult.length > 0) {
                    const row = servicesResult[0];
                    services.coworking = parseInt(row.coworking) || 0;
                    services.rooftop = parseInt(row.rooftop) || 0;
                    services.cleaning = parseInt(row.cleaning) || 0;
                }
            } catch (error) {
                // Table might not exist, ignore
            }

            // 5. Reservas Recentes
            let recentReservations: any[] = [];
            try {
                const recentResult = await connection.query(`
                    SELECT 
                        r.id, 
                        r.reservation_number as code,
                        r.status, 
                        r.check_in as checkIn,
                        r.check_out as checkOut,
                        r.total_amount as totalAmount,
                        u.\`number\` as unitNumber,
                        p.\`name\` as propertyName,
                        NULLIF(TRIM(CONCAT(COALESCE(g.first_name, ''), ' ', COALESCE(g.last_name, ''))), '') as guestName,
                        COALESCE(r.channel, 'Direto') as channelName
                    FROM reservations r
                    LEFT JOIN units u ON r.unit_id = u.id
                    LEFT JOIN properties p ON u.property_id = p.id
                    LEFT JOIN guests g ON r.guest_id = g.id
                    WHERE r.deleted_at IS NULL
                    ORDER BY r.created_at DESC
                    LIMIT 5
                `);

                if (Array.isArray(recentResult)) {
                    recentReservations = recentResult;
                }
            } catch (err) {
                console.error('[DashboardController] Error fetching Recent Reservations:', err);
            }

            // Resposta consolidada
            res.json({
                success: true,
                data: {
                    kpis: {
                        occupancyRate,
                        totalRevenue: parseFloat(kpis.monthlyRevenue) || 0,
                        longStayContracts: parseInt(kpis.longStayContracts) || 0,
                        availableUnits: {
                            occupied: parseInt(kpis.occupiedUnits) || 0,
                            total: parseInt(kpis.totalUnits) || 0,
                        },
                    },
                    byPropertyType,
                    owners: {
                        total: parseInt(owners.total) || 0,
                        activeContracts: parseInt(owners.activeContracts) || 0,
                        pendingPayments: parseInt(owners.pendingPayments) || 0,
                        totalCommission: parseFloat(owners.totalCommission) || 0,
                    },
                    services,
                    monthlyStats: {
                        reservations: parseInt(kpis.monthlyReservations) || 0,
                        activeGuests: parseInt(kpis.activeGuests) || 0,
                        monthlyRevenue: parseFloat(kpis.monthlyRevenue) || 0,
                    },
                    recentReservations,
                },
            });
        } catch (error) {
            console.error('[DashboardController] Critical Error getting stats:', error);
            next(error);
        }
    }
}
