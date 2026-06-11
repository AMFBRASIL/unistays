import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { EmailSegment } from '@/entities/EmailSegment.entity';
import { Guest } from '@/entities/Guest.entity'; // Import Guest
import { AppError } from '@/middlewares/error.middleware';

export class EmailSegmentController {

    // Helper to calculate contacts count based on criteria
    private async calculateSegmentCount(criteria: any): Promise<number> {
        if (!criteria || Object.keys(criteria).length === 0) {
            return 0;
        }

        const guestRepo = AppDataSource.getRepository(Guest);
        const qb = guestRepo.createQueryBuilder('guest');

        if (criteria.location) {
            qb.andWhere('(guest.city LIKE :location OR guest.state LIKE :location)', {
                location: `%${criteria.location}%`
            });
        }

        if (criteria.minStays) {
            qb.andWhere('guest.totalStays >= :minStays', {
                minStays: criteria.minStays
            });
        }

        if (criteria.lastStayDays) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(criteria.lastStayDays));
            // Using logic: has at least one reservation with checkOutDate >= date
            qb.innerJoin('guest.reservations', 'reservation')
                .andWhere('reservation.checkOutDate >= :date', { date });
        }

        return await qb.getCount();
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const repository = AppDataSource.getRepository(EmailSegment);
            const segments = await repository.find({
                order: { createdAt: 'DESC' },
            });

            res.json({
                success: true,
                data: { segments },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailSegment);
            const segment = await repository.findOne({ where: { id: parseInt(id) } });

            if (!segment) {
                throw new AppError('Segmento não encontrado', 404);
            }

            res.json({
                success: true,
                data: { segment },
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const repository = AppDataSource.getRepository(EmailSegment);

            // Calculate contacts count
            const criteria = req.body.criteria || {};
            const count = await this.calculateSegmentCount(criteria);

            const segment = repository.create({
                ...req.body,
                contactsCount: count
            });

            await repository.save(segment);

            res.status(201).json({
                success: true,
                data: { segment },
                message: 'Segmento criado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailSegment);

            const segment = await repository.findOne({ where: { id: parseInt(id) } });
            if (!segment) throw new AppError('Segmento não encontrado', 404);

            // Recalculate count if criteria changes or just always on update
            const criteria = req.body.criteria || segment.criteria || {};
            const count = await this.calculateSegmentCount(criteria);

            repository.merge(segment, { ...req.body, contactsCount: count });
            await repository.save(segment);

            res.json({
                success: true,
                data: { segment },
                message: 'Segmento atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailSegment);

            const segment = await repository.findOne({ where: { id: parseInt(id) } });
            if (!segment) throw new AppError('Segmento não encontrado', 404);

            await repository.softRemove(segment);

            res.json({
                success: true,
                message: 'Segmento removido com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}
