import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { UserGroup, GroupPermissions } from '@/entities/UserGroup.entity';
import { User } from '@/entities/User.entity';
import { AppError } from '@/middlewares/error.middleware';
import { IsNull } from 'typeorm';

export class UserGroupController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const groups = await groupRepository
        .createQueryBuilder('group')
        .where('group.deletedAt IS NULL')
        .leftJoinAndSelect('group.users', 'users')
        .orderBy('group.createdAt', 'DESC')
        .getMany();

      // Contar usuários por grupo
      const groupsWithCount = groups.map(group => ({
        id: group.id,
        uuid: group.uuid,
        name: group.name,
        description: group.description,
        permissions: group.permissions,
        userCount: group.users?.length || 0,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }));

      res.json({
        success: true,
        data: { groups: groupsWithCount },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const group = await groupRepository
        .createQueryBuilder('group')
        .where('group.id = :id', { id: parseInt(id) })
        .andWhere('group.deletedAt IS NULL')
        .leftJoinAndSelect('group.users', 'users')
        .getOne();

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      // Fetch granular permissions
      const granularPermissions = await AppDataSource.query(`
        SELECT 
          p.route as  module, -- mapping route/title to module key for frontend compatibility
          gpp.can_read, gpp.can_create as can_write, gpp.can_update, gpp.can_delete
        FROM pages p
        LEFT JOIN group_page_permissions gpp ON gpp.page_id = p.id AND gpp.group_id = ?
      `, [id]);

      // Transform to frontend format if needed, or send as is
      // Current frontend expects { [module: string]: { read: bool, ... } }
      const formattedPermissions: any = {};

      // We need to fetch ALL pages to ensure we send structure for all of them
      // The query above does a LEFT JOIN on pages, so it returns all pages. 
      // If gpp record is null, permissions are false.

      granularPermissions.forEach((perm: any) => {
        // Use route or a normalized key as the module key
        const key = perm.module.replace(/^\//, '').replace(/\//g, '_') || 'dashboard';

        formattedPermissions[key] = {
          read: !!perm.can_read,
          write: !!perm.can_write,
          update: !!perm.can_update,
          delete: !!perm.can_delete
        };
      });

      // Merge with legacy permissions if needed, or prefer granular
      const finalPermissions = Object.keys(formattedPermissions).length > 0
        ? formattedPermissions
        : group.permissions;

      res.json({
        success: true,
        data: {
          group: {
            ...group,
            permissions: finalPermissions
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ... create, update, delete methods remain mostly same, but 'permissions' field in Update might need check ...

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Create logic remains same for now, initially empty permissions or legacy JSON
    // We can enhance this later to init granular permissions
    try {
      const { name, description, permissions } = req.body;
      const groupRepository = AppDataSource.getRepository(UserGroup);

      if (!name) {
        throw new AppError('Nome do grupo é obrigatório', 400);
      }

      const existingGroup = await groupRepository.findOne({
        where: { name, deletedAt: IsNull() },
      });

      if (existingGroup) {
        throw new AppError('Já existe um grupo com esse nome', 400);
      }

      const group = groupRepository.create({
        name,
        description: description || null,
        permissions: permissions || {},
      });

      await groupRepository.save(group);

      res.status(201).json({
        success: true,
        data: { group },
        message: 'Grupo criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const group = await groupRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
      });

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      if (name) group.name = name;
      if (description !== undefined) group.description = description;
      // if (permissions) group.permissions = permissions; // Update legacy JSON too for backup

      await groupRepository.save(group);

      res.json({
        success: true,
        data: { group },
        message: 'Grupo atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const group = await groupRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      await groupRepository.softRemove(group);

      res.json({
        success: true,
        message: 'Grupo deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { permissions } = req.body; // Expects { [moduleKey]: { read: true, ... } }
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const group = await groupRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
      });

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      // Update Legacy JSON
      group.permissions = permissions || {};
      await groupRepository.save(group);

      // Update Granular Permissions
      // We need to map module Keys back to Page IDs.
      // Strategy: Fetch all pages, match key to route/title logic
      const pages = await AppDataSource.query('SELECT * FROM pages');

      for (const [key, perms] of Object.entries(permissions as Record<string, any>)) {
        // Find page where route matches key logic
        // Key logic from getById: route.replace(/^\//, '').replace(/\//g, '_')
        const page = pages.find((p: any) => {
          const pageKey = p.route.replace(/^\//, '').replace(/\//g, '_') || 'dashboard';
          return pageKey === key;
        });

        if (page) {
          const { read, write, update, delete: del } = perms;

          // Upsert
          await AppDataSource.query(`
                INSERT INTO group_page_permissions 
                (group_id, page_id, can_read, can_create, can_update, can_delete)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                can_read = VALUES(can_read),
                can_create = VALUES(can_create),
                can_update = VALUES(can_update),
                can_delete = VALUES(can_delete)
             `, [id, page.id, read, write, update, del]);
        }
      }

      res.json({
        success: true,
        data: { group },
        message: 'Permissões atualizadas com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async addUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const groupRepository = AppDataSource.getRepository(UserGroup);
      const userRepository = AppDataSource.getRepository(User);

      const group = await groupRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
        relations: ['users'],
      });

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      const user = await userRepository.findOne({
        where: { id: userId, deletedAt: IsNull() },
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Check if user is already in group
      const userExists = group.users.some(u => u.id === user.id);
      if (userExists) {
        throw new AppError('Usuário já está neste grupo', 400);
      }

      group.users.push(user);
      await groupRepository.save(group);

      res.json({
        success: true,
        message: 'Usuário adicionado ao grupo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId } = req.params;
      const groupRepository = AppDataSource.getRepository(UserGroup);

      const group = await groupRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
        relations: ['users'],
      });

      if (!group) {
        throw new AppError('Grupo não encontrado', 404);
      }

      group.users = group.users.filter(u => u.id !== parseInt(userId));
      await groupRepository.save(group);

      res.json({
        success: true,
        message: 'Usuário removido do grupo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
