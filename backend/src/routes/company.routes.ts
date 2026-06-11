import { Router } from 'express';
import { CompanyController } from '@/controllers/CompanyController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { createCompanySchema, updateCompanySchema } from '@/validators/company.validator';

const router = Router();
const companyController = new CompanyController();

router.use(authenticate);

router.get('/', companyController.getAll);
router.get('/:id', companyController.getById);
router.post('/', authorize('super_admin', 'admin', 'manager'), validate(createCompanySchema), companyController.create);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validate(updateCompanySchema), companyController.update);
router.delete('/:id', authorize('super_admin', 'admin'), companyController.delete);

export default router;
