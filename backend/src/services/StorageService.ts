import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, PutObjectCommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middlewares/error.middleware';
import { env } from '@/config/env';

interface StorageConfig {
  id: number;
  uuid: string;
  propertyId: number | null;
  provider: 'local' | 's3' | 'gcs' | 'azure' | 'digitalocean' | 'cloudflare';
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  baseUrl: string | null;
  cdnUrl: string | null;
  // S3
  s3Bucket: string | null;
  s3Region: string | null;
  s3AccessKeyId: string | null;
  s3SecretAccessKey: string | null;
  s3Endpoint: string | null;
  s3UsePathStyle: boolean | null;
  // GCS
  gcsBucket: string | null;
  gcsProjectId: string | null;
  gcsKeyFile: string | null;
  // Azure
  azureAccountName: string | null;
  azureAccountKey: string | null;
  azureContainer: string | null;
  // DigitalOcean
  doSpaceName: string | null;
  doRegion: string | null;
  doAccessKey: string | null;
  doSecretKey: string | null;
  doEndpoint: string | null;
  // Cloudflare
  cfAccountId: string | null;
  cfAccessKeyId: string | null;
  cfSecretAccessKey: string | null;
  cfBucketName: string | null;
  cfEndpoint: string | null;
}

export interface UploadResult {
  url: string;
  fullUrl: string;
  filename: string;
  originalName: string;
  size: number;
}

export class StorageService {
  private static getWritableUploadBasePath(): string {
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
    return isVercel
      ? path.join('/tmp', 'uploads')
      : path.join(process.cwd(), env.UPLOAD_PATH || 'uploads');
  }

  /**
   * Buscar configuração de armazenamento padrão ou ativa
   */
  static async getStorageConfig(): Promise<StorageConfig | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const query = `
        SELECT 
          id, uuid, property_id, provider, name, description,
          is_default, is_active, config, base_url, cdn_url,
          s3_bucket, s3_region, s3_access_key_id, s3_secret_access_key, s3_endpoint, s3_use_path_style,
          gcs_bucket, gcs_project_id, gcs_key_file,
          azure_account_name, azure_account_key, azure_container,
          do_space_name, do_region, do_access_key, do_secret_key, do_endpoint,
          cf_account_id, cf_access_key_id, cf_secret_access_key, cf_bucket_name, cf_endpoint,
          max_file_size, allowed_extensions
        FROM storage_config 
        WHERE deleted_at IS NULL 
        AND is_active = TRUE 
        ORDER BY is_default DESC, created_at ASC 
        LIMIT 1
      `;
      const results = await queryRunner.query(query);
      
      if (results.length > 0) {
        const row = results[0];
        const config: StorageConfig = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.property_id,
          provider: row.provider,
          name: row.name,
          description: row.description,
          isDefault: Boolean(row.is_default),
          isActive: Boolean(row.is_active),
          baseUrl: row.base_url,
          cdnUrl: row.cdn_url,
          s3Bucket: row.s3_bucket,
          s3Region: row.s3_region,
          s3AccessKeyId: row.s3_access_key_id,
          s3SecretAccessKey: row.s3_secret_access_key,
          s3Endpoint: row.s3_endpoint,
          s3UsePathStyle: Boolean(row.s3_use_path_style),
          gcsBucket: row.gcs_bucket,
          gcsProjectId: row.gcs_project_id,
          gcsKeyFile: row.gcs_key_file,
          azureAccountName: row.azure_account_name,
          azureAccountKey: row.azure_account_key,
          azureContainer: row.azure_container,
          doSpaceName: row.do_space_name,
          doRegion: row.do_region,
          doAccessKey: row.do_access_key,
          doSecretKey: row.do_secret_key,
          doEndpoint: row.do_endpoint,
          cfAccountId: row.cf_account_id,
          cfAccessKeyId: row.cf_access_key_id,
          cfSecretAccessKey: row.cf_secret_access_key,
          cfBucketName: row.cf_bucket_name,
          cfEndpoint: row.cf_endpoint,
        };
        
      console.log('[StorageService] ✅ Configuração encontrada:', {
        id: config.id,
        provider: config.provider,
        name: config.name,
        baseUrl: config.baseUrl,
        cdnUrl: config.cdnUrl,
        isDefault: config.isDefault,
        isActive: config.isActive,
      });
        
