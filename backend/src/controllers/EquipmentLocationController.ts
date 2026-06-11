import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { EquipmentLocation } from '@/entities/EquipmentLocation.entity';

export class EquipmentLocationController {
    private repository = AppDataSource.getRepository(EquipmentLocation);

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId } = req.query;
            const qb = this.repository.createQueryBuilder('loc').orderBy('loc.name', 'ASC');
            if (propertyId != null && propertyId !== '') {
                qb.andWhere('loc.propertyId = :propertyId', { propertyId: Number(propertyId) });
            }
            qb.andWhere('loc.isActive = :isActive', { isActive: true });
            const locations = await qb.getMany();
            return res.json({ success: true, data: { equipmentLocations: locations } });
        } catch (error) {
            next(error);
        }
    }
}
