import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { OutboundWebhookService } from '@/services/webhooks/OutboundWebhookService';
import { ensureOutboundWebhookSchema } from '@/services/webhooks/ensureOutboundWebhookSchema';

export class OutboundWebhookController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webhooks = await OutboundWebhookService.list();
      res.json({ success: true, data: { webhooks } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const webhook = await OutboundWebhookService.create({
        name: req.body?.name,
        url: req.body?.url,
        events: req.body?.events || [],
        secret: req.body?.secret,
        isActive: req.body?.isActive,
      });
      res.status(201).json({ success: true, data: webhook });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const webhook = await OutboundWebhookService.update(id, {
        name: req.body?.name,
        url: req.body?.url,
        events: req.body?.events,
        secret: req.body?.secret,
        isActive: req.body?.isActive,
      });
      res.json({ success: true, data: webhook });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      await OutboundWebhookService.remove(id);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }

  async test(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const result = await OutboundWebhookService.test(id);
      res.json({ success: result.ok, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** Endpoint interno de eco — seed aponta aqui para entregas reais funcionarem. */
  async echo(req: Request, res: Response) {
    await ensureOutboundWebhookSchema();
    res.status(200).json({
      success: true,
      received: true,
      event: req.body?.event || null,
      at: new Date().toISOString(),
    });
  }
}
