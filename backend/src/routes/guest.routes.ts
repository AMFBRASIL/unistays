import { Router } from 'express';
import { GuestController } from '@/controllers/GuestController';
import { GuestAuthController } from '@/controllers/GuestAuthController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createGuestSchema, updateGuestSchema, addLoyaltyPointsSchema } from '@/validators/guest.validator';

import { authenticateGuest } from '@/middlewares/guestAuth.middleware';
import { webCheckinUpload } from '@/controllers/UploadController';

const router = Router();
const guestController = new GuestController();
const guestAuthController = new GuestAuthController();

// Guest Portal Routes (Public or Guest Auth)
router.post('/login', guestController.login);
// Guest portal registration (public) - precisa ser antes do router.use(authenticate)
router.post('/register', guestAuthController.register);
// Redefinição de senha por e-mail: use POST /guests/public/... (guestPortalPublic.routes — sem token staff)
router.get('/me', authenticateGuest, guestController.me);
router.get('/me/reservations', authenticateGuest, guestController.getReservations);
router.get('/me/requests', authenticateGuest, guestController.getServiceRequests);
router.post('/me/requests', authenticateGuest, guestController.createServiceRequest);
router.put('/me', authenticateGuest, guestController.updateMe);
router.get('/me/web-checkin/pix', authenticateGuest, guestController.getWebCheckinPix);
router.post(
  '/me/web-checkin/upload',
  authenticateGuest,
  webCheckinUpload.single('image') as any,
  guestController.uploadWebCheckinImage
);
router.post('/me/web-checkin', authenticateGuest, guestController.submitWebCheckin);

// Admin Routes (User Auth)
router.use(authenticate);

router.get('/', guestController.getAll);
router.get('/:id/loyalty-history', authorize('super_admin', 'admin', 'manager'), guestController.getLoyaltyHistory);
router.post('/:id/loyalty-points', authorize('super_admin', 'admin', 'manager'), validate(addLoyaltyPointsSchema), guestController.addLoyaltyPoints);
router.get('/:id', guestController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createGuestSchema), guestController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateGuestSchema), guestController.update);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), guestController.delete);

export default router;
