import { Response, NextFunction } from 'express';
import { IsNull } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { FinancialCategory, FinancialCategoryType } from '@/entities/FinancialCategory.entity';
import { CreateFinancialCategoryInput, UpdateFinancialCategoryInput } from '@/validators/financialCategory.validator';

export class FinancialCategoryController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, isActive } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        let sql = `SELECT id, uuid, name, type, icon, color, sort_order as sortOrder, is_active as isActive, created_at as createdAt, updated_at as updatedAt 
                   FROM financial_categories WHERE deleted_at IS NULL`;
        const params: (string | boolean)[] = [];

        if (type === 'income' || type === 'expense') {
          sql += ` AND type = ?`;
          params.push(type as string);
        }
        if (isActive !== undefined) {
          sql += ` AND is_active = ?`;
          params.push(isActive === 'true');
        }
        sql += ` ORDER BY type ASC, sort_order ASC, name ASC`;

        const rows = await queryRunner.query(sql, params);

        const categories = (rows as Record<string, unknown>[]).map((row) => ({
          id: row.id,
          uuid: row.uuid,
          name: row.name,
          type: row.type,
          icon: row.icon || 'DollarSign',
          color: row.color || 'slate-500',
          sortOrder: row.sortOrder ?? row.sort_order ?? 0,
          isActive: row.isActive ?? row.is_active ?? true,
          createdAt: row.createdAt ?? row.created_at,
          updatedAt: row.updatedAt ?? row.updated_at,
        }));

        res.json({
          success: true,
          data: { categories },
        });
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(FinancialCategory);
      const category = await repo.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
      });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoria não encontrada' }) as any;
      }
      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateFinancialCategoryInput = req.body;
      const repo = AppDataSource.getRepository(FinancialCategory);

      const existing = await repo.findOne({
        where: { name: data.name, type: data.type as any, deletedAt: IsNull() },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Já existe uma categoria "${data.name}" para ${data.type === 'income' ? 'receita' : 'despesa'}`,
        }) as any;
      }

      const category = repo.create({
        name: data.name,
        type: data.type as FinancialCategoryType,
        icon: data.icon ?? 'DollarSign',
        color: data.color ?? 'slate-500',
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      });
      await repo.save(category);

      res.status(201).json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateFinancialCategoryInput = req.body;
      const repo = AppDataSource.getRepository(FinancialCategory);

      const category = await repo.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
      });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoria não encontrada' }) as any;
      }

      if (data.name !== undefined) category.name = data.name;
      if (data.type !== undefined) category.type = data.type as any;
      if (data.icon !== undefined) category.icon = data.icon;
      if (data.color !== undefined) category.color = data.color;
      if (data.sortOrder !== undefined) category.sortOrder = data.sortOrder;
      if (data.isActive !== undefined) category.isActive = data.isActive;

      await repo.save(category);

      res.json({
        success: true,
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(FinancialCategory);
      const category = await repo.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
      });
      if (!category) {
        return res.status(404).json({ success: false, message: 'Categoria não encontrada' }) as any;
      }
      category.deletedAt = new Date();
      await repo.save(category);
      res.json({ success: true, message: 'Categoria excluída' });
    } catch (error) {
      next(error);
    }
  }
}
