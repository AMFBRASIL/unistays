import { Router } from 'express';
import { SmtpConfigController } from '@/controllers/SmtpConfigController';

const router = Router();
const controller = new SmtpConfigController();

router.get('/current', (req, res, next) => controller.getCurrent(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.post('/:id/test', (req, res, next) => controller.test(req, res, next));

export default router;
