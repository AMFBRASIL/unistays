import { Router } from 'express';
import { GuestAuthController } from '../controllers/GuestAuthController';
import { guestAuthMiddleware } from '../middleware/guestAuth';

const router = Router();
const guestAuthController = new GuestAuthController();

// Public routes
router.post('/register', (req, res) => guestAuthController.register(req, res));
router.post('/login', (req, res) => guestAuthController.login(req, res));
router.post('/login/reservation', (req, res) => guestAuthController.loginWithReservation(req, res));

// Protected routes (require guest authentication)
router.get('/profile', guestAuthMiddleware, (req, res) => guestAuthController.getProfile(req, res));

export default router;
