import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { AppDataSource } from '@/config/database';
import { Guest } from '@/entities/Guest.entity';

export interface GuestAuthRequest extends Request {
    guest?: Guest;
    guestId?: number;
}

export const authenticateGuest = async (
    req: GuestAuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token não fornecido' });
            return;
        }

        const token = authHeader.substring(7);

        // Verify token - assuming guest tokens have different payload or same secret
        // Note: It's good practice to use a different secret or issuer, but for simplicity we use existing JWT_SECRET
        const decoded = jwt.verify(token, env.JWT_SECRET) as { guestId: number; type: string };

        if (decoded.type !== 'guest') {
            res.status(401).json({ error: 'Token inválido para hóspede' });
            return;
        }

        const guestRepository = AppDataSource.getRepository(Guest);
        const guest = await guestRepository.findOne({
            where: { id: decoded.guestId },
        });

        if (!guest) {
            res.status(401).json({ error: 'Hóspede não encontrado' });
            return;
        }

        req.guest = guest;
        req.guestId = guest.id;

        next();
    } catch (error) {
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
