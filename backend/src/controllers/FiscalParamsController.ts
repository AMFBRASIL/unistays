import { Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateFiscalParamsInput, UpdateFiscalParamsInput } from '@/validators/fiscalParams.validator';
import { v4 as uuidv4 } from 'uuid';

interface FiscalParamsResponse {
  id: number;
  uuid: string;
  propertyId: number | null;
  
  // Regime Tributário
  taxRegime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
  
  // Alíquotas e Inclusão de Impostos
  icmsRate: number | null;
  icmsIncluded: boolean;
  ipiRate: number | null;
  ipiIncluded: boolean;
  pisRate: number | null;
  pisIncluded: boolean;
  cofinsRate: number | null;
  cofinsIncluded: boolean;
  issRate: number | null;
  issIncluded: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export class FiscalParamsController {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId: propertyIdParam } = req.query;
      const propertyId = propertyIdParam ? parseInt(propertyIdParam as string, 10) : null;
      const queryRunner = AppDataSource.createQueryRunner();

      const params: any[] = [];
      const query = `
        SELECT 
          fp.id,
          fp.uuid,
          fp.property_id as propertyId,
          fp.tax_regime as taxRegime,
          fp.icms_rate as icmsRate,
          fp.icms_included as icmsIncluded,
          fp.ipi_rate as ipiRate,
          fp.ipi_included as ipiIncluded,
          fp.pis_rate as pisRate,
          fp.pis_included as pisIncluded,
          fp.cofins_rate as cofinsRate,
          fp.cofins_included as cofinsIncluded,
          fp.iss_rate as issRate,
          fp.iss_included as issIncluded,
          fp.created_at as createdAt,
          fp.updated_at as updatedAt
        FROM fiscal_params fp
        WHERE fp.property_id ${propertyId ? '= ?' : 'IS NULL'}
        LIMIT 1
      `;

