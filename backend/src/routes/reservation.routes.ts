import { Router } from 'express';
import { ReservationController } from '@/controllers/ReservationController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const reservationController = new ReservationController();

router.use(authenticate);

router.get('/', (req, res, next) => reservationController.getAll(req, res, next));
router.get('/availability', (req, res, next) => reservationController.getAvailability(req, res, next));
router.get('/:id', (req, res, next) => reservationController.getById(req, res, next));
router.get('/:id/contract-html', (req, res, next) => reservationController.getContractHtml(req, res, next));
router.post('/', authorize('super_admin', 'admin', 'manager', 'receptionist'), (req, res, next) => reservationController.create(req, res, next));
router.put('/:id', authorize('super_admin', 'admin', 'manager', 'receptionist'), (req, res, next) => reservationController.update(req, res, next));
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), (req, res, next) => reservationController.delete(req, res, next));
router.post('/:id/check-in', authorize('super_admin', 'admin', 'manager', 'receptionist'), (req, res, next) => reservationController.checkIn(req, res, next));
router.post('/:id/check-out', authorize('super_admin', 'admin', 'manager', 'receptionist'), (req, res, next) => reservationController.checkOut(req, res, next));
router.post('/:id/send-details', authorize('super_admin', 'admin', 'manager', 'receptionist'), (req, res, next) => reservationController.sendDetails(req, res, next));

export default router;
