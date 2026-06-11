import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { StorageConfig } from '@/entities/StorageConfig.entity';
import { Property } from '@/entities/Property.entity';
import { AuthRequest } from '@/middlewares/auth.middleware';
import { AppError } from '@/middlewares/error.middleware';
import { CreateStorageConfigInput, UpdateStorageConfigInput } from '@/validators/storageConfig.validator';
import { v4 as uuidv4 } from 'uuid';

export class StorageConfigController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, provider, isActive } = req.query;
      const queryRunner = AppDataSource.createQueryRunner();

      let query = `
        SELECT 
          s.id,
          s.uuid,
          s.property_id as propertyId,
          s.provider,
          s.name,
          s.description,
          s.is_default as isDefault,
          s.is_active as isActive,
          s.config,
          s.s3_bucket as s3Bucket,
          s.s3_region as s3Region,
          s.s3_access_key_id as s3AccessKeyId,
          s.s3_secret_access_key as s3SecretAccessKey,
          s.s3_endpoint as s3Endpoint,
          s.s3_use_path_style as s3UsePathStyle,
          s.gcs_bucket as gcsBucket,
          s.gcs_project_id as gcsProjectId,
          s.azure_account_name as azureAccountName,
          s.azure_account_key as azureAccountKey,
          s.azure_container as azureContainer,
          s.do_space_name as doSpaceName,
          s.do_region as doRegion,
          s.do_access_key as doAccessKey,
          s.do_secret_key as doSecretKey,
          s.do_endpoint as doEndpoint,
          s.cf_account_id as cfAccountId,
          s.cf_access_key_id as cfAccessKeyId,
          s.cf_secret_access_key as cfSecretAccessKey,
          s.cf_bucket_name as cfBucketName,
          s.cf_endpoint as cfEndpoint,
          s.max_file_size as maxFileSize,
          s.allowed_extensions as allowedExtensions,
          s.base_url as baseUrl,
          s.cdn_url as cdnUrl,
          s.created_at as createdAt,
          s.updated_at as updatedAt,
          p.id as property_id_col,
          p.name as property_name
        FROM storage_config s
        LEFT JOIN properties p ON s.property_id = p.id AND p.deleted_at IS NULL
        WHERE s.deleted_at IS NULL
      `;

      const params: any[] = [];
      if (propertyId) {
        query += ` AND s.property_id = ?`;
        params.push(parseInt(propertyId as string, 10));
      }
      if (provider) {
        query += ` AND s.provider = ?`;
        params.push(provider);
      }
      if (isActive !== undefined) {
        query += ` AND s.is_active = ?`;
        params.push(isActive === 'true');
      }

      query += ` ORDER BY s.is_default DESC, s.created_at DESC`;

      const configs = await queryRunner.query(query, params);
      await queryRunner.release();

      // Mapear resultados
      const configsResponse = configs.map((row: any) => {
        // Parse seguro de JSON inline
        const parseJson = (val: any): any => {
          if (!val) return null;
          if (typeof val === 'string') {
            try {
              return JSON.parse(val);
            } catch (e) {
              return null;
            }
          }
          return val;
        };

        return {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.propertyId,
          property: row.property_id_col ? {
            id: row.property_id_col,
            name: row.property_name,
          } : null,
          provider: row.provider,
          name: row.name,
          description: row.description,
          isDefault: Boolean(row.isDefault),
          isActive: Boolean(row.isActive),
          config: parseJson(row.config),
          s3Bucket: row.s3Bucket,
          s3Region: row.s3Region,
          s3AccessKeyId: row.s3AccessKeyId,
          s3SecretAccessKey: row.s3SecretAccessKey ? '***' : null, // Mascarar senha
          s3Endpoint: row.s3Endpoint,
          s3UsePathStyle: Boolean(row.s3UsePathStyle),
          gcsBucket: row.gcsBucket,
          gcsProjectId: row.gcsProjectId,
          azureAccountName: row.azureAccountName,
          azureAccountKey: row.azureAccountKey ? '***' : null, // Mascarar senha
          azureContainer: row.azureContainer,
          doSpaceName: row.doSpaceName,
          doRegion: row.doRegion,
          doAccessKey: row.doAccessKey,
          doSecretKey: row.doSecretKey ? '***' : null, // Mascarar senha
          doEndpoint: row.doEndpoint,
          cfAccountId: row.cfAccountId,
          cfAccessKeyId: row.cfAccessKeyId,
          cfSecretAccessKey: row.cfSecretAccessKey ? '***' : null, // Mascarar senha
          cfBucketName: row.cfBucketName,
          cfEndpoint: row.cfEndpoint,
          maxFileSize: row.maxFileSize,
          allowedExtensions: parseJson(row.allowedExtensions),
          baseUrl: row.baseUrl,
          cdnUrl: row.cdnUrl,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      });

      res.json({
        success: true,
        data: { storageConfigs: configsResponse },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const query = `
        SELECT 
          s.*,
          p.id as property_id_col,
          p.name as property_name
        FROM storage_config s
        LEFT JOIN properties p ON s.property_id = p.id AND p.deleted_at IS NULL
        WHERE s.id = ? AND s.deleted_at IS NULL
      `;

      const results = await queryRunner.query(query, [parseInt(id, 10)]);
      await queryRunner.release();

      if (results.length === 0) {
        throw new AppError('Configuração de armazenamento não encontrada', 404);
      }

      const row = results[0];
      
      // Parse seguro de JSON inline
      const parseJson = (val: any): any => {
        if (!val) return null;
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch (e) {
            return null;
          }
        }
        return val;
      };

      const config = {
        id: row.id,
        uuid: row.uuid,
        propertyId: row.property_id,
        property: row.property_id_col ? {
          id: row.property_id_col,
          name: row.property_name,
        } : null,
        provider: row.provider,
        name: row.name,
        description: row.description,
        isDefault: Boolean(row.is_default),
        isActive: Boolean(row.is_active),
        config: parseJson(row.config),
        s3Bucket: row.s3_bucket,
        s3Region: row.s3_region,
        s3AccessKeyId: row.s3_access_key_id,
        s3SecretAccessKey: row.s3_secret_access_key ? '***' : null,
        s3Endpoint: row.s3_endpoint,
        s3UsePathStyle: Boolean(row.s3_use_path_style),
        gcsBucket: row.gcs_bucket,
        gcsProjectId: row.gcs_project_id,
        azureAccountName: row.azure_account_name,
        azureAccountKey: row.azure_account_key ? '***' : null,
        azureContainer: row.azure_container,
        doSpaceName: row.do_space_name,
        doRegion: row.do_region,
        doAccessKey: row.do_access_key,
        doSecretKey: row.do_secret_key ? '***' : null,
        doEndpoint: row.do_endpoint,
        cfAccountId: row.cf_account_id,
        cfAccessKeyId: row.cf_access_key_id,
        cfSecretAccessKey: row.cf_secret_access_key ? '***' : null,
        cfBucketName: row.cf_bucket_name,
        cfEndpoint: row.cf_endpoint,
        maxFileSize: row.max_file_size,
        allowedExtensions: parseJson(row.allowed_extensions),
        baseUrl: row.base_url,
        cdnUrl: row.cdn_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      res.json({
        success: true,
        data: { storageConfig: config },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateStorageConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Se for definir como padrão, remover padrão dos outros
        if (data.isDefault) {
          await queryRunner.query(
            `UPDATE storage_config SET is_default = FALSE WHERE deleted_at IS NULL`
          );
        }

        // Verificar propriedade se fornecida
        if (data.propertyId) {
          const propertyCheck = await queryRunner.query(
            `SELECT id FROM properties WHERE id = ? AND deleted_at IS NULL`,
            [data.propertyId]
          );
          if (propertyCheck.length === 0) {
            throw new AppError('Propriedade não encontrada', 404);
          }
        }

        const uuid = uuidv4();
        const configJson = data.config ? JSON.stringify(data.config) : null;
        const allowedExtensionsJson = data.allowedExtensions ? JSON.stringify(data.allowedExtensions) : null;

        const insertQuery = `
          INSERT INTO storage_config (
            uuid, property_id, provider, name, description, is_default, is_active,
            config, s3_bucket, s3_region, s3_access_key_id, s3_secret_access_key, s3_endpoint, s3_use_path_style,
            gcs_bucket, gcs_project_id, gcs_key_file,
            azure_account_name, azure_account_key, azure_container,
            do_space_name, do_region, do_access_key, do_secret_key, do_endpoint,
            cf_account_id, cf_access_key_id, cf_secret_access_key, cf_bucket_name, cf_endpoint,
            max_file_size, allowed_extensions, base_url, cdn_url, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, NOW(), NOW()
          )
        `;

        const insertParams: any[] = [
          uuid,
          data.propertyId || null,
          data.provider,
          data.name,
          data.description || null,
          data.isDefault || false,
          data.isActive !== false,
          configJson,
          data.s3Bucket || null,
          data.s3Region || null,
          data.s3AccessKeyId || null,
          data.s3SecretAccessKey || null,
          data.s3Endpoint || null,
          data.s3UsePathStyle || false,
          data.gcsBucket || null,
          data.gcsProjectId || null,
          data.gcsKeyFile || null,
          data.azureAccountName || null,
          data.azureAccountKey || null,
          data.azureContainer || null,
          data.doSpaceName || null,
          data.doRegion || null,
          data.doAccessKey || null,
          data.doSecretKey || null,
          data.doEndpoint || null,
          data.cfAccountId || null,
          data.cfAccessKeyId || null,
          data.cfSecretAccessKey || null,
          data.cfBucketName || null,
          data.cfEndpoint || null,
          data.maxFileSize || 10485760,
          allowedExtensionsJson,
          data.baseUrl || null,
          data.cdnUrl || null,
        ];

        const result = await queryRunner.query(insertQuery, insertParams);
        const configId = result.insertId;

        // Buscar configuração criada
        const selectQuery = `
          SELECT * FROM storage_config WHERE id = ?
        `;
        const created = await queryRunner.query(selectQuery, [configId]);

        await queryRunner.commitTransaction();

        if (created.length === 0) {
          throw new AppError('Erro ao criar configuração', 500);
        }

        const row = created[0];
        
        // Parse seguro de JSON inline
        const parseJson = (val: any): any => {
          if (!val) return null;
          if (typeof val === 'string') {
            try {
              return JSON.parse(val);
            } catch (e) {
              return null;
            }
          }
          return val;
        };

        const config = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.property_id,
          provider: row.provider,
          name: row.name,
          description: row.description,
          isDefault: Boolean(row.is_default),
          isActive: Boolean(row.is_active),
          config: parseJson(row.config),
          s3Bucket: row.s3_bucket,
          s3Region: row.s3_region,
          s3AccessKeyId: row.s3_access_key_id,
          s3SecretAccessKey: row.s3_secret_access_key ? '***' : null,
          s3Endpoint: row.s3_endpoint,
          s3UsePathStyle: Boolean(row.s3_use_path_style),
          gcsBucket: row.gcs_bucket,
          gcsProjectId: row.gcs_project_id,
          azureAccountName: row.azure_account_name,
          azureAccountKey: row.azure_account_key ? '***' : null,
          azureContainer: row.azure_container,
          doSpaceName: row.do_space_name,
          doRegion: row.do_region,
          doAccessKey: row.do_access_key,
          doSecretKey: row.do_secret_key ? '***' : null,
          doEndpoint: row.do_endpoint,
          cfAccountId: row.cf_account_id,
          cfAccessKeyId: row.cf_access_key_id,
          cfSecretAccessKey: row.cf_secret_access_key ? '***' : null,
          cfBucketName: row.cf_bucket_name,
          cfEndpoint: row.cf_endpoint,
          maxFileSize: row.max_file_size,
          allowedExtensions: parseJson(row.allowed_extensions),
          baseUrl: row.base_url,
          cdnUrl: row.cdn_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        res.status(201).json({
          success: true,
          data: { storageConfig: config },
          message: 'Configuração de armazenamento criada com sucesso',
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateStorageConfigInput = req.body;
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Verificar se existe
        const existing = await queryRunner.query(
          `SELECT id FROM storage_config WHERE id = ? AND deleted_at IS NULL`,
          [parseInt(id, 10)]
        );

        if (existing.length === 0) {
          throw new AppError('Configuração de armazenamento não encontrada', 404);
        }

        // Se for definir como padrão, remover padrão dos outros
        if (data.isDefault) {
          await queryRunner.query(
            `UPDATE storage_config SET is_default = FALSE WHERE id != ? AND deleted_at IS NULL`,
            [parseInt(id, 10)]
          );
        }

        // Verificar propriedade se fornecida
        if (data.propertyId) {
          const propertyCheck = await queryRunner.query(
            `SELECT id FROM properties WHERE id = ? AND deleted_at IS NULL`,
            [data.propertyId]
          );
          if (propertyCheck.length === 0) {
            throw new AppError('Propriedade não encontrada', 404);
          }
        }

        // Construir query de atualização dinamicamente
        const updates: string[] = [];
        const params: any[] = [];

        if (data.provider !== undefined) updates.push('provider = ?'), params.push(data.provider);
        if (data.name !== undefined) updates.push('name = ?'), params.push(data.name);
        if (data.description !== undefined) updates.push('description = ?'), params.push(data.description === null ? null : data.description);
        if (data.isDefault !== undefined) updates.push('is_default = ?'), params.push(data.isDefault);
        if (data.isActive !== undefined) updates.push('is_active = ?'), params.push(data.isActive);
        if (data.config !== undefined) updates.push('config = ?'), params.push(data.config ? JSON.stringify(data.config) : null);
        if (data.s3Bucket !== undefined) updates.push('s3_bucket = ?'), params.push(data.s3Bucket);
        if (data.s3Region !== undefined) updates.push('s3_region = ?'), params.push(data.s3Region);
        if (data.s3AccessKeyId !== undefined) updates.push('s3_access_key_id = ?'), params.push(data.s3AccessKeyId);
        if (data.s3SecretAccessKey !== undefined) updates.push('s3_secret_access_key = ?'), params.push(data.s3SecretAccessKey);
        if (data.s3Endpoint !== undefined) updates.push('s3_endpoint = ?'), params.push(data.s3Endpoint);
        if (data.s3UsePathStyle !== undefined) updates.push('s3_use_path_style = ?'), params.push(data.s3UsePathStyle);
        if (data.gcsBucket !== undefined) updates.push('gcs_bucket = ?'), params.push(data.gcsBucket);
        if (data.gcsProjectId !== undefined) updates.push('gcs_project_id = ?'), params.push(data.gcsProjectId);
        if (data.gcsKeyFile !== undefined) updates.push('gcs_key_file = ?'), params.push(data.gcsKeyFile);
        if (data.azureAccountName !== undefined) updates.push('azure_account_name = ?'), params.push(data.azureAccountName);
        if (data.azureAccountKey !== undefined) updates.push('azure_account_key = ?'), params.push(data.azureAccountKey);
        if (data.azureContainer !== undefined) updates.push('azure_container = ?'), params.push(data.azureContainer);
        if (data.doSpaceName !== undefined) updates.push('do_space_name = ?'), params.push(data.doSpaceName);
        if (data.doRegion !== undefined) updates.push('do_region = ?'), params.push(data.doRegion);
        if (data.doAccessKey !== undefined) updates.push('do_access_key = ?'), params.push(data.doAccessKey);
        if (data.doSecretKey !== undefined) updates.push('do_secret_key = ?'), params.push(data.doSecretKey);
        if (data.doEndpoint !== undefined) updates.push('do_endpoint = ?'), params.push(data.doEndpoint);
        if (data.cfAccountId !== undefined) updates.push('cf_account_id = ?'), params.push(data.cfAccountId);
        if (data.cfAccessKeyId !== undefined) updates.push('cf_access_key_id = ?'), params.push(data.cfAccessKeyId);
        if (data.cfSecretAccessKey !== undefined) updates.push('cf_secret_access_key = ?'), params.push(data.cfSecretAccessKey);
        if (data.cfBucketName !== undefined) updates.push('cf_bucket_name = ?'), params.push(data.cfBucketName);
        if (data.cfEndpoint !== undefined) updates.push('cf_endpoint = ?'), params.push(data.cfEndpoint);
        if (data.maxFileSize !== undefined) updates.push('max_file_size = ?'), params.push(data.maxFileSize);
        if (data.allowedExtensions !== undefined) updates.push('allowed_extensions = ?'), params.push(data.allowedExtensions ? JSON.stringify(data.allowedExtensions) : null);
        if (data.baseUrl !== undefined) updates.push('base_url = ?'), params.push(data.baseUrl);
        if (data.cdnUrl !== undefined) updates.push('cdn_url = ?'), params.push(data.cdnUrl);
        if (data.propertyId !== undefined) updates.push('property_id = ?'), params.push(data.propertyId);

        if (updates.length === 0) {
          throw new AppError('Nenhum campo para atualizar', 400);
        }

        updates.push('updated_at = NOW()');
        params.push(parseInt(id, 10));

        const updateQuery = `UPDATE storage_config SET ${updates.join(', ')} WHERE id = ?`;
        await queryRunner.query(updateQuery, params);

        // Buscar configuração atualizada
        const selectQuery = `SELECT * FROM storage_config WHERE id = ?`;
        const updated = await queryRunner.query(selectQuery, [parseInt(id, 10)]);

        await queryRunner.commitTransaction();

        if (updated.length === 0) {
          throw new AppError('Erro ao atualizar configuração', 500);
        }

        const row = updated[0];
        
        // Parse seguro de JSON inline
        const parseJson = (val: any): any => {
          if (!val) return null;
          if (typeof val === 'string') {
            try {
              return JSON.parse(val);
            } catch (e) {
              return null;
            }
          }
          return val;
        };

        const config = {
          id: row.id,
          uuid: row.uuid,
          propertyId: row.property_id,
          provider: row.provider,
          name: row.name,
          description: row.description,
          isDefault: Boolean(row.is_default),
          isActive: Boolean(row.is_active),
          config: parseJson(row.config),
          s3Bucket: row.s3_bucket,
          s3Region: row.s3_region,
          s3AccessKeyId: row.s3_access_key_id,
          s3SecretAccessKey: row.s3_secret_access_key ? '***' : null,
          s3Endpoint: row.s3_endpoint,
          s3UsePathStyle: Boolean(row.s3_use_path_style),
          gcsBucket: row.gcs_bucket,
          gcsProjectId: row.gcs_project_id,
          azureAccountName: row.azure_account_name,
          azureAccountKey: row.azure_account_key ? '***' : null,
          azureContainer: row.azure_container,
          doSpaceName: row.do_space_name,
          doRegion: row.do_region,
          doAccessKey: row.do_access_key,
          doSecretKey: row.do_secret_key ? '***' : null,
          doEndpoint: row.do_endpoint,
          cfAccountId: row.cf_account_id,
          cfAccessKeyId: row.cf_access_key_id,
          cfSecretAccessKey: row.cf_secret_access_key ? '***' : null,
          cfBucketName: row.cf_bucket_name,
          cfEndpoint: row.cf_endpoint,
          maxFileSize: row.max_file_size,
          allowedExtensions: parseJson(row.allowed_extensions),
          baseUrl: row.base_url,
          cdnUrl: row.cdn_url,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        res.json({
          success: true,
          data: { storageConfig: config },
          message: 'Configuração de armazenamento atualizada com sucesso',
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const queryRunner = AppDataSource.createQueryRunner();

      const check = await queryRunner.query(
        `SELECT id FROM storage_config WHERE id = ? AND deleted_at IS NULL`,
        [parseInt(id, 10)]
      );

      if (check.length === 0) {
        throw new AppError('Configuração de armazenamento não encontrada', 404);
      }

      await queryRunner.query(
        `UPDATE storage_config SET deleted_at = NOW() WHERE id = ?`,
        [parseInt(id, 10)]
      );

      await queryRunner.release();

      res.json({
        success: true,
        message: 'Configuração de armazenamento removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
