import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateHousekeepingTaskInput, UpdateHousekeepingTaskInput } from '@/validators/housekeeping.validator';
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '@/events/EventBus';
import { HousekeepingUnitSync } from '@/services/HousekeepingUnitSync';

export class HousekeepingController {
    async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, propertyId, category, status, assigneeId } = req.query;
            const queryRunner = AppDataSource.createQueryRunner();

            let query = `
        SELECT 
          t.id,
          t.uuid,
          t.property_id as propertyId,
          t.unit_id as unitId,
          t.category,
          t.type,
          t.description,
          t.status,
          t.priority,
          t.assignee_id as assigneeId,
          t.estimated_time as estimatedTime,
          t.notes,
          t.scheduled_at as scheduledAt,
          t.started_at as startedAt,
          t.completed_at as completedAt,
          t.created_at as createdAt,
          t.updated_at as updatedAt,
          p.name as propertyName,
          u.number as unitNumber,
          u.floor as unitFloor,
          user.name as assigneeName
        FROM housekeeping_tasks t
        LEFT JOIN properties p ON t.property_id = p.id AND p.deleted_at IS NULL
        LEFT JOIN units u ON t.unit_id = u.id AND u.deleted_at IS NULL
        LEFT JOIN users user ON t.assignee_id = user.id AND user.deleted_at IS NULL
        WHERE t.deleted_at IS NULL
      `;

            const params: any[] = [];
            if (search) {
                query += ` AND (
          t.type LIKE ? OR 
          t.description LIKE ? OR
          u.number LIKE ? OR
          user.name LIKE ?
        )`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            if (propertyId) {
                query += ` AND t.property_id = ?`;
                params.push(parseInt(propertyId as string, 10));
            }
            if (category && category !== 'all') {
                query += ` AND t.category = ?`;
                params.push(category);
            }
            if (status && status !== 'all') {
                const statusList = (status as string).split(',').map(s => s.trim());
                if (statusList.length > 1) {
                    query += ` AND t.status IN (${statusList.map(() => '?').join(',')})`;
                    params.push(...statusList);
                } else {
                    query += ` AND t.status = ?`;
                    params.push(statusList[0]);
                }
            }
            if (assigneeId) {
                query += ` AND t.assignee_id = ?`;
                params.push(parseInt(assigneeId as string, 10));
            }

            query += ` ORDER BY t.created_at DESC`;

            const tasks = await queryRunner.query(query, params);
            await queryRunner.release();

            res.json({
                success: true,
                data: { tasks },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const queryRunner = AppDataSource.createQueryRunner();

            const query = `
        SELECT 
          t.*,
          p.name as propertyName,
          u.number as unitNumber,
          u.floor as unitFloor,
          user.name as assigneeName
        FROM housekeeping_tasks t
        LEFT JOIN properties p ON t.property_id = p.id AND p.deleted_at IS NULL
        LEFT JOIN units u ON t.unit_id = u.id AND u.deleted_at IS NULL
        LEFT JOIN users user ON t.assignee_id = user.id AND user.deleted_at IS NULL
        WHERE t.id = ? AND t.deleted_at IS NULL
      `;

            const results = await queryRunner.query(query, [parseInt(id, 10)]);
            await queryRunner.release();

            if (results.length === 0) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            res.json({
                success: true,
                data: results[0],
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const data: CreateHousekeepingTaskInput = req.body;
            const uuid = uuidv4();

            const insertQuery = `
        INSERT INTO housekeeping_tasks (
          uuid, property_id, unit_id, category, type, description,
          priority, assignee_id, estimated_time, notes, scheduled_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            await queryRunner.query(insertQuery, [
                uuid,
                data.propertyId,
                data.unitId,
                data.category,
                data.type,
                data.description || null,
                data.priority || 'medium',
                data.assigneeId || null,
                data.estimatedTime || null,
                data.notes || null,
                data.scheduledAt || null,
                'pending'
            ]);

            await HousekeepingUnitSync.applyTaskToUnit(
                queryRunner,
                data.unitId,
                'pending',
                data.category,
            );

            await queryRunner.commitTransaction();

            const newTaskRows = await queryRunner.query(
                `SELECT id FROM housekeeping_tasks WHERE uuid = ?`,
                [uuid]
            );
            const taskId = newTaskRows[0]?.id;

            await queryRunner.release();

            // Disparar workflow (tarefa criada - modal Nova Tarefa em /governanca)
            if (taskId) {
                const payload = {
                    taskId,
                    task: {
                        id: taskId,
                        uuid,
                        propertyId: data.propertyId,
                        unitId: data.unitId,
                        category: data.category,
                        type: data.type,
                        description: data.description,
                        priority: data.priority || 'medium',
                        assigneeId: data.assigneeId,
                        estimatedTime: data.estimatedTime,
                        notes: data.notes,
                        scheduledAt: data.scheduledAt,
                        status: 'pending',
                    },
                    propertyId: data.propertyId,
                    unitId: data.unitId,
                    category: data.category,
                    type: data.type,
                    description: data.description,
                    priority: data.priority || 'medium',
                    assigneeId: data.assigneeId,
                };
                console.log('[HousekeepingController] Emitindo task.created para workflow, taskId:', taskId);
                EventBus.emit('task.created', payload);
            }

            res.status(201).json({
                success: true,
                data: { id: taskId, uuid },
                message: 'Tarefa criada com sucesso',
            });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;
            const data: UpdateHousekeepingTaskInput = req.body;

            const existingTask = await queryRunner.query(
                `SELECT id, status, unit_id, category FROM housekeeping_tasks WHERE id = ? AND deleted_at IS NULL`,
                [parseInt(id, 10)]
            );

            if (existingTask.length === 0) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            const currentTask = existingTask[0];
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            if (data.propertyId !== undefined) {
                updateFields.push('property_id = ?');
                updateValues.push(data.propertyId);
            }
            if (data.unitId !== undefined) {
                updateFields.push('unit_id = ?');
                updateValues.push(data.unitId);
            }
            if (data.category !== undefined) {
                updateFields.push('category = ?');
                updateValues.push(data.category);
            }
            if (data.type !== undefined) {
                updateFields.push('type = ?');
                updateValues.push(data.type);
            }
            if (data.description !== undefined) {
                updateFields.push('description = ?');
                updateValues.push(data.description);
            }
            if (data.status !== undefined) {
                updateFields.push('status = ?');
                updateValues.push(data.status);

                if (data.status === 'in_progress' && currentTask.status !== 'in_progress') {
                    updateFields.push('started_at = NOW()');
                } else if (data.status === 'completed' && currentTask.status !== 'completed') {
                    updateFields.push('completed_at = NOW()');
                }
            }
            if (data.priority !== undefined) {
                updateFields.push('priority = ?');
                updateValues.push(data.priority);
            }
            if (data.assigneeId !== undefined) {
                updateFields.push('assignee_id = ?');
                updateValues.push(data.assigneeId);
            }
            if (data.estimatedTime !== undefined) {
                updateFields.push('estimated_time = ?');
                updateValues.push(data.estimatedTime);
            }
            if (data.notes !== undefined) {
                updateFields.push('notes = ?');
                updateValues.push(data.notes);
            }
            if (data.scheduledAt !== undefined) {
                updateFields.push('scheduled_at = ?');
                updateValues.push(data.scheduledAt);
            }

            if (updateFields.length === 0) {
                throw new AppError('Nenhum campo para atualizar', 400);
            }

            updateFields.push('updated_at = NOW()');
            updateValues.push(parseInt(id, 10));

            const updateQuery = `UPDATE housekeeping_tasks SET ${updateFields.join(', ')} WHERE id = ?`;

            await queryRunner.query(updateQuery, updateValues);

            if (data.status !== undefined) {
                const unitId = currentTask.unit_id;
                const category = data.category ?? currentTask.category;
                await HousekeepingUnitSync.applyTaskToUnit(
                    queryRunner,
                    unitId,
                    data.status,
                    category,
                );
            }

            await queryRunner.commitTransaction();
            await queryRunner.release();

            res.json({
                success: true,
                message: 'Tarefa atualizada com sucesso',
            });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { id } = req.params;

            const existingTask = await queryRunner.query(
                `SELECT id, unit_id FROM housekeeping_tasks WHERE id = ? AND deleted_at IS NULL`,
                [parseInt(id, 10)]
            );

            if (existingTask.length === 0) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            const taskId = parseInt(id, 10);
            const unitId = existingTask[0].unit_id;

            await queryRunner.query(
                `UPDATE housekeeping_tasks SET deleted_at = NOW() WHERE id = ?`,
                [taskId]
            );

            if (unitId) {
                await HousekeepingUnitSync.releaseUnitIfNoActiveTasks(queryRunner, unitId, taskId);
            }

            await queryRunner.commitTransaction();
            await queryRunner.release();

            res.json({
                success: true,
                message: 'Tarefa excluída com sucesso',
            });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            next(error);
        }
    }
}
