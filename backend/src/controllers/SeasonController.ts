import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateSeasonInput, UpdateSeasonInput } from '@/validators/season.validator';
import { v4 as uuidv4 } from 'uuid';

interface SeasonResponse {
  id: number;
  uuid: string;
  propertyId: number;
  code: string;
  name: string;
  type: string;
  startDate: Date;
  endDate: Date;
  priceMultiplier: number;
  isRecurring: boolean;
  recurrencePattern: Record<string, any> | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SeasonController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, type, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          s.id,
          s.uuid,
          s.property_id as propertyId,
          s.code,
          s.name,
          s.type,
          s.start_date as startDate,
          s.end_date as endDate,
          s.price_multiplier as priceMultiplier,
          s.is_recurring as isRecurring,
          s.recurrence_pattern as recurrencePattern,
          s.description,
          s.status,
          s.created_at as createdAt,
          s.updated_at as updatedAt,
          p.name as propertyName
        FROM seasons s
        LEFT JOIN properties p ON s.property_id = p.id AND p.deleted_at IS NULL
        WHERE s.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          s.name LIKE ? OR 
          s.code LIKE ? OR
          s.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (propertyId) {
        query += ` AND s.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (type) {
        query += ` AND s.type = ?`;
        params.push(type);
      }
      if (status) {
        query += ` AND s.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY s.start_date DESC, s.created_at DESC`;

      const seasons = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados e parse JSON fields
      const seasonsResponse: SeasonResponse[] = seasons.map((row: any) => {
        let recurrencePattern = null;

        try {
          if (row.recurrencePattern) {
            recurrencePattern = typeof row.recurrencePattern === 'string' ? JSON.parse(row.recurrencePattern) : row.recurrencePattern;
          }
        } catch (error) {
          // Ignore JSON parse errors
        }

        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          code: row.code,
          name: row.name,
          type: row.type,
          startDate: row.startDate,
          endDate: row.endDate,
          priceMultiplier: row.priceMultiplier ? Number(row.priceMultiplier) : 1.0,
          isRecurring: row.isRecurring === 1 || row.isRecurring === true,
          recurrencePattern,
          description: row.description,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { seasons: seasonsResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const query = `
        SELECT 
          s.id,
          s.uuid,
          s.property_id as propertyId,
          s.code,
          s.name,
          s.type,
          s.start_date as startDate,
          s.end_date as endDate,
          s.price_multiplier as priceMultiplier,
          s.is_recurring as isRecurring,
          s.recurrence_pattern as recurrencePattern,
          s.description,
          s.status,
          s.created_at as createdAt,
          s.updated_at as updatedAt,
          p.name as propertyName
        FROM seasons s
        LEFT JOIN properties p ON s.property_id = p.id AND p.deleted_at IS NULL
        WHERE s.id = ? AND s.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Temporada não encontrada', 404);
      }

      const row = results[0];
      let recurrencePattern = null;

      try {
        if (row.recurrencePattern) {
          recurrencePattern = typeof row.recurrencePattern === 'string' ? JSON.parse(row.recurrencePattern) : row.recurrencePattern;
        }
      } catch (error) {
        // Ignore JSON parse errors
      }

      const seasonResponse: SeasonResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        type: row.type,
        startDate: row.startDate,
        endDate: row.endDate,
        priceMultiplier: row.priceMultiplier ? Number(row.priceMultiplier) : 1.0,
        isRecurring: row.isRecurring === 1 || row.isRecurring === true,
        recurrencePattern,
        description: row.description,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: seasonResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data: CreateSeasonInput = req.body;

      // Verificar se código já existe para a propriedade
      const existingSeason = await queryRunner.query(
        `SELECT id FROM seasons WHERE property_id = ? AND code = ? AND deleted_at IS NULL`,
        [data.propertyId, data.code]
      );

      if (existingSeason.length > 0) {
        throw new AppError('Já existe uma temporada com este código para esta propriedade', 400);
      }

      // Preparar dados
      const uuid = uuidv4();
      const recurrencePatternJson = data.recurrencePattern ? JSON.stringify(data.recurrencePattern) : null;

      const insertQuery = `
        INSERT INTO seasons (
          uuid, property_id, code, name, type, start_date, end_date,
          price_multiplier, is_recurring, recurrence_pattern, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.propertyId,
        data.code,
        data.name,
        data.type,
        data.startDate,
        data.endDate,
        data.priceMultiplier || 1.0,
        data.isRecurring ? 1 : 0,
        recurrencePatternJson,
        data.description || null,
        data.status || 'active',
      ]);

      await queryRunner.commitTransaction();

      // Buscar a temporada criada
      const newSeason = await queryRunner.query(
        `SELECT id FROM seasons WHERE uuid = ?`,
        [uuid]
      );

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newSeason[0].id, uuid },
        message: 'Temporada criada com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;
      const data: UpdateSeasonInput = req.body;

      // Verificar se temporada existe
      const existingSeason = await queryRunner.query(
        `SELECT id, property_id, code FROM seasons WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingSeason.length === 0) {
        throw new AppError('Temporada não encontrada', 404);
      }

      const currentSeason = existingSeason[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentSeason.code) {
        const propertyIdToCheck = data.propertyId || currentSeason.property_id;
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM seasons WHERE property_id = ? AND code = ? AND id != ? AND deleted_at IS NULL`,
          [propertyIdToCheck, data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe uma temporada com este código para esta propriedade', 400);
        }
      }

      // Construir query de update dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.propertyId !== undefined) {
        updateFields.push('property_id = ?');
        updateValues.push(data.propertyId);
      }
      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateValues.push(data.code);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.type !== undefined) {
        updateFields.push('type = ?');
        updateValues.push(data.type);
      }
      if (data.startDate !== undefined) {
        updateFields.push('start_date = ?');
        updateValues.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        updateFields.push('end_date = ?');
        updateValues.push(data.endDate);
      }
      if (data.priceMultiplier !== undefined) {
        updateFields.push('price_multiplier = ?');
        updateValues.push(data.priceMultiplier);
      }
      if (data.isRecurring !== undefined) {
        updateFields.push('is_recurring = ?');
        updateValues.push(data.isRecurring ? 1 : 0);
      }
      if (data.recurrencePattern !== undefined) {
        updateFields.push('recurrence_pattern = ?');
        updateValues.push(data.recurrencePattern ? JSON.stringify(data.recurrencePattern) : null);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (updateFields.length === 0) {
        throw new AppError('Nenhum campo para atualizar', 400);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(parseInt(id, 10));

      const updateQuery = `UPDATE seasons SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Temporada atualizada com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id } = req.params;

      // Verificar se temporada existe
      const existingSeason = await queryRunner.query(
        `SELECT id FROM seasons WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingSeason.length === 0) {
        throw new AppError('Temporada não encontrada', 404);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE seasons SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Temporada excluída com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
