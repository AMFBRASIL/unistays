
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { EquipmentCategory } from '@/entities/EquipmentCategory.entity';
import { AppError } from '@/middlewares/error.middleware';

export class EquipmentCategoryController {
    private repository = AppDataSource.getRepository(EquipmentCategory);

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await this.repository.find({
                where: { active: true }, // Default to active
                order: { name: 'ASC' }
            });
            return res.json({ success: true, data: { equipmentCategories: categories } });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await this.repository.findOne({ where: { id: Number(id) } });

            if (!category) {
                throw new AppError('Categoria não encontrada', 404);
            }

            return res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, description, icon, color } = req.body;

            const category = this.repository.create({
                name,
                description,
                icon,
                color,
                active: true
            });

            await this.repository.save(category);

            return res.status(201).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, description, icon, color, active } = req.body;

            const category = await this.repository.findOne({ where: { id: Number(id) } });

            if (!category) {
                throw new AppError('Categoria não encontrada', 404);
            }

            this.repository.merge(category, { name, description, icon, color, active });
            await this.repository.save(category);

            return res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const category = await this.repository.findOne({ where: { id: Number(id) } });

            if (!category) {
                throw new AppError('Categoria não encontrada', 404);
            }

            // Soft delete by setting active to false? Or actual delete?
            // Let's do actual delete for now, or soft delete if we add deletedAt column.
            // Requirement says "crud", usually implies full lifecycle.
            // Entity created has no deletedAt, so we'll just delete.

            await this.repository.remove(category);

            return res.json({ success: true, message: 'Categoria removida com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}
