import { z } from 'zod';

export const createAiConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    provider: z.enum(['openai', 'anthropic', 'google', 'azure', 'custom'], { required_error: 'Provedor é obrigatório' }),
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
    apiKey: z.string().min(1, 'API Key é obrigatória').optional().nullable(),
    apiEndpoint: z.string().url('URL inválida').optional().nullable(),
    model: z.string().max(100).optional().nullable(),
    temperature: z.number().min(0).max(2).optional().nullable(),
    maxTokens: z.number().int().positive().optional().nullable(),
    organizationId: z.string().max(255).optional().nullable(),
    projectId: z.string().max(255).optional().nullable(),
    region: z.string().max(100).optional().nullable(),
    customHeaders: z.record(z.any()).optional().nullable(),
    customParams: z.record(z.any()).optional().nullable(),
    isActive: z.boolean().optional().default(true),
    isDefault: z.boolean().optional().default(false),
  }).refine((data) => {
    // Para custom, endpoint é obrigatório
    if (data.provider === 'custom' && !data.apiEndpoint) {
      return false;
    }
    // Para outros provedores, API Key é obrigatória (exceto se já existe config ativa)
    if (data.provider !== 'custom' && !data.apiKey) {
      return false;
    }
    return true;
  }, {
    message: 'Campos obrigatórios não preenchidos para o provedor selecionado',
  }),
});

export const updateAiConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    provider: z.enum(['openai', 'anthropic', 'google', 'azure', 'custom']).optional(),
    name: z.string().min(1).max(255).optional(),
    apiKey: z.string().min(1).optional().nullable(),
    apiEndpoint: z.string().url().optional().nullable(),
    model: z.string().max(100).optional().nullable(),
    temperature: z.number().min(0).max(2).optional().nullable(),
    maxTokens: z.number().int().positive().optional().nullable(),
    organizationId: z.string().max(255).optional().nullable(),
    projectId: z.string().max(255).optional().nullable(),
    region: z.string().max(100).optional().nullable(),
    customHeaders: z.record(z.any()).optional().nullable(),
    customParams: z.record(z.any()).optional().nullable(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export type CreateAiConfigInput = z.infer<typeof createAiConfigSchema>['body'];
export type UpdateAiConfigInput = z.infer<typeof updateAiConfigSchema>['body'];