      if (propertyId) {
        params.push(propertyId);
      }

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      if (results.length === 0) {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      const row = results[0];
      
      const response: FiscalParamsResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        taxRegime: row.taxRegime || 'simples_nacional',
        icmsRate: row.icmsRate,
        icmsIncluded: row.icmsIncluded === 1 || row.icmsIncluded === true,
        ipiRate: row.ipiRate,
        ipiIncluded: row.ipiIncluded === 1 || row.ipiIncluded === true,
        pisRate: row.pisRate,
        pisIncluded: row.pisIncluded === 1 || row.pisIncluded === true,
        cofinsRate: row.cofinsRate,
        cofinsIncluded: row.cofinsIncluded === 1 || row.cofinsIncluded === true,
        issRate: row.issRate,
        issIncluded: row.issIncluded === 1 || row.issIncluded === true,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateFiscalParamsInput | UpdateFiscalParamsInput = req.body;
      const propertyId = data.propertyId || null;

      // Verificar se já existe configuração para esta propriedade (ou global)
      const existing = await queryRunner.query(
        `SELECT id FROM fiscal_params WHERE property_id ${propertyId ? '= ?' : 'IS NULL'}`,
        propertyId ? [propertyId] : []
      );

      if (existing.length > 0) {
        // UPDATE
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.taxRegime !== undefined) {
          updateFields.push('tax_regime = ?');
          updateValues.push(data.taxRegime);
        }

        if (data.icmsRate !== undefined) {
          updateFields.push('icms_rate = ?');
          updateValues.push(data.icmsRate);
        }
        if (data.icmsIncluded !== undefined) {
          updateFields.push('icms_included = ?');
          updateValues.push(data.icmsIncluded ? 1 : 0);
        }

        if (data.ipiRate !== undefined) {
          updateFields.push('ipi_rate = ?');
          updateValues.push(data.ipiRate);
        }
        if (data.ipiIncluded !== undefined) {
          updateFields.push('ipi_included = ?');
          updateValues.push(data.ipiIncluded ? 1 : 0);
        }

        if (data.pisRate !== undefined) {
          updateFields.push('pis_rate = ?');
          updateValues.push(data.pisRate);
        }
        if (data.pisIncluded !== undefined) {
          updateFields.push('pis_included = ?');
          updateValues.push(data.pisIncluded ? 1 : 0);
        }

        if (data.cofinsRate !== undefined) {
          updateFields.push('cofins_rate = ?');
          updateValues.push(data.cofinsRate);
        }
        if (data.cofinsIncluded !== undefined) {
          updateFields.push('cofins_included = ?');
          updateValues.push(data.cofinsIncluded ? 1 : 0);
        }

        if (data.issRate !== undefined) {
          updateFields.push('iss_rate = ?');
          updateValues.push(data.issRate);
        }
        if (data.issIncluded !== undefined) {
          updateFields.push('iss_included = ?');
          updateValues.push(data.issIncluded ? 1 : 0);
        }

        if (updateFields.length === 0) {
          throw new AppError('Nenhum campo fornecido para atualização', 400);
        }

        updateValues.push(existing[0].id);

        const updateQuery = `
          UPDATE fiscal_params
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = ?
        `;

        await queryRunner.query(updateQuery, updateValues);
        await queryRunner.commitTransaction();

        // Retornar dados atualizados
        const updated = await queryRunner.query(
          `SELECT 
            id, uuid, property_id as propertyId,
            tax_regime as taxRegime,
            icms_rate as icmsRate, icms_included as icmsIncluded,
            ipi_rate as ipiRate, ipi_included as ipiIncluded,
            pis_rate as pisRate, pis_included as pisIncluded,
            cofins_rate as cofinsRate, cofins_included as cofinsIncluded,
            iss_rate as issRate, iss_included as issIncluded,
            created_at as createdAt, updated_at as updatedAt
          FROM fiscal_params WHERE id = ?`,
          [existing[0].id]
        );

        const row = updated[0];
        const response: FiscalParamsResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          taxRegime: row.taxRegime || 'simples_nacional',
          icmsRate: row.icmsRate,
          icmsIncluded: row.icmsIncluded === 1 || row.icmsIncluded === true,
          ipiRate: row.ipiRate,
          ipiIncluded: row.ipiIncluded === 1 || row.ipiIncluded === true,
          pisRate: row.pisRate,
          pisIncluded: row.pisIncluded === 1 || row.pisIncluded === true,
          cofinsRate: row.cofinsRate,
          cofinsIncluded: row.cofinsIncluded === 1 || row.cofinsIncluded === true,
          issRate: row.issRate,
          issIncluded: row.issIncluded === 1 || row.issIncluded === true,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: response,
          message: 'Parâmetros fiscais atualizados com sucesso',
        });
      } else {
        // INSERT
        const uuid = uuidv4();
        
        const insertQuery = `
          INSERT INTO fiscal_params (
            uuid, property_id,
            tax_regime,
            icms_rate, icms_included,
            ipi_rate, ipi_included,
            pis_rate, pis_included,
            cofins_rate, cofins_included,
            iss_rate, iss_included
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertValues = [
          uuid,
          propertyId,
          data.taxRegime || 'simples_nacional',
          data.icmsRate || null,
          data.icmsIncluded !== undefined ? (data.icmsIncluded ? 1 : 0) : 1,
          data.ipiRate || null,
          data.ipiIncluded !== undefined ? (data.ipiIncluded ? 1 : 0) : 0,
          data.pisRate || null,
          data.pisIncluded !== undefined ? (data.pisIncluded ? 1 : 0) : 1,
          data.cofinsRate || null,
          data.cofinsIncluded !== undefined ? (data.cofinsIncluded ? 1 : 0) : 1,
          data.issRate || null,
          data.issIncluded !== undefined ? (data.issIncluded ? 1 : 0) : 1,
        ];

        await queryRunner.query(insertQuery, insertValues);
        await queryRunner.commitTransaction();

        // Retornar dados inseridos
        const inserted = await queryRunner.query(
          `SELECT 
            id, uuid, property_id as propertyId,
            tax_regime as taxRegime,
            icms_rate as icmsRate, icms_included as icmsIncluded,
            ipi_rate as ipiRate, ipi_included as ipiIncluded,
            pis_rate as pisRate, pis_included as pisIncluded,
            cofins_rate as cofinsRate, cofins_included as cofinsIncluded,
            iss_rate as issRate, iss_included as issIncluded,
            created_at as createdAt, updated_at as updatedAt
          FROM fiscal_params WHERE uuid = ?`,
          [uuid]
        );

        const row = inserted[0];
        const response: FiscalParamsResponse = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          taxRegime: row.taxRegime || 'simples_nacional',
          icmsRate: row.icmsRate,
          icmsIncluded: row.icmsIncluded === 1 || row.icmsIncluded === true,
          ipiRate: row.ipiRate,
          ipiIncluded: row.ipiIncluded === 1 || row.ipiIncluded === true,
          pisRate: row.pisRate,
          pisIncluded: row.pisIncluded === 1 || row.pisIncluded === true,
          cofinsRate: row.cofinsRate,
          cofinsIncluded: row.cofinsIncluded === 1 || row.cofinsIncluded === true,
          issRate: row.issRate,
          issIncluded: row.issIncluded === 1 || row.issIncluded === true,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: response,
          message: 'Parâmetros fiscais criados com sucesso',
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao salvar parâmetros fiscais:', error);
      next(error);
    } finally {
      await queryRunner.release();
    }
  }
}
