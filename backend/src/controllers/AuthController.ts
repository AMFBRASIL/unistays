import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { User, UserStatus } from '@/entities/User.entity';
import { hashPassword, comparePassword } from '@/utils/bcrypt';
import { generateToken, generateRefreshToken } from '@/utils/jwt';
import { AppError } from '@/middlewares/error.middleware';
import { RegisterInput, LoginInput } from '@/validators/auth.validator';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone }: RegisterInput = req.body;

      const userRepository = AppDataSource.getRepository(User);

      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email já cadastrado', 400);
      }

      const hashedPassword = await hashPassword(password);

      const user = userRepository.create({
        email,
        password: hashedPassword,
        name,
        phone,
        status: UserStatus.ACTIVE,
      });

      await userRepository.save(user);

      // Recarregar com group e properties (igual ao login)
      const fullUser = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.group', 'group')
        .leftJoinAndSelect('user.properties', 'properties')
        .where('user.id = :id', { id: user.id })
        .getOne();

      // Permissões granulares do grupo
      let permissions: Record<string, { read: boolean; write: boolean; update: boolean; delete: boolean }> = {};
      if (fullUser?.group) {
        const granularPermissions = await AppDataSource.query(`
          SELECT 
            p.route as module, 
            gpp.can_read, gpp.can_create as can_write, gpp.can_update, gpp.can_delete
          FROM pages p
          LEFT JOIN group_page_permissions gpp ON gpp.page_id = p.id AND gpp.group_id = ?
        `, [fullUser.group.id]);

        granularPermissions.forEach((perm: any) => {
          const key = perm.module ? perm.module.replace(/^\//, '').replace(/\//g, '_') : 'dashboard';
          permissions[key] = {
            read: !!perm.can_read,
            write: !!perm.can_write,
            update: !!perm.can_update,
            delete: !!perm.can_delete,
          };
        });

        if (Object.keys(permissions).length === 0 && fullUser.group.permissions) {
          permissions = fullUser.group.permissions as typeof permissions;
        }
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            uuid: user.uuid ?? fullUser?.uuid,
            email: user.email,
            name: user.name,
            avatar: user.avatar ?? null,
            group: fullUser?.group ?? null,
            properties: fullUser?.properties ?? [],
            permissions,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.group', 'group')
        .leftJoinAndSelect('user.properties', 'properties')
        .where('user.email = :email', { email })
        .andWhere('user.deletedAt IS NULL')
        .getOne();

      if (!user) {
        throw new AppError('Credenciais inválidas', 401);
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new AppError('Conta inativa ou suspensa', 403);
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Credenciais inválidas', 401);
      }

      // Atualizar last_login usando SQL direto
      await userRepository
        .createQueryBuilder()
        .update(User)
        .set({ lastLogin: () => 'NOW()' } as any)
        .where('id = :id', { id: user.id })
        .execute();

      // Atualizar o objeto user localmente para uso posterior
      user.lastLogin = new Date();

      // Fetch Granular Permissions based on User Group
      let permissions: any = {};

      if (user.group) {
        const granularPermissions = await AppDataSource.query(`
          SELECT 
            p.route as module, 
            gpp.can_read, gpp.can_create as can_write, gpp.can_update, gpp.can_delete
          FROM pages p
          LEFT JOIN group_page_permissions gpp ON gpp.page_id = p.id AND gpp.group_id = ?
        `, [user.group.id]);

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
        if (Object.keys(permissions).length === 0 && user.group.permissions) {
          permissions = user.group.permissions;
        }
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        // role removed
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        // role removed
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            // role: user.role,
            avatar: user.avatar,

            group: user.group,
            properties: user.properties,
            permissions,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token não fornecido', 400);
      }

      // TODO: Implementar verificação de refresh token
      res.json({
        success: true,
        message: 'Token atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implementar invalidação de token
      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (user) {
        // TODO: Implementar envio de email de recuperação
      }

      res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções de recuperação',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      // TODO: Implementar reset de senha
      res.json({
        success: true,
        message: 'Senha redefinida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async validateDiscountPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body as { password?: string };
      const expected = process.env.RESERVATION_DISCOUNT_AUTH_PASSWORD?.trim();

      if (!expected) {
        throw new AppError('Senha de autorização de desconto não configurada no servidor', 503);
      }

      if (!password || password !== expected) {
        throw new AppError('Senha incorreta', 403);
      }

      res.json({
        success: true,
        data: { valid: true },
      });
    } catch (error) {
      next(error);
    }
  }
}
