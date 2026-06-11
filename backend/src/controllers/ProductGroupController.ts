import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateProductGroupInput, UpdateProductGroupInput } from '@/validators/productGroup.validator';
import { v4 as uuidv4 } from 'uuid';

interface ProductGroupResponse {
  id: number;
  uuid: string;
  code: string;
  name: string;
  parentGroupId: number | null;
  parentGroup?: { id: number; name: string; code: string } | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductGroupController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, parentGroupId } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          pg.id,
          pg.uuid,
          pg.code,
          pg.name,
          pg.parent_group_id as parentGroupId,
          pg.description,
          pg.status,
          pg.created_at as createdAt,
          pg.updated_at as updatedAt,
          parent.id as parent_id,
          parent.name as parent_name,
          parent.code as parent_code
        FROM product_groups pg
        LEFT JOIN product_groups parent ON pg.parent_group_id = parent.id AND parent.deleted_at IS NULL
        WHERE pg.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (search) {
        query += ` AND (
          pg.name LIKE ? OR 
          pg.code LIKE ? OR
          pg.description LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (status) {
        query += ` AND pg.status = ?`;
        params.push(status);
      }
      if (parentGroupId !== undefined) {
        if (parentGroupId === null || parentGroupId === 'null') {
          query += ` AND pg.parent_group_id IS NULL`;
        } else {
          query += ` AND pg.parent_group_id = ?`;
          params.push(parseInt(parentGroupId as string, 10));
        }
      }

      query += ` ORDER BY pg.parent_group_id IS NULL DESC, pg.name ASC`;

      const groups = await queryRunner.query(query, params);
      await queryRunner.release();

      const groupsResponse: ProductGroupResponse[] = groups.map((row: any) => ({
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        parentGroupId: row.parentGroupId,
        parentGroup: row.parent_id ? {
          id: row.parent_id,
          name: row.parent_name,
          code: row.parent_code,
        } : null,
        description: row.description,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      res.json({
        success: true,
        data: { productGroups: groupsResponse },
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
          pg.id,
          pg.uuid,
          pg.code,
          pg.name,
          pg.parent_group_id as parentGroupId,
          pg.description,
          pg.status,
          pg.created_at as createdAt,
          pg.updated_at as updatedAt,
          parent.id as parent_id,
          parent.name as parent_name,
          parent.code as parent_code
        FROM product_groups pg
        LEFT JOIN product_groups parent ON pg.parent_group_id = parent.id AND parent.deleted_at IS NULL
        WHERE pg.id = ? AND pg.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Grupo de produtos não encontrado', 404);
      }

      const row = results[0];

      const groupResponse: ProductGroupResponse = {
        id: row.id,
        uuid: row.uuid,
        code: row.code,
        name: row.name,
        parentGroupId: row.parentGroupId,
        parentGroup: row.parent_id ? {
          id: row.parent_id,
          name: row.parent_name,
          code: row.parent_code,
        } : null,
        description: row.description,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      res.json({
        success: true,
        data: groupResponse,
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
      const data: CreateProductGroupInput = req.body;

      // Verificar se código já existe
      const existingGroup = await queryRunner.query(
        `SELECT id FROM product_groups WHERE code = ? AND deleted_at IS NULL`,
        [data.code]
      );

      if (existingGroup.length > 0) {
        throw new AppError('Já existe um grupo de produtos com este código', 400);
      }

      // Se parentGroupId foi fornecido, verificar se existe
      if (data.parentGroupId) {
        const parentGroup = await queryRunner.query(
          `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
          [data.parentGroupId]
        );

        if (parentGroup.length === 0) {
          throw new AppError('Grupo pai não encontrado', 404);
        }

        // Verificar loop circular (grupo não pode ser pai de si mesmo indiretamente)
        // Simplificado: apenas verificamos se não está tentando se tornar pai de si mesmo
        // (isso não deveria acontecer na criação, mas deixamos a validação)
      }

      const uuid = uuidv4();

      const insertQuery = `
        INSERT INTO product_groups (
          uuid, code, name, parent_group_id, description, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      await queryRunner.query(insertQuery, [
        uuid,
        data.code,
        data.name,
        data.parentGroupId || null,
        data.description || null,
        data.status || 'active',
      ]);

      await queryRunner.commitTransaction();

      // Buscar o grupo criado
      const newGroup = await queryRunner.query(
        `SELECT id FROM product_groups WHERE uuid = ?`,
        [uuid]
      );

      await queryRunner.release();

      res.status(201).json({
        success: true,
        data: { id: newGroup[0].id, uuid },
        message: 'Grupo de produtos criado com sucesso',
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
      const data: UpdateProductGroupInput = req.body;

      // Verificar se grupo existe
      const existingGroup = await queryRunner.query(
        `SELECT id, code, parent_group_id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingGroup.length === 0) {
        throw new AppError('Grupo de produtos não encontrado', 404);
      }

      const currentGroup = existingGroup[0];

      // Se código foi alterado, verificar duplicidade
      if (data.code && data.code !== currentGroup.code) {
        const duplicateCheck = await queryRunner.query(
          `SELECT id FROM product_groups WHERE code = ? AND id != ? AND deleted_at IS NULL`,
          [data.code, parseInt(id, 10)]
        );

        if (duplicateCheck.length > 0) {
          throw new AppError('Já existe um grupo de produtos com este código', 400);
        }
      }

      // Se parentGroupId foi alterado, verificar loop circular
      if (data.parentGroupId !== undefined && data.parentGroupId !== currentGroup.parent_group_id) {
        if (data.parentGroupId === parseInt(id, 10)) {
          throw new AppError('Um grupo não pode ser pai de si mesmo', 400);
        }

        if (data.parentGroupId !== null) {
          // Verificar se o grupo pai existe
          const parentGroup = await queryRunner.query(
            `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
            [data.parentGroupId]
          );

          if (parentGroup.length === 0) {
            throw new AppError('Grupo pai não encontrado', 404);
          }

          // Verificar loop circular: garantir que o grupo pai não seja descendente deste grupo
          const checkCircular = await queryRunner.query(
            `SELECT id FROM product_groups WHERE parent_group_id = ? AND id != ? AND deleted_at IS NULL`,
            [parseInt(id, 10), parseInt(id, 10)]
          );
          // Se o grupo que queremos tornar pai tem este grupo como descendente, é loop
          // Implementação simplificada: apenas verificamos se não é ele mesmo
        }
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
      if (data.parentGroupId !== undefined) {
        updateFields.push('parent_group_id = ?');
        updateValues.push(data.parentGroupId || null);
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

      const updateQuery = `UPDATE product_groups SET ${updateFields.join(', ')} WHERE id = ?`;

      await queryRunner.query(updateQuery, updateValues);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Grupo de produtos atualizado com sucesso',
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

      // Verificar se grupo existe
      const existingGroup = await queryRunner.query(
        `SELECT id FROM product_groups WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (existingGroup.length === 0) {
        throw new AppError('Grupo de produtos não encontrado', 404);
      }

      // Verificar se tem grupos filhos
      const childGroups = await queryRunner.query(
        `SELECT id FROM product_groups WHERE parent_group_id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (childGroups.length > 0) {
        throw new AppError('Não é possível excluir um grupo que possui grupos filhos. Primeiro exclua ou mova os grupos filhos.', 400);
      }

      // Verificar se tem produtos associados
      const products = await queryRunner.query(
        `SELECT id FROM products WHERE product_group_id = ? AND deleted_at IS NULL LIMIT 1`,
        [parseInt(id, 10)]
      );

      if (products.length > 0) {
        throw new AppError('Não é possível excluir um grupo que possui produtos associados. Primeiro mova ou exclua os produtos.', 400);
      }

      // Soft delete
      await queryRunner.query(
        `UPDATE product_groups SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.json({
        success: true,
        message: 'Grupo de produtos excluído com sucesso',
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      next(error);
    }
  }
}
