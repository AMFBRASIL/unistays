import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateMealInput, UpdateMealInput } from '@/validators/meal.validator';
import { v4 as uuidv4 } from 'uuid';

interface MealResponse {
  id: number;
  uuid: string;
  propertyId: number;
  code: string;
  name: string;
  mealType: string;
  servingType: string;
  description: string | null;
  price: number;
  pricePerPerson: boolean;
  startTime: string | null;
  endTime: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MealController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, propertyId, mealType, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          m.id,
          m.uuid,
          m.property_id as propertyId,
          m.code,
          m.name,
          m.meal_type as mealType,
          m.serving_type as servingType,
          m.description,
          m.price,
          m.price_per_person as pricePerPerson,
          m.start_time as startTime,
          m.end_time as endTime,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt,
          p.name as propertyName
        FROM meals m
        LEFT JOIN properties p ON m.property_id = p.id AND p.deleted_at IS NULL
        WHERE m.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          m.name LIKE ? OR 
          m.code LIKE ? OR
          m.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (propertyId) {
        query += ` AND m.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (mealType) {
        query += ` AND m.meal_type = ?`;
        params.push(mealType);
      }
      if (status) {
        query += ` AND m.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY m.meal_type ASC, m.name ASC`;

      const meals = await queryRunner.query(query, params);
      await queryRunner.release();

      const mealsResponse: MealResponse[] = meals.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        mealType: row.mealType,
        servingType: row.servingType,
        description: row.description,
        price: row.price ? Number(row.price) : 0,
        pricePerPerson: row.pricePerPerson === 1 || row.pricePerPerson === true,
        startTime: row.startTime ? String(row.startTime).substring(0, 5) : null, // HH:MM format
        endTime: row.endTime ? String(row.endTime).substring(0, 5) : null, // HH:MM format
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { meals: mealsResponse },
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
          m.id,
          m.uuid,
          m.property_id as propertyId,
          m.code,
          m.name,
          m.meal_type as mealType,
          m.serving_type as servingType,
          m.description,
          m.price,
          m.price_per_person as pricePerPerson,
          m.start_time as startTime,
          m.end_time as endTime,
          m.status,
          m.created_at as createdAt,
          m.updated_at as updatedAt,
          p.name as propertyName
        FROM meals m
        LEFT JOIN properties p ON m.property_id = p.id AND p.deleted_at IS NULL
        WHERE m.id = ? AND m.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Refeição não encontrada', 404);
      }

      const row = results[0];

      const mealResponse: MealResponse = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.propertyId,
        code: row.code,
        name: row.name,
        mealType: row.mealType,
        servingType: row.servingType,
        description: row.description,
        price: row.price ? Number(row.price) : 0,
        pricePerPerson: row.pricePerPerson === 1 || row.pricePerPerson === true,
        startTime: row.startTime ? String(row.startTime).substring(0, 5) : null,
        endTime: row.endTime ? String(row.endTime).substring(0, 5) : null,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: mealResponse,
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
      const data: CreateMealInput = req.body;

      // Verificar se código já existe para a propriedade
      const existingMeal = await queryRunner.query(
        `SELECT id FROM meals WHERE property_id = ? AND code = ? AND deleted_at IS NULL`,
        [data.propertyId, data.code]
      );

      if (existingMeal.length > 0) {
        throw new AppError('Já existe uma refeição com este código para esta propriedade', 400);
      }

      const uuid = uuidv4();

      const insertQuery = `
        INSERT INTO meals (
          uuid, property_id, code, name, meal_type, serving_type, description,
          price, price_per_person, start_time, end_time, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.propertyId,
        data.code,
        data.name,
        data.mealType,
        data.servingType,
        data.description || null,
        data.price,
        data.pricePerPerson !== false ? 1 : 0,
        data.startTime || null,
        data.endTime || null,
        data.status || 'active',
      ]);

      await queryRunner.commitTransaction();

      // Buscar a refeição criada
      const newMeal = await queryRunner.query(
        `SELECT id FROM meals WHERE uuid = ?`,
        [uuid]
      );

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newMeal[0].id, uuid },
        message: 'Refeição criada com sucesso',
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
      const data: UpdateMealInput = req.body;

      // Verificar se refeição existe
      const existingMeal = await queryRunner.query(
        `SELECT id, property_id, code FROM meals WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingMeal.length === 0) {
        throw new AppError('Refeição não encontrada', 404);
      }

      const currentMeal = existingMeal[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentMeal.code) {
        const propertyIdToCheck = data.propertyId || currentMeal.property_id;
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM meals WHERE property_id = ? AND code = ? AND id != ? AND deleted_at IS NULL`,
          [propertyIdToCheck, data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe uma refeição com este código para esta propriedade', 400);
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
      if (data.mealType !== undefined) {
        updateFields.push('meal_type = ?');
        updateValues.push(data.mealType);
      }
      if (data.servingType !== undefined) {
        updateFields.push('serving_type = ?');
        updateValues.push(data.servingType);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(data.price);
      }
      if (data.pricePerPerson !== undefined) {
        updateFields.push('price_per_person = ?');
        updateValues.push(data.pricePerPerson ? 1 : 0);
      }
      if (data.startTime !== undefined) {
        updateFields.push('start_time = ?');
        updateValues.push(data.startTime || null);
      }
      if (data.endTime !== undefined) {
        updateFields.push('end_time = ?');
        updateValues.push(data.endTime || null);
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

      const updateQuery = `UPDATE meals SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Refeição atualizada com sucesso',
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

      // Verificar se refeição existe
      const existingMeal = await queryRunner.query(
        `SELECT id FROM meals WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingMeal.length === 0) {
        throw new AppError('Refeição não encontrada', 404);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE meals SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Refeição excluída com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