        return config;
      } else {
        console.log('[StorageService] Nenhuma configuração de armazenamento ativa encontrada, usando padrão local');
      }
      return null;
    } catch (error) {
      console.error('[StorageService] Erro ao buscar configuração de armazenamento:', error);
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Upload de arquivo usando a configuração de armazenamento cadastrada
   * @param file Arquivo do multer
   * @param req Request do Express
   * @param folder Pasta onde salvar (ex: 'units', 'products', 'users')
   * @returns Resultado do upload com URLs
   */
  static async uploadFile(
    file: Express.Multer.File,
    req: Request,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    console.log('[StorageService] ============================================');
    console.log('[StorageService] INICIANDO UPLOAD VIA STORAGE SERVICE');
    console.log('[StorageService] Arquivo:', file.originalname);
    console.log('[StorageService] Pasta:', folder);
    
    // Buscar configuração de armazenamento
    console.log('[StorageService] Buscando configuração de armazenamento cadastrada...');
    const storageConfig = await this.getStorageConfig();

    if (!storageConfig || storageConfig.provider === 'local') {
      console.log('[StorageService] ⚙️ Provider selecionado: LOCAL');
      if (!storageConfig) {
        console.log('[StorageService] ℹ️ Nenhuma configuração encontrada, usando padrão local');
      } else {
        console.log('[StorageService] ℹ️ Configuração encontrada:', {
          id: storageConfig.id,
          name: storageConfig.name,
          provider: storageConfig.provider,
        });
      }
      return await this.uploadToLocal(file, req, folder, storageConfig);
    }

    // Roteamento para o provider correto
    console.log('[StorageService] ⚙️ Provider selecionado:', storageConfig.provider.toUpperCase());
    console.log('[StorageService] 📋 Configuração:', {
      id: storageConfig.id,
      name: storageConfig.name,
      provider: storageConfig.provider,
      bucket: storageConfig.s3Bucket || storageConfig.cfBucketName || storageConfig.doSpaceName || 'N/A',
      region: storageConfig.s3Region || storageConfig.doRegion || storageConfig.cfEndpoint ? 'N/A' : 'N/A',
    });

    switch (storageConfig.provider) {
      case 's3':
        console.log('[StorageService] 🚀 Executando upload para AMAZON S3');
        return await this.uploadToS3(file, req, folder, storageConfig);
      case 'gcs':
        // TODO: Implementar Google Cloud Storage
        console.warn('[StorageService] ⚠️ Google Cloud Storage ainda não implementado, usando local como fallback');
        return await this.uploadToLocal(file, req, folder, storageConfig);
      case 'azure':
        // TODO: Implementar Azure Blob Storage
        console.warn('[StorageService] ⚠️ Azure Blob Storage ainda não implementado, usando local como fallback');
        return await this.uploadToLocal(file, req, folder, storageConfig);
      case 'digitalocean':
        // DigitalOcean Spaces usa API compatível com S3
        console.log('[StorageService] 🚀 Executando upload para DIGITALOCEAN SPACES (S3-compatible)');
        return await this.uploadToS3(file, req, folder, storageConfig);
      case 'cloudflare':
        // Cloudflare R2 usa API compatível com S3
        console.log('[StorageService] 🚀 Executando upload para CLOUDFLARE R2 (S3-compatible)');
        return await this.uploadToS3(file, req, folder, storageConfig);
      default:
        console.warn(`[StorageService] ⚠️ Provider ${storageConfig.provider} desconhecido, usando local como fallback`);
        return await this.uploadToLocal(file, req, folder, storageConfig);
    }
  }

  /**
   * Upload múltiplos arquivos usando a configuração de armazenamento
   */
  static async uploadFiles(
    files: Express.Multer.File[],
    req: Request,
    folder: string = 'uploads'
  ): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file, req, folder)));
  }

  /**
   * Upload para armazenamento local
   */
  private static async uploadToLocal(
    file: Express.Multer.File,
    req: Request,
    folder: string,
    storageConfig?: StorageConfig | null
  ): Promise<UploadResult> {
    // Se o arquivo está no diretório temp, mover para o destino final
    const tempPath = file.path;
    const finalPath = path.join(this.getWritableUploadBasePath(), folder, file.filename);
    
    // Criar diretório de destino se não existir
    const finalDir = path.dirname(finalPath);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    // Mover arquivo de temp para destino final (se ainda estiver em temp)
    if (tempPath.includes('temp') && fs.existsSync(tempPath)) {
      fs.renameSync(tempPath, finalPath);
      file.path = finalPath; // Atualizar path do arquivo
    }
    
    // Se tiver baseUrl configurado na storage config, usar ele
    const basePath = storageConfig?.baseUrl || '/uploads';
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    
    // Montar caminho completo
    const filePath = `${cleanBasePath}/${folder}/${file.filename}`;
    
    // Garantir que o caminho não comece com /
    const fileUrl = filePath.startsWith('/') ? filePath : `/${filePath}`;
    
    // Gerar fullUrl
    let fullUrl: string;
    if (storageConfig?.cdnUrl) {
      // Se tiver CDN configurado, usar CDN
      const cleanCdnUrl = storageConfig.cdnUrl.endsWith('/') ? storageConfig.cdnUrl.slice(0, -1) : storageConfig.cdnUrl;
      fullUrl = `${cleanCdnUrl}${fileUrl}`;
    } else {
      // Caso contrário, usar o host da requisição
      const baseUrl = req.protocol + '://' + req.get('host');
      fullUrl = `${baseUrl}${fileUrl}`;
    }

    console.log('[StorageService] 💾 Upload LOCAL executado:', {
      storageConfigId: storageConfig?.id,
      provider: storageConfig?.provider || 'default',
      folder,
      filename: file.filename,
      fileUrl,
      fullUrl,
      cdnUrl: storageConfig?.cdnUrl || 'Não configurado',
    });
    console.log('[StorageService] ============================================');
    
    return {
      url: fileUrl,
      fullUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  /**
   * Upload para Amazon S3 (ou serviços compatíveis: DigitalOcean Spaces, Cloudflare R2)
   */
  private static async uploadToS3(
    file: Express.Multer.File,
    req: Request,
    folder: string,
    storageConfig: StorageConfig
  ): Promise<UploadResult> {
    try {
      // Validar configurações necessárias
      const bucket = storageConfig.s3Bucket || storageConfig.cfBucketName || storageConfig.doSpaceName;
      const region = storageConfig.s3Region || storageConfig.doRegion || 'us-east-1';
      const accessKeyId = storageConfig.s3AccessKeyId || storageConfig.cfAccessKeyId || storageConfig.doAccessKey;
      const secretAccessKey = storageConfig.s3SecretAccessKey || storageConfig.cfSecretAccessKey || storageConfig.doSecretKey;
      const endpoint = storageConfig.s3Endpoint || storageConfig.cfEndpoint || storageConfig.doEndpoint;

      if (!bucket) {
        throw new AppError('Bucket não configurado', 400);
      }
      if (!accessKeyId || !secretAccessKey) {
        throw new AppError('Credenciais não configuradas', 400);
      }

      // Configurar cliente S3 (compatível com S3, DigitalOcean Spaces, Cloudflare R2)
      const s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint || undefined,
        forcePathStyle: storageConfig.s3UsePathStyle || false,
      });

      // Definir caminho no bucket (preservar estrutura de pastas)
      const s3Key = `${folder}/${file.filename}`;

      // Ler arquivo do disco
      const fileBuffer = fs.readFileSync(file.path);

      // Preparar comando de upload
      const uploadParams: PutObjectCommandInput = {
        Bucket: bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.mimetype,
        // ACL removido - use bucket policies para controlar acesso público
      };

      // Fazer upload
      console.log('[StorageService] Fazendo upload para S3:', {
        provider: storageConfig.provider,
        bucket,
        key: s3Key,
        region,
        size: file.size,
      });

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Gerar URL do arquivo
      let fileUrl: string;
      let fullUrl: string;

      if (storageConfig.cdnUrl) {
        // Se tiver CDN configurado, usar CDN
        const cleanCdnUrl = storageConfig.cdnUrl.endsWith('/') ? storageConfig.cdnUrl.slice(0, -1) : storageConfig.cdnUrl;
        fileUrl = `/${s3Key}`;
        fullUrl = `${cleanCdnUrl}/${s3Key}`;
      } else if (endpoint) {
        // Se tiver endpoint customizado (DigitalOcean Spaces, Cloudflare R2, etc.)
        const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
        if (storageConfig.s3UsePathStyle) {
          fileUrl = `/${s3Key}`;
          fullUrl = `${cleanEndpoint}/${bucket}/${s3Key}`;
        } else {
          fileUrl = `/${s3Key}`;
          fullUrl = `${cleanEndpoint}/${s3Key}`;
        }
      } else {
        // URL padrão da AWS S3
        fileUrl = `/${s3Key}`;
        if (region === 'us-east-1') {
          fullUrl = `https://${bucket}.s3.amazonaws.com/${s3Key}`;
        } else {
          fullUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
        }
      }

      // Remover arquivo local após upload para S3
      try {
        fs.unlinkSync(file.path);
        console.log('[StorageService] Arquivo local removido após upload para S3');
      } catch (unlinkError) {
        console.warn('[StorageService] Erro ao remover arquivo local:', unlinkError);
      }

      console.log('[StorageService] ✅ Upload para S3 concluído:', {
        fileUrl,
        fullUrl,
        bucket,
        region,
      });
      console.log('[StorageService] ============================================');

      return {
        url: fileUrl,
        fullUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error: any) {
      console.error('[StorageService] Erro ao fazer upload para S3:', error);
      // Remover arquivo local em caso de erro
      try {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (unlinkError) {
        // Ignorar erro ao remover
      }
      throw new AppError(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`, 500);
    }
  }

  /**
   * Deletar arquivo do storage (local ou cloud)
   * @param fileUrl URL do arquivo (pode ser relativa ou absoluta)
   * @param req Request do Express (opcional, necessário apenas para determinar base URL local)
   * @returns true se deletado com sucesso, false se arquivo não encontrado
   */
  static async deleteFile(
    fileUrl: string,
    req?: Request
  ): Promise<boolean> {
    console.log('[StorageService] ============================================');
    console.log('[StorageService] INICIANDO DELEÇÃO VIA STORAGE SERVICE');
    console.log('[StorageService] URL do arquivo:', fileUrl);

    // Buscar configuração de armazenamento
    console.log('[StorageService] Buscando configuração de armazenamento cadastrada...');
    const storageConfig = await this.getStorageConfig();

    // Se a URL é absoluta (http/https), provavelmente é cloud storage
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      if (!storageConfig || storageConfig.provider === 'local') {
        console.warn('[StorageService] URL absoluta detectada mas provider é local, tentando deletar localmente');
        return await this.deleteFromLocal(fileUrl, req);
      }

      console.log('[StorageService] ⚙️ Provider selecionado:', storageConfig.provider.toUpperCase());
      
      switch (storageConfig.provider) {
        case 's3':
          return await this.deleteFromS3(fileUrl, storageConfig);
        case 'digitalocean':
        case 'cloudflare':
          return await this.deleteFromS3(fileUrl, storageConfig);
        case 'gcs':
        case 'azure':
          console.warn(`[StorageService] ⚠️ Deletar do ${storageConfig.provider} ainda não implementado`);
          return false;
        default:
          console.warn(`[StorageService] ⚠️ Provider ${storageConfig.provider} desconhecido`);
          return false;
      }
    }

    // URL relativa - usar configuração para determinar onde deletar
    if (!storageConfig || storageConfig.provider === 'local') {
      console.log('[StorageService] ⚙️ Provider selecionado: LOCAL');
      return await this.deleteFromLocal(fileUrl, req);
    }

    // Para cloud storage, precisamos construir a URL completa para identificar o arquivo
    // Mas como temos apenas URL relativa, vamos tentar deletar do cloud usando a key
    console.log('[StorageService] ⚙️ Provider selecionado:', storageConfig.provider.toUpperCase());
    
    switch (storageConfig.provider) {
      case 's3':
      case 'digitalocean':
      case 'cloudflare':
        // Extrair a key do S3 da URL relativa (ex: /units/filename.png -> units/filename.png)
        const s3Key = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
        return await this.deleteFromS3ByKey(s3Key, storageConfig);
      default:
        console.warn(`[StorageService] ⚠️ Provider ${storageConfig.provider} não suporta deleção via URL relativa`);
        return false;
    }
  }

  /**
   * Deletar arquivo do armazenamento local
   */
  private static async deleteFromLocal(
    fileUrl: string,
    req?: Request
  ): Promise<boolean> {
    try {
      let filePath: string;

      // Se for URL absoluta, tentar extrair o caminho
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        // Extrair pathname da URL (ex: http://localhost:3000/uploads/units/file.png -> /uploads/units/file.png)
        try {
          const urlObj = new URL(fileUrl);
          filePath = urlObj.pathname;
        } catch {
          console.error('[StorageService] Erro ao parsear URL:', fileUrl);
          return false;
        }
      } else {
        filePath = fileUrl;
      }

      // Remover barra inicial se houver
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

      // Construir caminho completo
      const fullPath = path.join(process.cwd(), cleanPath);

      // Verificar se arquivo existe
      if (!fs.existsSync(fullPath)) {
        console.warn('[StorageService] Arquivo não encontrado:', fullPath);
        return false;
      }

      // Deletar arquivo
      fs.unlinkSync(fullPath);
      console.log('[StorageService] ✅ Arquivo local deletado:', fullPath);
      console.log('[StorageService] ============================================');
      return true;
    } catch (error: any) {
      console.error('[StorageService] Erro ao deletar arquivo local:', error);
      console.log('[StorageService] ============================================');
      return false;
    }
  }

  /**
   * Deletar arquivo do S3 usando URL completa
   */
  private static async deleteFromS3(
    fileUrl: string,
    storageConfig: StorageConfig
  ): Promise<boolean> {
    try {
      // Extrair bucket e key da URL
      // Formato pode ser:
      // - https://bucket.s3.region.amazonaws.com/key
      // - https://bucket.s3.amazonaws.com/key
      // - https://endpoint/bucket/key (path-style)
      // - https://endpoint/key (virtual-hosted-style)

      const urlObj = new URL(fileUrl);
      let bucket: string;
      let key: string;

      if (storageConfig.s3UsePathStyle && storageConfig.s3Endpoint) {
        // Path-style: https://endpoint/bucket/key
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        bucket = pathParts[0] || storageConfig.s3Bucket || '';
        key = pathParts.slice(1).join('/');
      } else if (urlObj.hostname.includes('.s3.') || urlObj.hostname.includes('.s3-')) {
        // Virtual-hosted-style da AWS: https://bucket.s3.region.amazonaws.com/key
        bucket = urlObj.hostname.split('.')[0];
        key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      } else if (storageConfig.s3Endpoint) {
        // Endpoint customizado (DigitalOcean, Cloudflare R2)
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        bucket = storageConfig.s3Bucket || pathParts[0] || '';
        key = pathParts.slice(1).join('/') || urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      } else {
        bucket = storageConfig.s3Bucket || '';
        key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
      }

      return await this.deleteFromS3ByKey(key, storageConfig, bucket);
    } catch (error: any) {
      console.error('[StorageService] Erro ao deletar do S3:', error);
      console.log('[StorageService] ============================================');
      return false;
    }
  }

  /**
   * Deletar arquivo do S3 usando key diretamente
   */
  private static async deleteFromS3ByKey(
    key: string,
    storageConfig: StorageConfig,
    bucket?: string
  ): Promise<boolean> {
    try {
      const s3Bucket = bucket || storageConfig.s3Bucket || storageConfig.cfBucketName || storageConfig.doSpaceName;
      const region = storageConfig.s3Region || storageConfig.doRegion || 'us-east-1';
      const accessKeyId = storageConfig.s3AccessKeyId || storageConfig.cfAccessKeyId || storageConfig.doAccessKey;
      const secretAccessKey = storageConfig.s3SecretAccessKey || storageConfig.cfSecretAccessKey || storageConfig.doSecretKey;
      const endpoint = storageConfig.s3Endpoint || storageConfig.cfEndpoint || storageConfig.doEndpoint;

      if (!s3Bucket) {
        throw new AppError('Bucket não configurado', 400);
      }
      if (!accessKeyId || !secretAccessKey) {
        throw new AppError('Credenciais não configuradas', 400);
      }

      // Configurar cliente S3
      const s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        endpoint: endpoint || undefined,
        forcePathStyle: storageConfig.s3UsePathStyle || false,
      });

      console.log('[StorageService] 🗑️ Deletando do S3:', {
        bucket: s3Bucket,
        key,
        provider: storageConfig.provider,
      });

      // Preparar comando de deleção
      const deleteCommand = new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: key,
      });

      // Executar deleção
      await s3Client.send(deleteCommand);

      console.log('[StorageService] ✅ Arquivo deletado do S3 com sucesso');
      console.log('[StorageService] ============================================');
      return true;
    } catch (error: any) {
      console.error('[StorageService] Erro ao deletar do S3:', error);
      console.log('[StorageService] ============================================');
      return false;
    }
  }
}
