import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

const JWT_SECRET = env.JWT_SECRET;

interface GuestTokenPayload {
    guestId?: number;
    id?: number;
    email?: string;
    type: string;
}

export const guestAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token não fornecido' }
            });
        }

        const [, token] = authHeader.split(' ');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token inválido' }
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as GuestTokenPayload;

        if (decoded.type !== 'guest') {
            return res.status(401).json({
                success: false,
                error: { message: 'Token inválido para hóspede' }
            });
        }

        const gid = decoded.guestId ?? decoded.id;
        if (gid == null) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token inválido para hóspede' }
            });
        }
        (req as any).guestId = gid;
        (req as any).guestEmail = decoded.email;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { message: 'Token inválido ou expirado' }
        });
    }
};
