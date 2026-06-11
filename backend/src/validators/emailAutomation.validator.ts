import { z } from 'zod';

export const createEmailAutomationSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nome é obrigatório').max(255),
        triggerType: z.string().min(1, 'Tipo de gatilho é obrigatório').max(50),
        triggerConfig: z.any().optional(),
        status: z.enum(['active', 'paused', 'draft']).optional().default('draft'),
    }),
});

export const updateEmailAutomationSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255).optional(),
        triggerType: z.string().min(1).max(50).optional(),
        triggerConfig: z.any().optional(),
        status: z.enum(['active', 'paused', 'draft']).optional(),
    }),
});
