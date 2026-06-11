import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { UnitRate } from '@/entities/UnitRate.entity';
import { Unit } from '@/entities/Unit.entity';
import { AppError } from '@/middlewares/error.middleware';

export class UnitRateController {
    // Get rates for a specific unit within a date range
    async getUnitRates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { unitId } = req.params;
            const { startDate, endDate } = req.query;

            const unitRateRepository = AppDataSource.getRepository(UnitRate);

            const whereClause: any = { unitId: parseInt(unitId) };

            if (startDate && endDate) {
                whereClause.date = Between(new Date(startDate as string), new Date(endDate as string));
            } else if (startDate) {
                whereClause.date = MoreThanOrEqual(new Date(startDate as string));
            } else if (endDate) {
                whereClause.date = LessThanOrEqual(new Date(endDate as string));
            }

            const rates = await unitRateRepository.find({
                where: whereClause,
                order: { date: 'ASC' },
            });

            res.json({
                success: true,
                data: { rates },
            });
        } catch (error) {
            next(error);
        }
    }

    // Get rates for all units within a date range
    async getAllUnitRates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            const unitRateRepository = AppDataSource.getRepository(UnitRate);

            const whereClause: any = {};

            if (startDate && endDate) {
                whereClause.date = Between(new Date(startDate as string), new Date(endDate as string));
            } else if (startDate) {
                whereClause.date = MoreThanOrEqual(new Date(startDate as string));
            } else if (endDate) {
                whereClause.date = LessThanOrEqual(new Date(endDate as string));
            }

            const rates = await unitRateRepository.find({
                where: whereClause,
                relations: ['unit'],
                order: { unitId: 'ASC', date: 'ASC' },
            });

            res.json({
                success: true,
                data: { rates },
            });
        } catch (error) {
            next(error);
        }
    }

    // Create or update a single rate
    async upsertRate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { unitId, date, dailyRate, weeklyRate, monthlyRate, minStay, maxStay, available, notes } = req.body;

            if (!unitId || !date) {
                throw new AppError('unitId and date are required', 400);
            }

            const unitRateRepository = AppDataSource.getRepository(UnitRate);
            const unitRepository = AppDataSource.getRepository(Unit);

            // Verify unit exists
            const unit = await unitRepository.findOne({ where: { id: unitId } });
            if (!unit) {
                throw new AppError('Unit not found', 404);
            }

            // Check if rate already exists
            let rate = await unitRateRepository.findOne({
                where: { unitId, date: new Date(date) },
            });

            if (rate) {
                // Update existing rate
                rate.dailyRate = dailyRate !== undefined ? dailyRate : rate.dailyRate;
                rate.weeklyRate = weeklyRate !== undefined ? weeklyRate : rate.weeklyRate;
                rate.monthlyRate = monthlyRate !== undefined ? monthlyRate : rate.monthlyRate;
                rate.minStay = minStay !== undefined ? minStay : rate.minStay;
                rate.maxStay = maxStay !== undefined ? maxStay : rate.maxStay;
                rate.available = available !== undefined ? available : rate.available;
                rate.notes = notes !== undefined ? notes : rate.notes;
            } else {
                // Create new rate
                rate = unitRateRepository.create({
                    unitId,
                    date: new Date(date),
                    dailyRate: dailyRate || null,
                    weeklyRate: weeklyRate || null,
                    monthlyRate: monthlyRate || null,
                    minStay: minStay || null,
                    maxStay: maxStay || null,
                    available: available !== undefined ? available : true,
                    notes: notes || null,
                });
            }

            await unitRateRepository.save(rate);

            res.json({
                success: true,
                data: { rate },
            });
        } catch (error) {
            next(error);
        }
    }

    // Bulk upsert rates
    async bulkUpsertRates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { rates } = req.body;

            if (!Array.isArray(rates) || rates.length === 0) {
                throw new AppError('rates array is required', 400);
            }

            console.log('Received rates count:', rates.length);
            console.log('First 3 rates:', rates.slice(0, 3));

            const unitRateRepository = AppDataSource.getRepository(UnitRate);

            // Prepare entities for bulk upsert
            const entitiesToSave = rates
                .filter(rateData => rateData.unitId && rateData.date)
                .map(rateData => {
                    const { unitId, date, dailyRate, weeklyRate, monthlyRate, minStay, maxStay, available, notes } = rateData;

                    return {
                        unitId,
                        date: new Date(date),
                        dailyRate: dailyRate || null,
                        weeklyRate: weeklyRate || null,
                        monthlyRate: monthlyRate || null,
                        minStay: minStay || null,
                        maxStay: maxStay || null,
                        available: available !== undefined ? available : true,
                        notes: notes || null,
                    };
                });

            // Use raw SQL for guaranteed ON DUPLICATE KEY UPDATE behavior
            if (entitiesToSave.length > 0) {
                console.log('🔵 [BACKEND] ========== PREPARANDO SQL ==========');
                console.log('🔵 [BACKEND] Total de entidades:', entitiesToSave.length);
                console.log('🔵 [BACKEND] Primeiras 3 entidades:', entitiesToSave.slice(0, 3));

                const values = entitiesToSave.map(e =>
                    `(${e.unitId}, '${e.date.toISOString().split('T')[0]}', ${e.dailyRate}, ${e.weeklyRate}, ${e.monthlyRate}, ${e.minStay}, ${e.maxStay}, ${e.available ? 1 : 0}, ${e.notes ? `'${e.notes.replace(/'/g, "''")}'` : 'NULL'})`
                ).join(',');

                const sqlQuery = `
                    INSERT INTO unit_rates (unit_id, date, daily_rate, weekly_rate, monthly_rate, min_stay, max_stay, available, notes)
                    VALUES ${values}
                    ON DUPLICATE KEY UPDATE
                        daily_rate = VALUES(daily_rate),
                        weekly_rate = VALUES(weekly_rate),
                        monthly_rate = VALUES(monthly_rate),
                        min_stay = VALUES(min_stay),
                        max_stay = VALUES(max_stay),
                        available = VALUES(available),
                        notes = VALUES(notes),
                        updated_at = CURRENT_TIMESTAMP
                `;

                console.log('🔵 [BACKEND] SQL Query (primeiros 500 chars):', sqlQuery.substring(0, 500));
                console.log('🟢 [BACKEND] Executando query...');

                const result = await AppDataSource.query(sqlQuery);

                console.log('🟢 [BACKEND] Query executada com sucesso!');
                console.log('🟢 [BACKEND] Resultado:', result);
            }

            // Return success with count
            const savedCount = entitiesToSave.length;

            console.log('✅ [BACKEND] ========== SALVAMENTO CONCLUÍDO ==========');
            console.log('✅ [BACKEND] Total salvo:', savedCount);

            res.json({
                success: true,
                data: {
                    count: savedCount,
                    message: `Successfully upserted ${savedCount} rates`
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete a rate
    async deleteRate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const unitRateRepository = AppDataSource.getRepository(UnitRate);

            const rate = await unitRateRepository.findOne({ where: { id: parseInt(id) } });
            if (!rate) {
                throw new AppError('Rate not found', 404);
            }

            await unitRateRepository.remove(rate);

            res.json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get complete pricing map data (optimized - single request)
    async getPricingMapData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            const unitRepository = AppDataSource.getRepository(Unit);
            const unitRateRepository = AppDataSource.getRepository(UnitRate);

            // Get all units with their relations
            const units = await unitRepository.find({
                relations: ['property', 'roomType'],
                order: { id: 'ASC' },
            });

            // Get all rates for the date range
            let rates: UnitRate[] = [];
            if (startDate && endDate) {
                const whereClause: any = {
                    date: Between(new Date(startDate as string), new Date(endDate as string))
                };

                rates = await unitRateRepository.find({
                    where: whereClause,
                    order: { unitId: 'ASC', date: 'ASC' },
                });
            }

            // Group rates by unit for easier frontend consumption
            const ratesByUnit: Record<number, any[]> = {};
            rates.forEach(rate => {
                if (!ratesByUnit[rate.unitId]) {
                    ratesByUnit[rate.unitId] = [];
                }
                ratesByUnit[rate.unitId].push(rate);
            });

            // Return everything in one response
            res.json({
                success: true,
                data: {
                    units,
                    rates,
                    ratesByUnit,
                    properties: units.map(u => u.property).filter((p, i, arr) =>
                        p && arr.findIndex(x => x?.id === p.id) === i
                    ),
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
