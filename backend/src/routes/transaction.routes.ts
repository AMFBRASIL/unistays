import { Router } from 'express';
import multer from 'multer';
import { TransactionController } from '@/controllers/TransactionController';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from '@/validators/transaction.validator';

const router = Router();
const transactionController = new TransactionController();
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const upload = multer({ dest: isVercel ? '/tmp/uploads/temp' : 'uploads/temp' });

router.use(authenticate);

router.get('/', (req, res, next) => transactionController.getAll(req, res, next));
router.get('/stats', (req, res, next) => transactionController.getStats(req, res, next));
router.get('/:id', (req, res, next) => transactionController.getById(req, res, next));
router.post('/', validate(createTransactionSchema), (req, res, next) => transactionController.create(req, res, next));
router.post('/upload-attachments', upload.array('files', 10) as any, (req, res, next) => transactionController.uploadAttachments(req as any, res, next));
router.put('/:id', validate(updateTransactionSchema), (req, res, next) => transactionController.update(req, res, next));
router.delete('/:id', (req, res, next) => transactionController.delete(req, res, next));

export default router;
