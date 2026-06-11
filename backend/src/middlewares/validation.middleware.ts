import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Para POST transactions: se body vier vazio mas o payload estiver em req.body direto, garantir estrutura
      let body = req.body;
      if (req.originalUrl?.includes('transaction') && req.method === 'POST') {
        console.log('[Validation] POST transaction - req.body:', typeof req.body, JSON.stringify(req.body, null, 2));
        // Caso body seja undefined, usar {} para evitar crash
        if (body === undefined || body === null) {
          console.warn('[Validation] POST transaction - req.body está vazio/undefined! Verifique Content-Type: application/json');
          body = {};
        }
      }
      const input = { body, query: req.query, params: req.params };
      const parsed = schema.parse(input) as { body?: unknown; query?: unknown; params?: unknown };
      // Garantir que o controller receba o body validado (incluindo triggerType, etc.)
      if (parsed && typeof parsed === 'object' && 'body' in parsed && parsed.body != null) {
        req.body = parsed.body;
      }
      if (req.originalUrl?.includes('transaction') && req.method === 'POST') {
        console.log('[Validation] POST transaction - validação OK, body validado:', JSON.stringify(req.body, null, 2));
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        console.error('[Validation] ❌ Erro de validação:', {
          path: req.path,
          originalUrl: req.originalUrl,
          body: req.body,
          contentType: req.get('Content-Type'),
          errors: errors,
        });
        const msg = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
        throw new AppError(
          `Dados inválidos: ${msg}`,
          400
        );
      }
      next(error);
    }
  };
};
