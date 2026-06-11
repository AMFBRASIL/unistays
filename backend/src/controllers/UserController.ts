import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { User, UserStatus } from '@/entities/User.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { hashPassword } from '@/utils/bcrypt';
import { CreateUserInput } from '@/validators/user.validator';
import { IsNull, In } from 'typeorm';
import { UserGroup } from '@/entities/UserGroup.entity';
import { Property } from '@/entities/Property.entity';
import { EmailService } from '@/services/EmailService';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone, avatar, status, groupId }: CreateUserInput & { groupId?: number, avatar?: string } = req.body;

      const userRepository = AppDataSource.getRepository(User);

      // Verificar se o email já existe
      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      // Hash da senha
      const hashedPassword = await hashPassword(password);

      // Criar usuário
      const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        avatar: avatar || null,
        // role is deprecated/removed, handled by group
        status: (status as UserStatus) || UserStatus.ACTIVE,
      });

      // Assign Group (Cardinality: ManyToOne)
      if (groupId) {
        const groupRepository = AppDataSource.getRepository(UserGroup);
        const group = await groupRepository.findOne({ where: { id: groupId } });
        if (group) {
          user.group = group;
        }
      }

      // Assign Properties
      if (req.body.propertyIds && Array.isArray(req.body.propertyIds)) {
        const propertyRepository = AppDataSource.getRepository(Property);
        const properties = await propertyRepository.findBy({
          id: In(req.body.propertyIds)
        });
        user.properties = properties;
      }

      await userRepository.save(user);

      // Retornar dados do usuário (sem senha)
      const userResponse = {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        group: user.group,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
        },
        message: 'Usuário criado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      let permissions: any = {};

      if (req.user.group) {
        const granularPermissions = await AppDataSource.query(`
          SELECT 
            p.route as module, 
            gpp.can_read, gpp.can_create as can_write, gpp.can_update, gpp.can_delete
          FROM pages p
          LEFT JOIN group_page_permissions gpp ON gpp.page_id = p.id AND gpp.group_id = ?
        `, [req.user.group.id]);

        granularPermissions.forEach((perm: any) => {
          const key = perm.module ? perm.module.replace(/^\//, '').replace(/\//g, '_') : 'dashboard';
          permissions[key] = {
            read: !!perm.can_read,
            write: !!perm.can_write,
            update: !!perm.can_update,
            delete: !!perm.can_delete
          };
        });

        // Use legacy permissions if granular ones are empty (backward compatibility)
        if (Object.keys(permissions).length === 0 && req.user.group.permissions) {
          permissions = req.user.group.permissions;
        }
      }

      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            uuid: req.user.uuid,
            email: req.user.email,
            name: req.user.name,
            phone: req.user.phone,
            avatar: req.user.avatar,
            // role: req.user.role, 
            group: req.user.group,
            status: req.user.status,
            emailVerified: req.user.emailVerified,
            twoFactorEnabled: req.user.twoFactorEnabled,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt,
            permissions: permissions,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const userRepository = AppDataSource.getRepository(User);
      const { name, phone, avatar } = req.body;

      req.user.name = name || req.user.name;
      req.user.phone = phone !== undefined ? phone : req.user.phone;
      req.user.avatar = avatar !== undefined ? avatar : req.user.avatar;

      await userRepository.save(req.user);

      res.json({
        success: true,
        data: {
          user: req.user,
        },
        message: 'Perfil atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      // Usar query builder para garantir mapeamento correto
      const users = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.group', 'group')
        .where('user.deletedAt IS NULL')
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      // Mapear para o formato de resposta (sem senha)
      const usersResponse = users.map(user => ({
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        group: user.group, // Return full group object
        status: user.status,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      res.json({
        success: true,
        data: { users: usersResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: parseInt(id), deletedAt: IsNull() },
        relations: ['group'],
        select: ['id', 'uuid', 'email', 'name', 'phone', 'status', 'createdAt'], // Removed 'role'
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const { name, phone, groupId, status } = req.body;

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (status) user.status = status;

      if (groupId) {
        const groupRepository = AppDataSource.getRepository(UserGroup);
        const group = await groupRepository.findOne({ where: { id: groupId } });
        if (group) user.group = group;
      }

      await userRepository.save(user);

      res.json({
        success: true,
        data: { user },
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 6) {
        throw new AppError('A senha deve ter pelo menos 6 caracteres', 400);
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
      await userRepository.save(user);

      res.json({
        success: true,
        message: 'Senha resetada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { subject, body } = req.body;

      if (!subject || !body) {
        throw new AppError('Assunto e conteúdo do email são obrigatórios', 400);
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['group', 'properties']
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      // Determine property ID context if applicable, or pass null
      const propertyId = user.properties && user.properties.length > 0 ? user.properties[0].id : null;

      await EmailService.sendEmail(
        user.email,
        subject,
        body,
        undefined, // Plain text fallback
        propertyId
      );

      res.json({
        success: true,
        message: 'Email enviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await userRepository.softRemove(user);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
