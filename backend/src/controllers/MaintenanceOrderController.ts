import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { MaintenanceOrder, MaintenanceStatus, MaintenancePriority } from '@/entities/MaintenanceOrder.entity';
import { AppError } from '@/middlewares/error.middleware';
import { Like, IsNull, Not, Between } from 'typeorm';

export class MaintenanceOrderController {
    private repository = AppDataSource.getRepository(MaintenanceOrder);

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { propertyId, status, priority, type, search } = req.query;

            const where: any = { deletedAt: IsNull() };

            if (propertyId) where.propertyId = Number(propertyId);
            if (status) where.status = status;
            if (priority) where.priority = priority;
            if (type) where.type = type;
            if (search) {
                where.title = Like(`%${search}%`); // Simplificado, ideal seria OR com description/equipment
            }

            const orders = await this.repository.find({
                where,
                order: { createdAt: 'DESC' }
            });

            return res.json({ success: true, data: { maintenanceOrders: orders } });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const order = await this.repository.findOne({
                where: { id: Number(id), deletedAt: IsNull() }
            });

            if (!order) {
                throw new AppError('Ordem de manutenção não encontrada', 404);
            }

            return res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;

            const order = this.repository.create(data);
            const savedOrder = await this.repository.save(order);
            const orderEntity = Array.isArray(savedOrder) ? savedOrder[0] : savedOrder;

            // Disparar evento para workflows (EventBus centralizado)
            try {
                const { EventBus } = await import('@/events/EventBus');
                const payload = {
                    maintenance: {
                        id: orderEntity.id,
                        title: orderEntity.title,
                        equipment: orderEntity.equipment,
                        location: orderEntity.location,
                        type: orderEntity.type,
                        priority: orderEntity.priority,
                        description: orderEntity.description,
                        dueDate: orderEntity.dueDate,
                        assignedTo: orderEntity.assignedTo,
                    },
                    propertyId: orderEntity.propertyId ?? null,
                };
                console.log('[MaintenanceOrderController] Emitindo maintenance.requested para workflow, maintenanceId:', orderEntity.id);
                EventBus.emit('maintenance.requested', payload);
            } catch (importErr) {
                console.error('[MaintenanceOrderController.create] EventBus import error:', importErr);
            }

            return res.status(201).json({ success: true, data: orderEntity });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;

            const order = await this.repository.findOne({
                where: { id: Number(id), deletedAt: IsNull() }
            });

            if (!order) {
                throw new AppError('Ordem de manutenção não encontrada', 404);
            }

            const prevStatus = order.status;
            this.repository.merge(order, data);
            await this.repository.save(order);

            // Libera unit ao concluir/cancelar ordem de manutenção
            const nextStatus = order.status;
            const unitId = order.unitId;
            if (
                unitId &&
                (nextStatus === MaintenanceStatus.COMPLETED || nextStatus === MaintenanceStatus.CANCELLED) &&
                prevStatus !== nextStatus
            ) {
                await AppDataSource.query(
                    `UPDATE units SET status = 'available', updated_at = NOW()
                     WHERE id = ? AND status IN ('cleaning', 'maintenance', 'arrangement', 'blocked')`,
                    [unitId],
                );
            } else if (
                unitId &&
                (nextStatus === MaintenanceStatus.IN_PROGRESS || nextStatus === MaintenanceStatus.SCHEDULED || nextStatus === MaintenanceStatus.PENDING) &&
                prevStatus !== nextStatus
            ) {
                await AppDataSource.query(
                    `UPDATE units SET status = 'maintenance', updated_at = NOW()
                     WHERE id = ? AND status NOT IN ('occupied')`,
                    [unitId],
                );
            }

            return res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const order = await this.repository.findOne({
                where: { id: Number(id), deletedAt: IsNull() }
            });

            if (!order) {
                throw new AppError('Ordem de manutenção não encontrada', 404);
            }

            order.deletedAt = new Date();
            await this.repository.save(order);

            return res.json({ success: true, message: 'Ordem de manutenção excluída' });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const total = await this.repository.count({ where: { deletedAt: IsNull() } });
            const completed = await this.repository.count({ where: { status: MaintenanceStatus.COMPLETED, deletedAt: IsNull() } });
            const pending = await this.repository.count({ where: { status: MaintenanceStatus.PENDING, deletedAt: IsNull() } });
            const overdue = await this.repository.count({ where: { status: MaintenanceStatus.OVERDUE, deletedAt: IsNull() } });
            const critical = await this.repository.count({ where: { priority: MaintenancePriority.CRITICAL, status: Not(MaintenanceStatus.COMPLETED), deletedAt: IsNull() } });

            const { avg } = await this.repository
                .createQueryBuilder("maintenance_order")
                .select("AVG(maintenance_order.cost)", "avg")
                .where("maintenance_order.deletedAt IS NULL")
                .getRawOne();

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const thisMonth = await this.repository.count({
                where: {
                    scheduledDate: Between(startOfMonth, endOfMonth),
                    deletedAt: IsNull()
                }
            });

            return res.json({
                success: true,
                data: {
                    total,
                    completed,
                    pending,
                    overdue,
                    critical,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    averageCost: avg ? parseFloat(avg) : 0,
                    thisMonth
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
