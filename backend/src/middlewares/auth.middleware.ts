import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppDataSource } from '@/config/database';
import { User, UserStatus } from '@/entities/User.entity';

export interface AuthRequest extends Request {
  user?: User;
  userId?: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth Middleware: Token não fornecido');
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    console.log('Auth Middleware: Decoded token', decoded);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId, status: UserStatus.ACTIVE },
      relations: ['group'],
    });

    if (!user) {
      console.log('Auth Middleware: Usuário não encontrado ou inativo', decoded.userId);
      res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      return;
    }

    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado' });
      return;
    }
    res.status(500).json({ error: 'Erro na autenticação' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    // Verificação baseada no nome do Grupo (antigo role)
    const userGroupName = req.user.group?.name || '';
    // Mapeamento de compatibilidade se necessário, ou validação direta
    // assumindo que os nomes passados para 'authorize' combinam com nomes de Grupos

    // Simplificação: Verifica se o nome do grupo está na lista de 'roles' permitidos
    // Nota: Isso pode precisar de um mapa de tradução se os nomes forem diferentes (ex: 'admin' vs 'Administrador')

    // Mapeamento simples para manter compatibilidade com código legado que chama authorize('admin')
    const normalizedGroupName = userGroupName.toLowerCase();
    const hasPermission = roles.some(role => {
      const r = role.toLowerCase();
      if (r === 'super_admin' && normalizedGroupName.includes('super')) return true;
      if (r === 'admin' && normalizedGroupName.includes('admin')) return true;
      if (r === 'manager' && normalizedGroupName.includes('gerente')) return true;
      if (r === 'receptionist' && normalizedGroupName.includes('recep')) return true;
      if (r === 'viewer' && normalizedGroupName.includes('visu')) return true; // Visualizador
      return normalizedGroupName === r;
    });

    if (!hasPermission) {
      console.log(`[AUTH MSG] Access Denied: User Group '${userGroupName}' (ID: ${req.user.id}) is not in allowed roles: [${roles.join(', ')}]`);
      res.status(403).json({ error: `Acesso negado. Seu perfil (${userGroupName}) não tem permissão.` });
      return;
    }

    next();
  };
};
