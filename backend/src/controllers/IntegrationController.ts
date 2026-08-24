import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { IntegrationService } from '@/services/integrations';

export class IntegrationController {
  async listProviders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const providers = await IntegrationService.listProviders();
      res.json({ success: true, data: { providers } });
    } catch (error) {
      next(error);
    }
  }

  async listConnections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const providerCode =
        typeof req.query.provider === 'string' ? req.query.provider : undefined;
      const connections = await IntegrationService.listConnections({ providerCode });
      res.json({ success: true, data: { connections } });
    } catch (error) {
      next(error);
    }
  }

  async getConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const connection = await IntegrationService.getConnection(id);
      res.json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async createConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { providerCode, name, propertyId, accessToken, settings } = req.body || {};
      if (!providerCode || !name || !accessToken) {
        throw new AppError('providerCode, name e accessToken são obrigatórios', 400);
      }
      const connection = await IntegrationService.createConnection({
        providerCode: String(providerCode),
        name: String(name),
        propertyId: propertyId != null ? Number(propertyId) : null,
        accessToken: String(accessToken),
        settings: settings && typeof settings === 'object' ? settings : undefined,
        createdBy: req.userId ?? null,
      });
      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async updateConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const connection = await IntegrationService.updateConnection(id, {
        name: req.body?.name,
        propertyId: req.body?.propertyId,
        accessToken: req.body?.accessToken,
        settings: req.body?.settings,
        status: req.body?.status,
      });
      res.json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }

  async deleteConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      await IntegrationService.deleteConnection(id);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const result = await IntegrationService.testConnection(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listExternalProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const properties = await IntegrationService.listExternalProperties(id);
      res.json({ success: true, data: { properties } });
    } catch (error) {
      next(error);
    }
  }

  async listExternalListings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const listings = await IntegrationService.listExternalListings(id);
      res.json({ success: true, data: { listings } });
    } catch (error) {
      next(error);
    }
  }

  async listMappings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const entityType =
        typeof req.query.entityType === 'string' ? req.query.entityType : 'unit';
      const mappings = await IntegrationService.listMappings(id, entityType);
      res.json({ success: true, data: { mappings } });
    } catch (error) {
      next(error);
    }
  }

  async listExternalRoomTypes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const propertyExternalId =
        typeof req.query.propertyId === 'string' ? req.query.propertyId : undefined;
      const roomTypes = await IntegrationService.listExternalRoomTypes(id, propertyExternalId);
      res.json({ success: true, data: { roomTypes } });
    } catch (error) {
      next(error);
    }
  }

  async upsertMapping(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const { localId, externalId, externalLabel, metadata } = req.body || {};
      const mapping = await IntegrationService.upsertUnitMapping(id, {
        localId: Number(localId),
        externalId: String(externalId || ''),
        externalLabel: externalLabel != null ? String(externalLabel) : null,
        metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
      });
      res.json({ success: true, data: mapping });
    } catch (error) {
      next(error);
    }
  }

  async deleteMapping(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const mappingId = Number(req.params.mappingId);
      if (!id || !mappingId) throw new AppError('ID inválido', 400);
      await IntegrationService.deleteMapping(id, mappingId);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }

  async deleteMappingByExternal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const externalId = String(req.params.externalId || '');
      if (!id || !externalId) throw new AppError('ID inválido', 400);
      await IntegrationService.deleteMappingByExternalId(id, externalId);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  }

  async registerWebhook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const connection = await IntegrationService.getConnection(id);
      if (connection.providerCode !== 'channex') {
        throw new AppError('Webhook disponível apenas para Channex', 400);
      }
      const result = await IntegrationService.ensureChannexWebhook(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async pullBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const connection = await IntegrationService.getConnection(id);
      if (connection.providerCode !== 'channex') {
        throw new AppError('Pull de feed disponível apenas para Channex', 400);
      }
      const result = await IntegrationService.pullChannexBookings(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async listExternalRatePlans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const propertyExternalId =
        typeof req.query.propertyId === 'string' ? req.query.propertyId : undefined;
      const ratePlans = await IntegrationService.listExternalRatePlans(id, propertyExternalId);
      res.json({ success: true, data: { ratePlans } });
    } catch (error) {
      next(error);
    }
  }

  async provisionFromUnistays(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const propertyId = Number(req.body?.propertyId);
      if (!propertyId) throw new AppError('propertyId é obrigatório', 400);
      const result = await IntegrationService.provisionFromUnistays(id, propertyId, {
        daysAhead: req.body?.daysAhead != null ? Number(req.body.daysAhead) : 90,
        currency: req.body?.currency != null ? String(req.body.currency) : 'BRL',
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async syncAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const daysAhead = req.body?.daysAhead != null ? Number(req.body.daysAhead) : 90;
      const result = await IntegrationService.syncAvailabilityWindow(id, daysAhead);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async syncRates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const daysAhead = req.body?.daysAhead != null ? Number(req.body.daysAhead) : 90;
      const result = await IntegrationService.syncRatesWindow(id, daysAhead);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async doctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const connection = await IntegrationService.getConnection(id);
      if (connection.providerCode !== 'channex') {
        throw new AppError('Doctor disponível apenas para Channex', 400);
      }
      const result = await IntegrationService.doctorChannex(id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async recoverBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new AppError('ID inválido', 400);
      const since = String(req.body?.insertedAtGte || '').trim();
      if (!since) {
        throw new AppError('insertedAtGte é obrigatório (ISO datetime, ex. início da outage)', 400);
      }
      const result = await IntegrationService.recoverChannexBookings(id, since);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reservationChannelFlow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reservationId = Number(req.params.reservationId);
      if (!reservationId) throw new AppError('ID da reserva inválido', 400);
      const data = await IntegrationService.getChannelManagerFlow(reservationId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /** Public — Channex booking webhook (signal → pull feed + ACK). */
  async channexWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const uuid = String(req.params.connectionUuid || '');
      if (!uuid) throw new AppError('UUID inválido', 400);
      const result = await IntegrationService.handleChannexWebhook(uuid, req.body || {});
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
