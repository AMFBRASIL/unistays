import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateAmenityInput, UpdateAmenityInput } from '@/validators/amenity.validator';
import { v4 as uuidv4 } from 'uuid';

interface AmenityResponse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  category: string;
  icon: string | null;
  description: string | null;
  isChargeable: boolean;
  price: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, category, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          code,
          name,
          category,
          icon,
          description,
          is_chargeable as isChargeable,
          price,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM amenities
        WHERE deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          name LIKE ? OR 
          code LIKE ? OR
          description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (category) {
        query += ` AND category = ?`;
        params.push(category);
      }
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY category ASC, name ASC`;

      const amenities = await queryRunner.query(query, params);
      await queryRunner.release();

      const amenitiesResponse: AmenityResponse[] = amenities.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        category: row.category,
        icon: row.icon,
        description: row.description,
        isChargeable: row.isChargeable === 1 || row.isChargeable === true,
        price: row.price ? Number(row.price) : null,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { amenities: amenitiesResponse },
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
          uuid,
          code,
          name,
          category,
          icon,
          description,
          is_chargeable as isChargeable,
          price,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM amenities
        WHERE id = ? AND deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Amenidade não encontrada', 404);
      }

      const row = results[0];

      const amenityResponse: AmenityResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        category: row.category,
        icon: row.icon,
        description: row.description,
        isChargeable: row.isChargeable === 1 || row.isChargeable === true,
        price: row.price ? Number(row.price) : null,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: amenityResponse,
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
      const data: CreateAmenityInput = req.body;

      // Verificar se código já existe
      const existingAmenity = await queryRunner.query(
        `SELECT id FROM amenities WHERE code = ? AND deleted_at IS NULL`,
        [data.code]
      );

      if (existingAmenity.length > 0) {
        throw new AppError('Já existe uma amenidade com este código', 400);
      }

      // Validar preço se cobrável
      if (data.isChargeable && (!data.price || data.price <= 0)) {
        throw new AppError('Preço é obrigatório quando a amenidade é cobrável', 400);
      }

      const uuid = uuidv4();

      const insertQuery = `
        INSERT INTO amenities (
          uuid, code, name, category, icon, description,
          is_chargeable, price, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.code,
        data.name,
        data.category,
        data.icon || null,
        data.description || null,
        data.isChargeable ? 1 : 0,
        data.isChargeable ? (data.price || null) : null,
        data.status || 'active',
      ]);

      await queryRunner.commitTransaction();

      // Buscar a amenidade criada
      const newAmenity = await queryRunner.query(
        `SELECT id FROM amenities WHERE uuid = ?`,
        [uuid]
      );

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newAmenity[0].id, uuid },
        message: 'Amenidade criada com sucesso',
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
      const data: UpdateAmenityInput = req.body;

      // Verificar se amenidade existe
      const existingAmenity = await queryRunner.query(
        `SELECT id, code, is_chargeable FROM amenities WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingAmenity.length === 0) {
        throw new AppError('Amenidade não encontrada', 404);
      }

      const currentAmenity = existingAmenity[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentAmenity.code) {
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM amenities WHERE code = ? AND id != ? AND deleted_at IS NULL`,
          [data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe uma amenidade com este código', 400);
        }
      }

      // Validar preço se isChargeable foi alterado ou definido
      const isChargeableToCheck = data.isChargeable !== undefined ? data.isChargeable : (currentAmenity.is_chargeable === 1);
      if (isChargeableToCheck && data.price !== undefined && data.price !== null && data.price <= 0) {
        throw new AppError('Preço deve ser maior que zero quando a amenidade é cobrável', 400);
      }

      // Construir query de update dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.code !== undefined) {
        updateFields.push('code = ?');
        updateValues.push(data.code);
      }
      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.icon !== undefined) {
        updateFields.push('icon = ?');
        updateValues.push(data.icon || null);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.isChargeable !== undefined) {
        updateFields.push('is_chargeable = ?');
        updateValues.push(data.isChargeable ? 1 : 0);
      }
      if (data.price !== undefined) {
        updateFields.push('price = ?');
        const isChargeable = data.isChargeable !== undefined ? data.isChargeable : (currentAmenity.is_chargeable === 1);
        updateValues.push(isChargeable ? (data.price || null) : null);
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

      const updateQuery = `UPDATE amenities SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Amenidade atualizada com sucesso',
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

      // Verificar se amenidade existe
      const existingAmenity = await queryRunner.query(
        `SELECT id FROM amenities WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingAmenity.length === 0) {
        throw new AppError('Amenidade não encontrada', 404);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE amenities SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Amenidade excluída com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
