import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateUnitOfMeasureInput, UpdateUnitOfMeasureInput } from '@/validators/unitOfMeasure.validator';
import { v4 as uuidv4 } from 'uuid';

const TABLE = 'measurement_units';

interface UnitOfMeasureResponse {
  id: string;
  uuid: string;
  code: string;
  name: string;
  abbreviation: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export class UnitOfMeasureController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          code,
          name,
          symbol,
          type,
          is_active,
          created_at as createdAt
        FROM ${TABLE}
        WHERE 1=1
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          name LIKE ? OR 
          code LIKE ? OR
          symbol LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (status) {
        query += ` AND is_active = ?`;
        params.push(status === 'active' ? 1 : 0);
      }

      query += ` ORDER BY name ASC`;

      const units = await queryRunner.query(query, params);
      await queryRunner.release();

      const unitsResponse: UnitOfMeasureResponse[] = units.map((row: any) => ({
        id: row.id,
        uuid: row.id,
        code: row.code,
        name: row.name,
        abbreviation: row.symbol ?? row.code,
        description: null,
        status: row.is_active ? 'active' : 'inactive',
        createdAt: row.createdAt,
        updatedAt: null,
      }));

      res.json({
        success: true,
        data: { unitsOfMeasure: unitsResponse },
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
          id,
          code,
          name,
          symbol,
          type,
          is_active,
          created_at as createdAt
        FROM ${TABLE}
        WHERE id = ?
      `;

      const results = await queryRunner.query(query, [id]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Unidade de medida não encontrada', 404);
      }

      const row = results[0];

      const unitResponse: UnitOfMeasureResponse = {
        id: row.id,
        uuid: row.id,
        code: row.code,
        name: row.name,
        abbreviation: row.symbol ?? row.code,
        description: null,
        status: row.is_active ? 'active' : 'inactive',
        createdAt: row.createdAt,
        updatedAt: null,
      };

      res.json({
        success: true,
        data: unitResponse,
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
      const data: CreateUnitOfMeasureInput = req.body;

      // Verificar se código já existe
      const existingUnit = await queryRunner.query(
        `SELECT id FROM ${TABLE} WHERE code = ?`,
        [data.code.toUpperCase()]
      );

      if (existingUnit.length > 0) {
        throw new AppError('Já existe uma unidade de medida com este código', 400);
      }

      const newId = uuidv4();
      const isActive = (data.status ?? 'active') === 'active' ? 1 : 0;
      const type = (data as any).type ?? 'unit';

      const insertQuery = `
        INSERT INTO ${TABLE} (
          id, code, name, symbol, type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        newId,
        data.code.toUpperCase(),
        data.name,
        data.abbreviation,
        type,
        isActive,
      ]);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newId, uuid: newId },
        message: 'Unidade de medida criada com sucesso',
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
      const data: UpdateUnitOfMeasureInput = req.body;

      // Verificar se unidade existe
      const existingUnit = await queryRunner.query(
        `SELECT id, code FROM ${TABLE} WHERE id = ?`,
        [id]
      );

      if (existingUnit.length === 0) {
        throw new AppError('Unidade de medida não encontrada', 404);
      }

      const currentUnit = existingUnit[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code.toUpperCase() !== currentUnit.code) {
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM ${TABLE} WHERE code = ? AND id != ?`,
          [data.code.toUpperCase(), id]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe uma unidade de medida com este código', 400);
        }
      }

      // Construir query de update dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateValues.push(data.code.toUpperCase());
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.abbreviation !== undefined) {
        updateFields.push('symbol = ?');
        updateValues.push(data.abbreviation);
      }
      if (data.status !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(data.status === 'active' ? 1 : 0);
      }

      if (updateFields.length === 0) {
        throw new AppError('Nenhum campo para atualizar', 400);
      }

      updateValues.push(id);

      const updateQuery = `UPDATE ${TABLE} SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Unidade de medida atualizada com sucesso',
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

      // Verificar se unidade existe
      const existingUnit = await queryRunner.query(
        `SELECT id FROM ${TABLE} WHERE id = ?`,
        [id]
      );

      if (existingUnit.length === 0) {
        throw new AppError('Unidade de medida não encontrada', 404);
      }

      // Soft delete (desativar)
      await queryRunner.query(
        `UPDATE ${TABLE} SET is_active = 0 WHERE id = ?`,
        [id]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Unidade de medida excluída com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
