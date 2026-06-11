import { z } from 'zod';

export const createEmailTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    type: z.string().min(1, 'Tipo é obrigatório').max(100, 'Tipo deve ter no máximo 100 caracteres'),
    subject: z.string().max(500, 'Assunto deve ter no máximo 500 caracteres').optional().nullable(),
    bodyHtml: z.string().min(1, 'Conteúdo HTML é obrigatório'),
    bodyText: z.string().optional().nullable(),
    variables: z.record(z.any()).optional().nullable(),
    designJson: z.any().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateEmailTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.string().min(1).max(100).optional(),
    subject: z.string().max(500).optional().nullable(),
    bodyHtml: z.string().min(1).optional(),
    bodyText: z.string().optional().nullable(),
    variables: z.record(z.any()).optional().nullable(),
    designJson: z.any().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>['body'];
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>['body'];
