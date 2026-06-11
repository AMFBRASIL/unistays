import { z } from 'zod';

export const createEmailSegmentSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nome é obrigatório').max(255),
        description: z.string().optional().nullable(),
        icon: z.string().optional().default('users'),
        color: z.string().optional().default('bg-blue-500/10 text-blue-500'),
        criteria: z.any().optional().nullable(),
    }),
});

export const updateEmailSegmentSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        icon: z.string().optional(),
        color: z.string().optional(),
        criteria: z.any().optional().nullable(),
    }),
});
