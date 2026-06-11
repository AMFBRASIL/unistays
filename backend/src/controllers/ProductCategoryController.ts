import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateProductCategoryInput, UpdateProductCategoryInput } from '@/validators/productCategory.validator';
import { v4 as uuidv4 } from 'uuid';

interface ProductCategoryResponse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parentId: number | null;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export class ProductCategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          code,
          name,
          description,
          color,
          icon,
          parent_id as parentId,
          is_active as isActive,
          created_at as createdAt,
          updated_at as updatedAt
        FROM product_categories
        WHERE 1=1
      `;

      const params: any[] = [];

      if (search) {
        query += ` AND (name LIKE ? OR code LIKE ? OR description LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        const isActive = status === 'active' ? 1 : 0;
        query += ` AND is_active = ?`;
        params.push(isActive);
      }

      query += ` ORDER BY name ASC`;

      const results = await queryRunner.query(query, params);
      await queryRunner.release();

      const categories: ProductCategoryResponse[] = results.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        description: row.description,
        color: row.color,
        icon: row.icon,
        parentId: row.parentId ?? null,
        status: row.isActive === 1 || row.isActive === true ? 'active' : 'inactive',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { productCategories: categories },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const results = await queryRunner.query(
        `SELECT 
          id,
          uuid,
          code,
          name,
          description,
          color,
          icon,
          parent_id as parentId,
          is_active as isActive,
          created_at as createdAt,
          updated_at as updatedAt
        FROM product_categories
        WHERE id = ?`,
        [id]
      );

      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Categoria de produto não encontrada', 404);
      }

      const row = results[0];
      const category: ProductCategoryResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        description: row.description,
        color: row.color,
        icon: row.icon,
        parentId: row.parentId ?? null,
        status: row.isActive === 1 || row.isActive === true ? 'active' : 'inactive',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: category,
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
      const data: CreateProductCategoryInput = req.body;
      const code = data.code.toUpperCase();

      // Verificar se código já existe
      const existing = await queryRunner.query(
        `SELECT id FROM product_categories WHERE code = ?`,
        [code]
      );

      if (existing.length > 0) {
        throw new AppError('Código de categoria já existe', 400);
      }

      const uuid = uuidv4();

      const isActive = (data.status || 'active') === 'active' ? 1 : 0;
      await queryRunner.query(
        `INSERT INTO product_categories (
          uuid, code, name, description, color, icon, parent_id, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          code,
          data.name,
          data.description || null,
          data.color || null,
          data.icon || null,
          data.parentId ?? null,
          isActive,
        ]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.status(201).json({
        success: true,
        message: 'Categoria de produto criada com sucesso',
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
      const data: UpdateProductCategoryInput = req.body;

      // Verificar se categoria existe
      const existing = await queryRunner.query(
        `SELECT id FROM product_categories WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        throw new AppError('Categoria de produto não encontrada', 404);
      }

      // Verificar código único se estiver sendo alterado
      if (data.code) {
        const code = data.code.toUpperCase();
        const codeCheck = await queryRunner.query(
          `SELECT id FROM product_categories WHERE code = ? AND id != ?`,
          [code, id]
        );

        if (codeCheck.length > 0) {
          throw new AppError('Código de categoria já existe', 400);
        }

        // Atualizar código
        await queryRunner.query(
          `UPDATE product_categories SET code = ? WHERE id = ?`,
          [code, id]
        );
      }

      // Montar campos para atualização
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description || null);
      }
      if (data.color !== undefined) {
        updateFields.push('color = ?');
        updateValues.push(data.color || null);
      }
      if (data.icon !== undefined) {
        updateFields.push('icon = ?');
        updateValues.push(data.icon || null);
      }
      if (data.parentId !== undefined) {
        updateFields.push('parent_id = ?');
        updateValues.push(data.parentId ?? null);
      }
      if (data.status !== undefined) {
        const isActive = data.status === 'active' ? 1 : 0;
        updateFields.push('is_active = ?');
        updateValues.push(isActive);
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        await queryRunner.query(
          `UPDATE product_categories SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Categoria de produto atualizada com sucesso',
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

      // Verificar se categoria existe
      const existing = await queryRunner.query(
        `SELECT id FROM product_categories WHERE id = ?`,
        [id]
      );

      if (existing.length === 0) {
        throw new AppError('Categoria de produto não encontrada', 404);
      }

      // Verificar se há produtos usando esta categoria (products usa category_id)
      const productsUsing = await queryRunner.query(
        `SELECT COUNT(*) as count FROM products WHERE category_id = ?`,
        [id]
      );

      if (productsUsing[0].count > 0) {
        throw new AppError('Não é possível excluir categoria que está em uso por produtos', 400);
      }

      // Exclusão física (tabela não tem deleted_at no schema 001)
      await queryRunner.query(
        `DELETE FROM product_categories WHERE id = ?`,
        [id]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Categoria de produto excluída com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
