import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    phone: z.string().optional().nullable(),
    groupId: z.number().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
