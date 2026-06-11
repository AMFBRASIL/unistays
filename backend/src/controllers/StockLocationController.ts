import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { StockLocation } from '@/entities/StockLocation.entity';

export class StockLocationController {
    private repository = AppDataSource.getRepository(StockLocation);

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.query;
            const where: any = {};
            if (propertyId) where.propertyId = Number(propertyId);

            const locations = await this.repository.find({
                where,
                order: { name: 'ASC' },
                relations: ['property']
            });

            return res.json({ success: true, data: locations });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const location = this.repository.create(data);
            await this.repository.save(location);
            return res.status(201).json({ success: true, data: location });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;
            const location = await this.repository.findOneBy({ id: Number(id) });

            if (!location) {
                return res.status(404).json({ success: false, message: 'Local não encontrado' });
            }

            this.repository.merge(location, data);
            const updated = await this.repository.save(location);
            return res.json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const location = await this.repository.findOneBy({ id: Number(id) });

            if (!location) {
                return res.status(404).json({ success: false, message: 'Local não encontrado' });
            }

            await this.repository.softRemove(location);
            return res.json({ success: true, message: 'Local removido com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}
