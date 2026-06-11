import { z } from 'zod';

export const createEmailConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    method: z.enum(['smtp', 'api', 'default'], { required_error: 'Método é obrigatório' }),
    provider: z.string().optional().nullable(),
    
    // SMTP
    smtpServer: z.string().optional().nullable(),
    smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
    smtpSecurity: z.enum(['none', 'tls', 'ssl']).optional().nullable(),
    smtpUsername: z.string().optional().nullable(),
    smtpPassword: z.string().optional().nullable(),
    
    // API Provider
    apiKey: z.string().optional().nullable(),
    apiDomain: z.string().optional().nullable(),
    apiDailyLimit: z.number().int().min(1).optional().nullable(),
    apiWebhookUrl: z.string().max(500).optional().nullable(),
    
    // Common
    fromEmail: z.preprocess((val) => val === '' ? null : val, z.string().email('E-mail inválido').optional().nullable()),
    fromName: z.string().optional().nullable(),
    replyTo: z.preprocess((val) => val === '' ? null : val, z.string().email('E-mail inválido').optional().nullable()),
    
    // Default method
    defaultShowBranding: z.boolean().optional().default(true),
    
    // Status
    isActive: z.boolean().optional().default(true),
    isDefault: z.boolean().optional().default(false),
  }).refine((data) => {
    // Se método é SMTP, validar campos obrigatórios
    if (data.method === 'smtp') {
      if (!data.smtpServer || !data.smtpPort || !data.smtpUsername || !data.smtpPassword || !data.fromEmail || !data.fromName) {
        return false;
      }
    }
    // Se método é API, validar campos obrigatórios
    if (data.method === 'api') {
      if (!data.provider || !data.apiKey || !data.fromEmail || !data.fromName) {
        return false;
      }
    }
    // Se método é default, apenas fromEmail e fromName são necessários (mas não obrigatórios)
    return true;
  }, {
    message: 'Campos obrigatórios não preenchidos para o método selecionado',
  }),
});

export const updateEmailConfigSchema = z.object({
  body: z.object({
    method: z.enum(['smtp', 'api', 'default']).optional(),
    provider: z.string().optional().nullable(),
    
    smtpServer: z.string().optional().nullable(),
    smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
    smtpSecurity: z.enum(['none', 'tls', 'ssl']).optional().nullable(),
    smtpUsername: z.string().optional().nullable(),
    smtpPassword: z.string().optional().nullable(),
    
    apiKey: z.string().optional().nullable(),
    apiDomain: z.string().optional().nullable(),
    apiDailyLimit: z.number().int().min(1).optional().nullable(),
    apiWebhookUrl: z.string().max(500).optional().nullable(),
    
    fromEmail: z.preprocess((val) => val === '' ? null : val, z.string().email('E-mail inválido').optional().nullable()),
    fromName: z.string().optional().nullable(),
    replyTo: z.preprocess((val) => val === '' ? null : val, z.string().email('E-mail inválido').optional().nullable()),
    
    defaultShowBranding: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export type CreateEmailConfigInput = z.infer<typeof createEmailConfigSchema>['body'];
export type UpdateEmailConfigInput = z.infer<typeof updateEmailConfigSchema>['body'];
