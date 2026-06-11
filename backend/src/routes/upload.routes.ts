import { Router } from 'express';
import { UploadController, upload, uploadCertificate } from '@/controllers/UploadController';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

router.use(authenticate);

// Upload de uma única imagem
router.post('/image', authorize('super_admin', 'admin', 'manager'), upload.single('image') as any, (req, res, next) => uploadController.uploadImage(req as any, res, next));

// Upload de múltiplas imagens
router.post('/images', authorize('super_admin', 'admin', 'manager'), upload.array('images', 10) as any, (req, res, next) => uploadController.uploadMultipleImages(req as any, res, next));

// Upload de certificado digital
router.post('/certificate', authorize('super_admin', 'admin', 'manager'), uploadCertificate.single('certificate') as any, (req, res, next) => uploadController.uploadCertificate(req as any, res, next));

// Deletar imagem
router.delete('/image', authorize('super_admin', 'admin', 'manager'), (req, res, next) => uploadController.deleteImage(req, res, next));

export default router;
