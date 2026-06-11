import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { PmsEmailTemplate } from '@/entities/PmsEmailTemplate.entity';
import { EmailTemplateCategory } from '@/entities/EmailTemplateCategory.entity';
import { EmailVariableGroup } from '@/entities/EmailVariableGroup.entity';
import { EmailVariable } from '@/entities/EmailVariable.entity';
import { AppError } from '@/middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class PmsEmailTemplateController {
  /** Lista categorias de templates com contagem de templates */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(EmailTemplateCategory);
      const templateRepo = AppDataSource.getRepository(PmsEmailTemplate);
      const categories = await repo.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', name: 'ASC' },
      });
      const withCount = await Promise.all(
        categories.map(async (c) => {
          const templateCount = await templateRepo.count({ where: { categoryId: c.id } });
          return { ...c, templateCount };
        })
      );
      res.json({ success: true, data: { categories: withCount } });
    } catch (error) {
      next(error);
    }
  }

  /** Cria categoria de template */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(EmailTemplateCategory);
      const body = req.body as Record<string, unknown>;
      const category = repo.create({
        id: uuidv4(),
        name: (body.name as string)?.trim() || '',
        description: (body.description as string)?.trim() || null,
        icon: (body.icon as string) || 'Mail',
        color: (body.color as string) || 'text-blue-400',
        bgColor: (body.bg_color as string) || (body.bgColor as string) || 'bg-blue-500/10',
        sortOrder: typeof body.sort_order === 'number' ? body.sort_order : (body.sortOrder as number) ?? 0,
        isActive: body.isActive !== false,
      });
      await repo.save(category);
      res.status(201).json({
        success: true,
        data: { category: { ...category, templateCount: 0 } },
        message: 'Categoria criada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /** Atualiza categoria de template */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(EmailTemplateCategory);
      const category = await repo.findOne({ where: { id } });
      if (!category) throw new AppError('Categoria não encontrada', 404);
      const body = req.body as Record<string, unknown>;
      if (body.name != null) category.name = (body.name as string)?.trim() ?? category.name;
      if (body.description !== undefined) category.description = (body.description as string)?.trim() || null;
      if (body.icon != null) category.icon = (body.icon as string) || category.icon;
      if (body.color != null) category.color = (body.color as string) || category.color;
      if (body.bg_color != null) category.bgColor = body.bg_color as string;
      if (body.bgColor != null) category.bgColor = body.bgColor as string;
      if (typeof body.sort_order === 'number') category.sortOrder = body.sort_order;
      if (body.sortOrder !== undefined && typeof body.sortOrder === 'number') category.sortOrder = body.sortOrder;
      if (typeof body.isActive === 'boolean') category.isActive = body.isActive;
      await repo.save(category);
      const templateCount = await AppDataSource.getRepository(PmsEmailTemplate).count({ where: { categoryId: id } });
      res.json({
        success: true,
        data: { category: { ...category, templateCount } },
        message: 'Categoria atualizada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /** Remove categoria (apenas se não tiver templates) */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(EmailTemplateCategory);
      const category = await repo.findOne({ where: { id } });
      if (!category) throw new AppError('Categoria não encontrada', 404);
      const count = await AppDataSource.getRepository(PmsEmailTemplate).count({ where: { categoryId: id } });
      if (count > 0) throw new AppError('Não é possível excluir categoria com templates vinculados', 400);
      await repo.remove(category);
      res.json({ success: true, message: 'Categoria removida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  /** Lista grupos de variáveis com suas variáveis */
  async getVariableGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(EmailVariableGroup);
      const groups = await repo.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', name: 'ASC' },
        relations: ['variables'],
      });
      const variables = groups.map((g) => ({
        group: g.name,
        groupId: g.id,
        variables: (g.variables || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((v) => ({ key: v.variableKey, label: v.label, sampleValue: v.sampleValue })),
      }));
      res.json({ success: true, data: { variableGroups: groups, variables } });
    } catch (error) {
      next(error);
    }
  }

  /** Lista todos os templates (com categoria); filtro opcional por categoryId */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const repo = AppDataSource.getRepository(PmsEmailTemplate);
      const qb = repo.createQueryBuilder('t').leftJoinAndSelect('t.category', 'c').orderBy('t.name', 'ASC');
      if (categoryId) qb.andWhere('t.categoryId = :categoryId', { categoryId });
      const templates = await qb.getMany();
      res.json({ success: true, data: { templates } });
    } catch (error) {
      next(error);
    }
  }

  /** Busca um template por id (uuid) */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PmsEmailTemplate);
      const template = await repo.findOne({
        where: { id },
        relations: ['category'],
      });
      if (!template) throw new AppError('Template não encontrado', 404);
      res.json({ success: true, data: { template } });
    } catch (error) {
      next(error);
    }
  }

  /** Cria template */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(PmsEmailTemplate);
      const body = req.body as Record<string, unknown>;
      const template = repo.create({
        id: uuidv4(),
        name: body.name as string,
        description: (body.description as string) || null,
        subject: body.subject as string,
        categoryId: body.categoryId as string,
        contentHtml: body.contentHtml as string,
        contentText: (body.contentText as string) || null,
        previewText: (body.previewText as string) || null,
        fromName: (body.fromName as string) || null,
        fromEmail: (body.fromEmail as string) || null,
        replyTo: (body.replyTo as string) || null,
        isSystem: !!body.isSystem,
        isActive: body.isActive !== false,
        isDefault: !!body.isDefault,
      });
      await repo.save(template);
      const saved = await repo.findOne({ where: { id: template.id }, relations: ['category'] });
      res.status(201).json({
        success: true,
        data: { template: saved || template },
        message: 'Template criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /** Atualiza template */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PmsEmailTemplate);
      const template = await repo.findOne({ where: { id }, relations: ['category'] });
      if (!template) throw new AppError('Template não encontrado', 404);
      const body = req.body as Record<string, unknown>;
      if (body.name != null) template.name = body.name as string;
      if (body.description !== undefined) template.description = (body.description as string) || null;
      if (body.subject != null) template.subject = body.subject as string;
      if (body.categoryId != null) template.categoryId = body.categoryId as string;
      if (body.contentHtml != null) template.contentHtml = body.contentHtml as string;
      if (body.contentText !== undefined) template.contentText = (body.contentText as string) || null;
      if (body.previewText !== undefined) template.previewText = (body.previewText as string) || null;
      if (body.fromName !== undefined) template.fromName = (body.fromName as string) || null;
      if (body.fromEmail !== undefined) template.fromEmail = (body.fromEmail as string) || null;
      if (body.replyTo !== undefined) template.replyTo = (body.replyTo as string) || null;
      if (typeof body.isActive === 'boolean') template.isActive = body.isActive;
      if (typeof body.isDefault === 'boolean') template.isDefault = body.isDefault;
      await repo.save(template);
      const updated = await repo.findOne({ where: { id }, relations: ['category'] });
      res.json({
        success: true,
        data: { template: updated || template },
        message: 'Template atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /** Remove template (hard delete; novo schema não tem deleted_at) */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(PmsEmailTemplate);
      const template = await repo.findOne({ where: { id } });
      if (!template) throw new AppError('Template não encontrado', 404);
      await repo.remove(template);
      res.json({ success: true, message: 'Template removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}
