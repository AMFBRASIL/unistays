import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';

const LONG_STAY_TYPES = "('monthly', 'long_stay', 'longstay')";
const ACTIVE_OCCUPANCY_STATUSES = "('confirmed', 'checked_in')";
const REVENUE_STATUSES = "('confirmed', 'checked_in', 'checked_out')";

function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export class DashboardController {
  /**
   * GET /api/v1/dashboard/stats
   * Retorna estatísticas consolidadas do dashboard
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const connection = AppDataSource;

      let kpis: Record<string, unknown> = {};
      try {
        const result = await connection.query(`
          SELECT
            (SELECT COUNT(*) FROM units WHERE deleted_at IS NULL) AS totalUnits,
            (SELECT COUNT(DISTINCT u.id)
             FROM units u
             INNER JOIN reservations r ON r.unit_id = u.id
             WHERE r.deleted_at IS NULL
               AND r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
               AND CURDATE() >= DATE(r.check_in)
               AND CURDATE() < DATE(r.check_out)
            ) AS occupiedUnits,
            (SELECT COALESCE(SUM(r.total_amount), 0)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND r.status IN ${REVENUE_STATUSES}
               AND MONTH(r.check_in) = MONTH(CURDATE())
               AND YEAR(r.check_in) = YEAR(CURDATE())
            ) AS monthlyRevenue,
            (SELECT COALESCE(SUM(r.total_amount), 0)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND r.status IN ${REVENUE_STATUSES}
               AND MONTH(r.check_in) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
               AND YEAR(r.check_in) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
            ) AS previousMonthlyRevenue,
            (SELECT COUNT(*)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND r.stay_type IN ${LONG_STAY_TYPES}
               AND r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
               AND CURDATE() >= DATE(r.check_in)
               AND CURDATE() < DATE(r.check_out)
            ) AS longStayContracts,
            (SELECT COUNT(*)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND MONTH(r.created_at) = MONTH(CURDATE())
               AND YEAR(r.created_at) = YEAR(CURDATE())
            ) AS monthlyReservations,
            (SELECT COUNT(DISTINCT r.guest_id)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND r.guest_id IS NOT NULL
               AND r.check_in >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ) AS activeGuests,
            (SELECT COUNT(*)
             FROM reservations r
             WHERE r.deleted_at IS NULL
               AND r.payment_status IN ('pending', 'partial')
               AND r.status IN ${REVENUE_STATUSES}
            ) AS pendingPayments
        `);
        kpis = Array.isArray(result) && result.length > 0 ? result[0] : {};
      } catch (err) {
        console.error('[DashboardController] Error fetching KPIs:', err);
      }

      const totalUnits = Number(kpis.totalUnits) || 0;
      const occupiedUnits = Number(kpis.occupiedUnits) || 0;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      const monthlyRevenue = parseFloat(String(kpis.monthlyRevenue)) || 0;
      const previousMonthlyRevenue = parseFloat(String(kpis.previousMonthlyRevenue)) || 0;

      let byPropertyType: Record<string, { units: number; occupancy: number; revenue: number; longStay: number }> = {
        hotel: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
        'apart-hotel': { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
        loft: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
        temporada: { units: 0, occupancy: 0, revenue: 0, longStay: 0 },
      };

      try {
        const byPropertyTypeResult = await connection.query(`
          SELECT
            p.type,
            COUNT(DISTINCT u.id) AS units,
            COUNT(DISTINCT CASE
              WHEN r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
               AND CURDATE() >= DATE(r.check_in)
               AND CURDATE() < DATE(r.check_out)
              THEN u.id
            END) AS occupiedUnits,
            COALESCE(SUM(CASE
              WHEN r.status IN ${REVENUE_STATUSES}
               AND MONTH(r.check_in) = MONTH(CURDATE())
               AND YEAR(r.check_in) = YEAR(CURDATE())
              THEN r.total_amount
              ELSE 0
            END), 0) AS revenue,
            COUNT(DISTINCT CASE
              WHEN r.stay_type IN ${LONG_STAY_TYPES}
               AND r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
               AND CURDATE() >= DATE(r.check_in)
               AND CURDATE() < DATE(r.check_out)
              THEN r.id
            END) AS longStay
          FROM properties p
          LEFT JOIN units u ON u.property_id = p.id AND u.deleted_at IS NULL
          LEFT JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
          GROUP BY p.type
        `);

        if (Array.isArray(byPropertyTypeResult)) {
          byPropertyTypeResult.forEach((row: { type?: string; units?: string; occupiedUnits?: string; revenue?: string; longStay?: string }) => {
            const type = row.type || 'hotel';
            if (!byPropertyType[type]) return;
            const units = parseInt(String(row.units), 10) || 0;
            const occupied = parseInt(String(row.occupiedUnits), 10) || 0;
            byPropertyType[type] = {
              units,
              occupancy: units > 0 ? Math.round((occupied / units) * 100) : 0,
              revenue: parseFloat(String(row.revenue)) || 0,
              longStay: parseInt(String(row.longStay), 10) || 0,
            };
          });
        }
      } catch (err) {
        console.error('[DashboardController] Error fetching Property Type Stats:', err);
      }

      let owners: Record<string, number> = { total: 0, activeContracts: 0, pendingPayments: 0, totalCommission: 0 };
      try {
        const ownersResult = await connection.query(`
          SELECT
            COUNT(DISTINCT p.owner_id) AS total,
            COUNT(DISTINCT CASE
              WHEN r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
               AND CURDATE() >= DATE(r.check_in)
               AND CURDATE() < DATE(r.check_out)
              THEN r.id
            END) AS activeContracts,
            COALESCE(SUM(CASE
              WHEN r.payment_status IN ('pending', 'partial')
               AND r.status IN ${REVENUE_STATUSES}
              THEN 1 ELSE 0
            END), 0) AS pendingPayments,
            COALESCE(SUM(CASE
              WHEN r.status IN ${REVENUE_STATUSES}
               AND MONTH(r.check_in) = MONTH(CURDATE())
               AND YEAR(r.check_in) = YEAR(CURDATE())
              THEN r.total_amount * 0.15
              ELSE 0
            END), 0) AS totalCommission
          FROM properties p
          LEFT JOIN units u ON u.property_id = p.id AND u.deleted_at IS NULL
          LEFT JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
            AND p.owner_id IS NOT NULL
        `);
        if (Array.isArray(ownersResult) && ownersResult.length > 0) {
          const row = ownersResult[0];
          owners = {
            total: parseInt(String(row.total), 10) || 0,
            activeContracts: parseInt(String(row.activeContracts), 10) || 0,
            pendingPayments: parseInt(String(row.pendingPayments), 10) || 0,
            totalCommission: parseFloat(String(row.totalCommission)) || 0,
          };
        }
      } catch (err) {
        console.error('[DashboardController] Error fetching Owner Stats:', err);
      }

      const services = { coworking: 0, rooftop: 0, cleaning: 0 };
      try {
        const servicesResult = await connection.query(`
          SELECT
            SUM(CASE WHEN LOWER(item_name) LIKE '%cowork%' THEN quantity ELSE 0 END) AS coworking,
            SUM(CASE WHEN LOWER(item_name) LIKE '%rooftop%' THEN quantity ELSE 0 END) AS rooftop,
            SUM(CASE WHEN LOWER(item_name) LIKE '%limpeza%' OR LOWER(item_name) LIKE '%cleaning%' THEN quantity ELSE 0 END) AS cleaning
          FROM reservation_items
          WHERE MONTH(created_at) = MONTH(CURDATE())
            AND YEAR(created_at) = YEAR(CURDATE())
        `);
        if (Array.isArray(servicesResult) && servicesResult.length > 0) {
          const row = servicesResult[0];
          services.coworking = parseInt(String(row.coworking), 10) || 0;
          services.rooftop = parseInt(String(row.rooftop), 10) || 0;
          services.cleaning = parseInt(String(row.cleaning), 10) || 0;
        }
      } catch {
        // reservation_items pode não existir em instalações antigas
      }

      let recentReservations: unknown[] = [];
      try {
        recentReservations = await connection.query(`
          SELECT
            r.id,
            r.reservation_number AS code,
            r.status,
            r.check_in AS checkIn,
            r.check_out AS checkOut,
            r.total_amount AS totalAmount,
            u.\`number\` AS unitNumber,
            p.\`name\` AS propertyName,
            NULLIF(TRIM(CONCAT(COALESCE(g.first_name, ''), ' ', COALESCE(g.last_name, ''))), '') AS guestName,
            COALESCE(NULLIF(TRIM(r.channel), ''), 'Direto') AS channelName
          FROM reservations r
          LEFT JOIN units u ON r.unit_id = u.id
          LEFT JOIN properties p ON u.property_id = p.id
          LEFT JOIN guests g ON r.guest_id = g.id
          WHERE r.deleted_at IS NULL
          ORDER BY r.created_at DESC
          LIMIT 5
        `);
      } catch (err) {
        console.error('[DashboardController] Error fetching Recent Reservations:', err);
      }

      let occupancyTrend: { name: string; ocupacao: number; receita: number }[] = [];
      let occupancyChange: number | null = null;
      try {
        const trendRows = await connection.query(`
          SELECT
            d.day,
            (
              SELECT COUNT(DISTINCT u.id)
              FROM units u
              INNER JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
              WHERE r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
                AND d.day >= DATE(r.check_in)
                AND d.day < DATE(r.check_out)
            ) AS occupied,
            (
              SELECT COALESCE(SUM(r.total_amount), 0)
              FROM reservations r
              WHERE r.deleted_at IS NULL
                AND r.status IN ${REVENUE_STATUSES}
                AND DATE(r.check_in) = d.day
            ) AS revenue
          FROM (
            SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY) AS day
            UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
            UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
            UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            UNION ALL SELECT CURDATE()
          ) d
          ORDER BY d.day ASC
        `);

        if (Array.isArray(trendRows)) {
          occupancyTrend = trendRows.map((row: { day: string | Date; occupied?: string; revenue?: string }) => {
            const dayDate = new Date(row.day);
            const occupied = Number(row.occupied) || 0;
            return {
              name: DAY_LABELS[dayDate.getDay()],
              ocupacao: totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0,
              receita: parseFloat(String(row.revenue)) || 0,
            };
          });

          const last7 = occupancyTrend.map((d) => d.ocupacao);
          const thisWeekAvg = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
          const prevWeekRows = await connection.query(`
            SELECT AVG(daily_rate) AS avgRate FROM (
              SELECT
                d.day,
                CASE WHEN ? > 0 THEN (
                  SELECT COUNT(DISTINCT u.id) FROM units u
                  INNER JOIN reservations r ON r.unit_id = u.id AND r.deleted_at IS NULL
                  WHERE r.status IN ${ACTIVE_OCCUPANCY_STATUSES}
                    AND d.day >= DATE(r.check_in) AND d.day < DATE(r.check_out)
                ) * 100.0 / ? ELSE 0 END AS daily_rate
              FROM (
                SELECT DATE_SUB(CURDATE(), INTERVAL 13 DAY) AS day
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 12 DAY)
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 11 DAY)
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 10 DAY)
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 9 DAY)
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 8 DAY)
                UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              ) d
            ) t
          `, [totalUnits, totalUnits]);
          const prevWeekAvg = parseFloat(String(prevWeekRows?.[0]?.avgRate)) || 0;
          occupancyChange = pctChange(Math.round(thisWeekAvg), Math.round(prevWeekAvg));
        }
      } catch (err) {
        console.error('[DashboardController] Error fetching occupancy trend:', err);
      }

      let revenueByChannel: { name: string; value: number; amount: number }[] = [];
      try {
        const channelRows = await connection.query(`
          SELECT
            COALESCE(NULLIF(TRIM(channel), ''), 'Direto') AS name,
            COALESCE(SUM(total_amount), 0) AS amount
          FROM reservations
          WHERE deleted_at IS NULL
            AND status IN ${REVENUE_STATUSES}
            AND MONTH(check_in) = MONTH(CURDATE())
            AND YEAR(check_in) = YEAR(CURDATE())
          GROUP BY COALESCE(NULLIF(TRIM(channel), ''), 'Direto')
          ORDER BY amount DESC
          LIMIT 8
        `);
        if (Array.isArray(channelRows)) {
          const totalChannel = channelRows.reduce((acc: number, row: { amount?: string }) => acc + (parseFloat(String(row.amount)) || 0), 0);
          revenueByChannel = channelRows.map((row: { name?: string; amount?: string }) => {
            const amount = parseFloat(String(row.amount)) || 0;
            return {
              name: row.name || 'Direto',
              amount,
              value: totalChannel > 0 ? Math.round((amount / totalChannel) * 100) : 0,
            };
          });
        }
      } catch (err) {
        console.error('[DashboardController] Error fetching revenue by channel:', err);
      }

      const longStayContracts = parseInt(String(kpis.longStayContracts), 10) || 0;
      const pendingPayments = parseInt(String(kpis.pendingPayments), 10) || Number(owners.pendingPayments) || 0;

      res.json({
        success: true,
        data: {
          kpis: {
            occupancyRate,
            totalRevenue: monthlyRevenue,
            longStayContracts,
            availableUnits: {
              occupied: occupiedUnits,
              total: totalUnits,
            },
            trends: {
              occupancyChange,
              revenueChange: pctChange(monthlyRevenue, previousMonthlyRevenue),
            },
          },
          byPropertyType,
          owners: {
            ...owners,
            pendingPayments,
          },
          services,
          monthlyStats: {
            reservations: parseInt(String(kpis.monthlyReservations), 10) || 0,
            activeGuests: parseInt(String(kpis.activeGuests), 10) || 0,
            monthlyRevenue,
          },
          recentReservations,
          occupancyTrend,
          revenueByChannel,
        },
      });
    } catch (error) {
      console.error('[DashboardController] Critical Error getting stats:', error);
      next(error);
    }
  }
}
