import { Router } from 'express';
import { InvoiceParamsController } from '@/controllers/InvoiceParamsController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createInvoiceParamsSchema, updateInvoiceParamsSchema } from '@/validators/invoiceParams.validator';

const router = Router();
const invoiceParamsController = new InvoiceParamsController();

router.use(authenticate);

router.get('/', invoiceParamsController.getCurrent.bind(invoiceParamsController));
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createInvoiceParamsSchema), invoiceParamsController.createOrUpdate.bind(invoiceParamsController));
router.put('/', authorize('super_admin', 'admin', 'manager'), validate(updateInvoiceParamsSchema), invoiceParamsController.createOrUpdate.bind(invoiceParamsController));

export default router;
