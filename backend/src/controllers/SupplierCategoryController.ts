import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateSupplierCategoryInput, UpdateSupplierCategoryInput } from '@/validators/supplierCategory.validator';
import { v4 as uuidv4 } from 'uuid';

interface SupplierCategoryResponse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  icon: string | null;
  colorFrom: string | null;
  colorTo: string | null;
  description: string | null;
  sortOrder: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SupplierCategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          id,
          uuid,
          code,
          name,
          icon,
          color_from as colorFrom,
          color_to as colorTo,
          description,
          sort_order as sortOrder,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM supplier_categories
      `;

      const params: any[] = [];
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY sort_order ASC, name ASC`;

      const categories = await queryRunner.query(query, params);
      await queryRunner.release();

      const categoriesResponse: SupplierCategoryResponse[] = categories.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        icon: row.icon,
        colorFrom: row.colorFrom,
        colorTo: row.colorTo,
        description: row.description,
        sortOrder: row.sortOrder,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { categories: categoriesResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      try {
        const query = `
          SELECT 
            id,
            uuid,
            code,
            name,
            icon,
            color_from as colorFrom,
            color_to as colorTo,
            description,
            sort_order as sortOrder,
            status,
            created_at as createdAt,
            updated_at as updatedAt
          FROM supplier_categories
          WHERE id = ?
        `;

        const results = await queryRunner.query(query, [parseInt(id, 10)]);

        if (results.length === 0) {
          throw new AppError('Categoria não encontrada', 404);
        }

        const row = results[0];
        const categoryResponse: SupplierCategoryResponse = {
          id: row.id,
          uuid: row.uuid,
          code: row.code,
          name: row.name,
          icon: row.icon,
          colorFrom: row.colorFrom,
          colorTo: row.colorTo,
          description: row.description,
          sortOrder: row.sortOrder,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: categoryResponse,
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateSupplierCategoryInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se código já existe
        const existing = await queryRunner.query(
          `SELECT id FROM supplier_categories WHERE code = ?`,
          [data.code]
        );

        if (existing.length > 0) {
          throw new AppError('Código de categoria já existe', 400);
        }

        const uuid = uuidv4();
        const insertQuery = `
          INSERT INTO supplier_categories (
            uuid, code, name, icon, color_from, color_to, description, sort_order, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const insertParams: any[] = [
          uuid,
          data.code,
          data.name,
          data.icon || null,
          data.colorFrom || null,
          data.colorTo || null,
          data.description || null,
          data.sortOrder || 0,
          data.status || 'active',
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const categoryId = result.insertId;

        await queryRunner.commitTransaction();

        // Buscar categoria criada
        const selectQuery = `
          SELECT 
            id, uuid, code, name, icon, color_from as colorFrom, color_to as colorTo,
            description, sort_order as sortOrder, status,
            created_at as createdAt, updated_at as updatedAt
          FROM supplier_categories
          WHERE id = ?
        `;

        const createdCategory = await queryRunner.query(selectQuery, [categoryId]);
        await queryRunner.release();

        const row = createdCategory[0];
        const categoryResponse: SupplierCategoryResponse = {
          id: row.id,
          uuid: row.uuid,
          code: row.code,
          name: row.name,
          icon: row.icon,
          colorFrom: row.colorFrom,
          colorTo: row.colorTo,
          description: row.description,
          sortOrder: row.sortOrder,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.status(201).json({
          success: true,
          data: categoryResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateSupplierCategoryInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se a categoria existe
        const checkQuery = `SELECT id FROM supplier_categories WHERE id = ?`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Categoria não encontrada', 404);
        }

        // Se estiver alterando o código, verificar se já existe
        if (data.code) {
          const codeCheck = await queryRunner.query(
            `SELECT id FROM supplier_categories WHERE code = ? AND id != ?`,
            [data.code, parseInt(id, 10)]
          );
          if (codeCheck.length > 0) {
            throw new AppError('Código de categoria já existe', 400);
          }
        }

        // Construir query de update dinamicamente
        const updateFields: string[] = [];
        const updateParams: any[] = [];

        if (data.code !== undefined) { updateFields.push('code = ?'); updateParams.push(data.code); }
        if (data.name !== undefined) { updateFields.push('name = ?'); updateParams.push(data.name); }
        if (data.icon !== undefined) { updateFields.push('icon = ?'); updateParams.push(data.icon); }
        if (data.colorFrom !== undefined) { updateFields.push('color_from = ?'); updateParams.push(data.colorFrom); }
        if (data.colorTo !== undefined) { updateFields.push('color_to = ?'); updateParams.push(data.colorTo); }
        if (data.description !== undefined) { updateFields.push('description = ?'); updateParams.push(data.description); }
        if (data.sortOrder !== undefined) { updateFields.push('sort_order = ?'); updateParams.push(data.sortOrder); }
        if (data.status !== undefined) { updateFields.push('status = ?'); updateParams.push(data.status); }

        updateFields.push('updated_at = NOW()');
        updateParams.push(parseInt(id, 10));

        if (updateFields.length === 1) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        const updateQuery = `UPDATE supplier_categories SET ${updateFields.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, updateParams);

        await queryRunner.commitTransaction();

        // Buscar categoria atualizada
        const selectQuery = `
          SELECT 
            id, uuid, code, name, icon, color_from as colorFrom, color_to as colorTo,
            description, sort_order as sortOrder, status,
            created_at as createdAt, updated_at as updatedAt
          FROM supplier_categories
          WHERE id = ?
        `;

        const updatedCategory = await queryRunner.query(selectQuery, [parseInt(id, 10)]);
        await queryRunner.release();

        const row = updatedCategory[0];
        const categoryResponse: SupplierCategoryResponse = {
          id: row.id,
          uuid: row.uuid,
          code: row.code,
          name: row.name,
          icon: row.icon,
          colorFrom: row.colorFrom,
          colorTo: row.colorTo,
          description: row.description,
          sortOrder: row.sortOrder,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };

        res.json({
          success: true,
          data: categoryResponse,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      await queryRunner.connect();

      try {
        // Verificar se a categoria existe
        const checkQuery = `SELECT id, name FROM supplier_categories WHERE id = ?`;
        const existing = await queryRunner.query(checkQuery, [parseInt(id, 10)]);

        if (existing.length === 0) {
          throw new AppError('Categoria não encontrada', 404);
        }

        // Verificar se há fornecedores usando esta categoria
        // Primeiro verificar se a coluna category_id existe na tabela suppliers
        let hasCategoryIdColumn = false;
        try {
          const columnCheck = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'suppliers' 
            AND COLUMN_NAME = 'category_id'
          `);
          hasCategoryIdColumn = columnCheck && columnCheck[0] && columnCheck[0].count > 0;
        } catch (error) {
          // Se der erro ao verificar, assume que não existe
          hasCategoryIdColumn = false;
        }

        if (hasCategoryIdColumn) {
          // Usar category_id (nova estrutura)
          try {
            const suppliersUsing = await queryRunner.query(
              `SELECT COUNT(*) as count FROM suppliers WHERE category_id = ?`,
              [parseInt(id, 10)]
            );

            if (suppliersUsing && suppliersUsing[0] && suppliersUsing[0].count > 0) {
              throw new AppError('Não é possível excluir categoria que está sendo usada por fornecedores', 400);
            }
          } catch (error: any) {
            // Se der erro (coluna não existe), tenta a estrutura antiga
            if (error.message && error.message.includes("Unknown column 'category_id'")) {
              hasCategoryIdColumn = false;
            } else {
              throw error;
            }
          }
        }

        if (!hasCategoryIdColumn) {
          // Tentar verificar usando a coluna antiga category (ENUM) se existir
          try {
            const categoryCodeCheck = await queryRunner.query(`
              SELECT COUNT(*) as count 
              FROM information_schema.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'suppliers' 
              AND COLUMN_NAME = 'category'
            `);

            const hasCategoryColumn = categoryCodeCheck && categoryCodeCheck[0] && categoryCodeCheck[0].count > 0;

            if (hasCategoryColumn) {
              // Buscar o código da categoria
              const categoryData = await queryRunner.query(
                `SELECT code FROM supplier_categories WHERE id = ?`,
                [parseInt(id, 10)]
              );

              if (categoryData.length > 0 && categoryData[0].code) {
                const suppliersUsing = await queryRunner.query(
                  `SELECT COUNT(*) as count FROM suppliers WHERE category = ?`,
                  [categoryData[0].code]
                );

                if (suppliersUsing && suppliersUsing[0] && suppliersUsing[0].count > 0) {
                  throw new AppError('Não é possível excluir categoria que está sendo usada por fornecedores', 400);
                }
              }
            }
            // Se nenhuma das colunas existir, permite a exclusão (tabela ainda não migrada)
          } catch (error: any) {
            // Se der erro ao verificar, assume que não há fornecedores usando e permite exclusão
            // Não re-lança o erro, apenas permite a exclusão
            console.warn('Erro ao verificar fornecedores usando categoria:', error.message);
          }
        }

        const deleteQuery = `DELETE FROM supplier_categories WHERE id = ?`;
        await queryRunner.query(deleteQuery, [parseInt(id, 10)]);

        await queryRunner.release();

        res.json({
          success: true,
          message: 'Categoria excluída com sucesso',
        });
      } catch (error) {
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
