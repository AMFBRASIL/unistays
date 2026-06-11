import { z } from 'zod';

export const createStorageConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    provider: z.enum(['local', 's3', 'gcs', 'azure', 'digitalocean', 'cloudflare']),
    name: z.string().min(1, 'Nome é obrigatório').max(255),
    description: z.string().optional().nullable(),
    isDefault: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    config: z.record(z.any()).optional().nullable(),
    
    // S3
    s3Bucket: z.string().max(255).optional().nullable(),
    s3Region: z.string().max(100).optional().nullable(),
    s3AccessKeyId: z.string().max(255).optional().nullable(),
    s3SecretAccessKey: z.string().max(255).optional().nullable(),
    s3Endpoint: z.string().max(500).optional().nullable(),
    s3UsePathStyle: z.boolean().optional().nullable(),
    
    // GCS
    gcsBucket: z.string().max(255).optional().nullable(),
    gcsProjectId: z.string().max(255).optional().nullable(),
    gcsKeyFile: z.string().optional().nullable(),
    
    // Azure
    azureAccountName: z.string().max(255).optional().nullable(),
    azureAccountKey: z.string().max(255).optional().nullable(),
    azureContainer: z.string().max(255).optional().nullable(),
    
    // DigitalOcean
    doSpaceName: z.string().max(255).optional().nullable(),
    doRegion: z.string().max(100).optional().nullable(),
    doAccessKey: z.string().max(255).optional().nullable(),
    doSecretKey: z.string().max(255).optional().nullable(),
    doEndpoint: z.string().max(500).optional().nullable(),
    
    // Cloudflare
    cfAccountId: z.string().max(255).optional().nullable(),
    cfAccessKeyId: z.string().max(255).optional().nullable(),
    cfSecretAccessKey: z.string().max(255).optional().nullable(),
    cfBucketName: z.string().max(255).optional().nullable(),
    cfEndpoint: z.string().max(500).optional().nullable(),
    
    // Geral
    maxFileSize: z.number().int().positive().optional().nullable(),
    allowedExtensions: z.array(z.string()).optional().nullable(),
    baseUrl: z.string().max(500).optional().nullable(),
    cdnUrl: z.string().max(500).optional().nullable(),
  }),
});

export const updateStorageConfigSchema = z.object({
  body: z.object({
    propertyId: z.number().int().positive().optional().nullable(),
    provider: z.enum(['local', 's3', 'gcs', 'azure', 'digitalocean', 'cloudflare']).optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    config: z.record(z.any()).optional().nullable(),
    
    // S3
    s3Bucket: z.string().max(255).optional().nullable(),
    s3Region: z.string().max(100).optional().nullable(),
    s3AccessKeyId: z.string().max(255).optional().nullable(),
    s3SecretAccessKey: z.string().max(255).optional().nullable(),
    s3Endpoint: z.string().max(500).optional().nullable(),
    s3UsePathStyle: z.boolean().optional().nullable(),
    
    // GCS
    gcsBucket: z.string().max(255).optional().nullable(),
    gcsProjectId: z.string().max(255).optional().nullable(),
    gcsKeyFile: z.string().optional().nullable(),
    
    // Azure
    azureAccountName: z.string().max(255).optional().nullable(),
    azureAccountKey: z.string().max(255).optional().nullable(),
    azureContainer: z.string().max(255).optional().nullable(),
    
    // DigitalOcean
    doSpaceName: z.string().max(255).optional().nullable(),
    doRegion: z.string().max(100).optional().nullable(),
    doAccessKey: z.string().max(255).optional().nullable(),
    doSecretKey: z.string().max(255).optional().nullable(),
    doEndpoint: z.string().max(500).optional().nullable(),
    
    // Cloudflare
    cfAccountId: z.string().max(255).optional().nullable(),
    cfAccessKeyId: z.string().max(255).optional().nullable(),
    cfSecretAccessKey: z.string().max(255).optional().nullable(),
    cfBucketName: z.string().max(255).optional().nullable(),
    cfEndpoint: z.string().max(500).optional().nullable(),
    
    // Geral
    maxFileSize: z.number().int().positive().optional().nullable(),
    allowedExtensions: z.array(z.string()).optional().nullable(),
    baseUrl: z.string().max(500).optional().nullable(),
    cdnUrl: z.string().max(500).optional().nullable(),
  }),
});

export type CreateStorageConfigInput = z.infer<typeof createStorageConfigSchema>['body'];
export type UpdateStorageConfigInput = z.infer<typeof updateStorageConfigSchema>['body'];
