import { z } from 'zod';

export const createHousekeepingTaskSchema = z.object({
    body: z.object({
        propertyId: z.number({ required_error: 'Propriedade é obrigatória' }),
        unitId: z.number({ required_error: 'Unidade é obrigatória' }),
        category: z.enum(['cleaning', 'arrangement', 'maintenance'], { required_error: 'Categoria é obrigatória' }),
        type: z.string({ required_error: 'Tipo de tarefa é obrigatório' }),
        description: z.string().optional().nullable(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        assigneeId: z.number().optional().nullable(),
        estimatedTime: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        scheduledAt: z.string().optional().nullable(),
    }),
});

export const updateHousekeepingTaskSchema = z.object({
    body: z.object({
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
        category: z.enum(['cleaning', 'arrangement', 'maintenance']).optional(),
        type: z.string().optional(),
        description: z.string().optional().nullable(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        assigneeId: z.number().optional().nullable(),
        estimatedTime: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        scheduledAt: z.string().optional().nullable(),
        status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
        startedAt: z.string().optional().nullable(),
        completedAt: z.string().optional().nullable(),
    }),
});

export type CreateHousekeepingTaskInput = z.infer<typeof createHousekeepingTaskSchema>['body'];
export type UpdateHousekeepingTaskInput = z.infer<typeof updateHousekeepingTaskSchema>['body'];
