import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { EmailAutomation } from '@/entities/EmailAutomation.entity';
import { AppError } from '@/middlewares/error.middleware';

export class EmailAutomationController {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const repository = AppDataSource.getRepository(EmailAutomation);
            const automations = await repository.find({
                order: { createdAt: 'DESC' },
            });

            res.json({
                success: true,
                data: { automations },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailAutomation);
            const automation = await repository.findOne({ where: { id: parseInt(id) } });

            if (!automation) {
                throw new AppError('Automação não encontrada', 404);
            }

            res.json({
                success: true,
                data: { automation },
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const repository = AppDataSource.getRepository(EmailAutomation);
            const automation = repository.create(req.body);
            await repository.save(automation);

            res.status(201).json({
                success: true,
                data: { automation },
                message: 'Automação criada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailAutomation);

            const automation = await repository.findOne({ where: { id: parseInt(id) } });
            if (!automation) throw new AppError('Automação não encontrada', 404);

            repository.merge(automation, req.body);
            await repository.save(automation);

            res.json({
                success: true,
                data: { automation },
                message: 'Automação atualizada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const repository = AppDataSource.getRepository(EmailAutomation);

            const automation = await repository.findOne({ where: { id: parseInt(id) } });
            if (!automation) throw new AppError('Automação não encontrada', 404);

            await repository.softRemove(automation);

            res.json({
                success: true,
                message: 'Automação removida com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}
