import { Request, Response, NextFunction } from 'express';
import { SetupService, SetupWizardData } from '../services/SetupService';
import { SetupProgressService } from '../services/SetupProgressService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property.entity';
import { IsNull } from 'typeorm';
import type { AuthRequest } from '@/middlewares/auth.middleware';

export class SetupController {
  /** Progresso de configuração (dados reais) — requer autenticação. */
  async getProgress(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await SetupProgressService.compute();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async checkInstallationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const propertyRepository = AppDataSource.getRepository(Property);
      const propertyCount = await propertyRepository.count({
        where: { deletedAt: IsNull() },
      });

      res.json({
        success: true,
        data: {
          installed: propertyCount > 0,
          propertyCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Processa a instalação completa do sistema
   */
  async install(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as SetupWizardData;

      // Validações básicas
      if (!data.nomeEmpreendimento) {
        res.status(400).json({
          success: false,
          message: 'Nome do empreendimento é obrigatório',
        });
        return;
      }

      if (!data.usuarios || data.usuarios.length === 0) {
        res.status(400).json({
          success: false,
          message: 'É necessário criar pelo menos um usuário',
        });
        return;
      }

      // Verificar se já existe propriedade
      const propertyRepository = AppDataSource.getRepository(Property);
      const existingProperty = await propertyRepository.findOne({
        where: { name: data.nomeEmpreendimento, deletedAt: IsNull() },
      });

      if (existingProperty) {
        res.status(400).json({
          success: false,
          message: 'Já existe uma propriedade com este nome',
        });
        return;
      }

      // Processar instalação
      const result = await SetupService.processInstallation(data);

      logger.info('Instalação concluída com sucesso', {
        propertyId: result.data.propertyId,
        userIds: result.data.userIds,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      logger.error('Erro durante instalação:', error);
      next(error);
    }
  }
}
