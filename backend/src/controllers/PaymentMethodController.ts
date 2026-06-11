import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { PaymentMethod } from '@/entities/PaymentMethod.entity';

export class PaymentMethodController {
    private repository = AppDataSource.getRepository(PaymentMethod);

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { all } = req.query;
            const methods = await this.repository.find({
                where: all === 'true' ? {} : { isActive: true },
                order: {
                    name: 'ASC'
                }
            });
            res.json({ success: true, data: { paymentMethods: methods } });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const method = this.repository.create(req.body);
            const result = await this.repository.save(method);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const method = await this.repository.findOneBy({ id: Number(id) });

            if (!method) {
                res.status(404).json({ success: false, message: 'Forma de pagamento não encontrada' });
                return;
            }

            this.repository.merge(method, req.body);
            const result = await this.repository.save(method);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.repository.delete(id);

            if (result.affected === 0) {
                res.status(404).json({ success: false, message: 'Forma de pagamento não encontrada' });
                return;
            }

            res.json({ success: true, message: 'Forma de pagamento removida com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const method = await this.repository.findOneBy({ id: Number(id) });

            if (!method) {
                res.status(404).json({ success: false, message: 'Forma de pagamento não encontrada' });
                return;
            }

            method.isActive = !method.isActive;
            await this.repository.save(method);

            res.json({ success: true, data: method });
        } catch (error) {
            next(error);
        }
    }
}
