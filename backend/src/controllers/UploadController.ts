import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { env } from '@/config/env';
import { StorageService } from '@/services/StorageService';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const writableUploadBasePath = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), env.UPLOAD_PATH);

// Configurar storage do multer (armazenamento temporário local)
// O StorageService decide onde o arquivo será realmente salvo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(writableUploadBasePath, 'temp');
    
    // Criar diretório temporário se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

// Filtro de arquivos para imagens
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, WEBP) são aceitas.', 400));
  }
};

// Filtro de arquivos para certificados digitais
const certificateFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pfx', '.p12', '.cer', '.pem', '.crt', '.key'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // Aceitar por extensão ou por mimetype
  const allowedMimes = [
    'application/x-pkcs12',
    'application/pkcs12',
    'application/x-x509-ca-cert',
    'application/x-x509-user-cert',
    'application/pkix-cert',
    'application/x-pem-file',
  ];
  
  if (allowedExtensions.includes(fileExt) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Apenas certificados digitais (.pfx, .p12, .cer, .pem, .crt) são aceitos.', 400));
  }
};

// Storage para certificados (armazenamento local permanente)
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(writableUploadBasePath, 'certificates');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Manter nome original mas adicionar UUID para evitar conflitos
    const name = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${name}_${uuidv4()}${ext}`;
    cb(null, uniqueSuffix);
  },
});

export const upload = multer({
  storage,
  fileFilter: fileFilter as any,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE, // 10MB por padrão
  },
});

/** Web check-in: imagens (documento/selfie) + PDF opcional para contrato assinado (?kind=signed_contract). */
const webCheckinFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (imageMimes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  const kind = String(req.query?.kind || '').toLowerCase();
  if (kind === 'signed_contract' && file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }
  cb(
    new AppError(
      'Tipo de arquivo não permitido. Use imagem (JPEG, PNG, WEBP) ou PDF para contrato assinado.',
      400
    )
  );
};

export const webCheckinUpload = multer({
  storage,
  fileFilter: webCheckinFileFilter as any,
  limits: {
    fileSize: env.UPLOAD_MAX_SIZE,
  },
});

export const uploadCertificate = multer({
  storage: certificateStorage,
  fileFilter: certificateFilter as any,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB para certificados
  },
});

export class UploadController {
  /**
   * Upload de uma única imagem
   * Usa o StorageService que consulta a configuração de armazenamento cadastrada
   */
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      console.log('[UploadController] Recebendo upload de imagem...');
      console.log('[UploadController] Chamando StorageService.uploadFile()');

      // Obter pasta do query parameter (padrão: 'units' para compatibilidade)
      const folder = (req.query.folder as string) || 'units';

      // Usar o serviço centralizado de armazenamento
      // O serviço automaticamente busca a configuração ativa/padrão da tabela storage_config
      const result = await StorageService.uploadFile(req.file, req, folder);
      
      console.log('[UploadController] StorageService retornou:', {
        url: result.url,
        fullUrl: result.fullUrl,
      });

      res.json({
        success: true,
        data: {
          url: result.url,
          fullUrl: result.fullUrl,
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
        },
        message: 'Imagem enviada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload de certificado digital
   * Armazena localmente na pasta uploads/certificates
   */
  async uploadCertificate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      console.log('[UploadController] Recebendo upload de certificado digital...');
      console.log('[UploadController] Arquivo:', req.file.originalname);

      // Retornar caminho relativo para salvar no banco
      // O caminho será relativo à pasta uploads
      const relativePath = path.join('certificates', req.file.filename).replace(/\\/g, '/');

      res.json({
        success: true,
        data: {
          path: relativePath, // Caminho relativo (certificates/filename.pfx)
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
        message: 'Certificado digital enviado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload de múltiplas imagens
   * Usa o StorageService que consulta a configuração de armazenamento cadastrada
   */
  async uploadMultipleImages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }

      // Garantir que temos um array de arquivos
      let files: Express.Multer.File[];
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        files = [req.files as unknown as Express.Multer.File];
      }
      
      if (files.length === 0) {
        throw new AppError('Nenhum arquivo foi enviado', 400);
      }
      
      console.log('[UploadController] Recebendo upload de', files.length, 'imagem(ns)...');
      console.log('[UploadController] Chamando StorageService.uploadFiles()');
      
      // Obter pasta do query parameter (padrão: 'units' para compatibilidade)
      const folder = (req.query.folder as string) || 'units';

      // Usar o serviço centralizado de armazenamento
      // O serviço automaticamente busca a configuração ativa/padrão da tabela storage_config
      const uploadedFiles = await StorageService.uploadFiles(files, req, folder);
      
      console.log('[UploadController] StorageService retornou', uploadedFiles.length, 'arquivo(s) processado(s)');

      res.json({
        success: true,
        data: {
          files: uploadedFiles,
        },
        message: `${uploadedFiles.length} imagem(ns) enviada(s) com sucesso`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletar uma imagem
   * Usa o StorageService que consulta a configuração de armazenamento cadastrada
   */
  async deleteImage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        throw new AppError('URL do arquivo é obrigatória', 400);
      }

      console.log('[UploadController] Recebendo solicitação de deleção de imagem...');
      console.log('[UploadController] URL:', url);
      console.log('[UploadController] Chamando StorageService.deleteFile()');

      // Usar o serviço centralizado de armazenamento
      const deleted = await StorageService.deleteFile(url, req);

      if (deleted) {
        console.log('[UploadController] Arquivo deletado com sucesso');
        res.json({
          success: true,
          message: 'Imagem deletada com sucesso',
        });
      } else {
        console.log('[UploadController] Arquivo não encontrado ou erro ao deletar');
        res.json({
          success: false,
          message: 'Arquivo não encontrado ou não foi possível deletar',
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
