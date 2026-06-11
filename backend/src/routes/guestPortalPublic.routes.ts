import { Router } from 'express';
import { GuestController } from '@/controllers/GuestController';

/**
 * Rotas públicas do portal do hóspede — sem authenticate (staff) nem token.
 * Prefixo: /api/v1/guests/public
 * Evita conflito com router.use(authenticate) em guest.routes.ts
 */
const router = Router();
const guestController = new GuestController();

router.post('/request-password-email', guestController.requestGuestPasswordResetEmail);
router.post('/reset-password-with-token', guestController.resetGuestPasswordWithToken);

export default router;
