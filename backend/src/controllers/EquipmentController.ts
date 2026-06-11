import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Equipment } from '@/entities/Equipment.entity';
import { AppError } from '@/middlewares/error.middleware';

export class EquipmentController {
    private repository = AppDataSource.getRepository(Equipment);

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { categoryId, propertyId, status, active } = req.query;

            const queryBuilder = this.repository.createQueryBuilder('equipment')
                .leftJoinAndSelect('equipment.category', 'category')
                .leftJoinAndSelect('equipment.locationRelation', 'locationRelation')
                .orderBy('equipment.name', 'ASC');

            if (categoryId) {
                queryBuilder.andWhere('equipment.categoryId = :categoryId', { categoryId });
            }

            if (propertyId) {
                queryBuilder.andWhere('equipment.propertyId = :propertyId', { propertyId });
            }

            if (status) {
                queryBuilder.andWhere('equipment.status = :status', { status });
            }

            if (active !== undefined) {
                if (active === 'true') {
                    queryBuilder.andWhere('equipment.status = :status', { status: 'active' });
                } else {
                    queryBuilder.andWhere('equipment.status != :status', { status: 'active' });
                }
            }

            const equipments = await queryBuilder.getMany();
            const withLocationString = equipments.map((e) => {
                const loc = e.locationRelation?.name;
                const detail = e.locationDetail?.trim();
                const location = [loc, detail].filter(Boolean).join(' - ') || detail || loc || null;
                const { locationRelation, ...rest } = e as unknown as Record<string, unknown>;
                return { ...rest, location, active: e.status === 'active' };
            });

            return res.json({ success: true, data: { equipments: withLocationString } });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const equipment = await this.repository.findOne({
                where: { id: Number(id) },
                relations: ['category', 'locationRelation']
            });

            if (!equipment) {
                throw new AppError('Equipamento não encontrado', 404);
            }

            const loc = equipment.locationRelation?.name;
            const detail = equipment.locationDetail?.trim();
            const location = [loc, detail].filter(Boolean).join(' - ') || detail || loc || null;
            const { locationRelation, ...rest } = equipment as unknown as Record<string, unknown>;
            return res.json({ success: true, data: { ...rest, location, active: equipment.status === 'active' } });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const equipment = this.repository.create(req.body);
            const savedResult = await this.repository.save(equipment);
            const savedEntity = Array.isArray(savedResult) ? savedResult[0] : savedResult;

            const savedEquipment = await this.repository.findOne({
                where: { id: savedEntity.id },
                relations: ['category', 'locationRelation']
            });
            if (!savedEquipment) {
                return res.status(201).json({ success: true, data: savedEntity });
            }
            const loc = savedEquipment.locationRelation?.name;
            const detail = savedEquipment.locationDetail?.trim();
            const location = [loc, detail].filter(Boolean).join(' - ') || detail || loc || null;
            const { locationRelation, ...rest } = savedEquipment as unknown as Record<string, unknown>;
            return res.status(201).json({ success: true, data: { ...rest, location, active: savedEquipment.status === 'active' } });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const equipment = await this.repository.findOne({ where: { id: Number(id) } });

            if (!equipment) {
                throw new AppError('Equipamento não encontrado', 404);
            }

            this.repository.merge(equipment, req.body);
            await this.repository.save(equipment);

            const updatedEquipment = await this.repository.findOne({
                where: { id: equipment.id },
                relations: ['category', 'locationRelation']
            });
            if (!updatedEquipment) {
                return res.json({ success: true, data: equipment });
            }
            const loc = updatedEquipment.locationRelation?.name;
            const detail = updatedEquipment.locationDetail?.trim();
            const location = [loc, detail].filter(Boolean).join(' - ') || detail || loc || null;
            const { locationRelation, ...rest } = updatedEquipment as unknown as Record<string, unknown>;
            return res.json({ success: true, data: { ...rest, location, active: updatedEquipment.status === 'active' } });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const equipment = await this.repository.findOne({ where: { id: Number(id) } });

            if (!equipment) {
                throw new AppError('Equipamento não encontrado', 404);
            }

            await this.repository.remove(equipment);

            return res.json({ success: true, message: 'Equipamento removido com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}
