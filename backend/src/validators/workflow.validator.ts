import { z } from 'zod';

// Novo schema: workflows + workflow_steps (trigger_id, action_id, step_order)
const stepSchema = z.object({
  id: z.string().uuid().optional(),
  stepType: z.enum(['trigger', 'action', 'condition', 'delay', 'loop']).optional(),
  type: z.enum(['trigger', 'action', 'condition', 'delay', 'loop', 'split']).optional(), // split = condition
  triggerId: z.string().uuid().nullable().optional(),
  trigger_id: z.string().uuid().nullable().optional(),
  actionId: z.string().uuid().nullable().optional(),
  action_id: z.string().uuid().nullable().optional(),
  stepOrder: z.number().int().min(0).optional(),
  step_order: z.number().int().min(0).optional(),
  config: z.record(z.any()).optional(),
  delaySeconds: z.number().int().min(0).optional(),
  delay_seconds: z.number().int().min(0).optional(),
  retryCount: z.number().int().min(0).optional(),
  retry_count: z.number().int().min(0).optional(),
  retryDelaySeconds: z.number().int().min(0).optional(),
  retry_delay_seconds: z.number().int().min(0).optional(),
  conditionExpression: z.string().optional(),
}).passthrough();

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    isActive: z.boolean().optional(),
    status: z.enum(['active', 'paused', 'draft']).optional(),
    steps: z.array(stepSchema).optional().default([]),
  }).passthrough(),
});

export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
    isActive: z.boolean().optional(),
    status: z.enum(['active', 'paused', 'draft']).optional(),
    steps: z.array(stepSchema).optional(),
  }).passthrough(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>['body'];
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>['body'];
