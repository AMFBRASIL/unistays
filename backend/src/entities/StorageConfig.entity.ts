import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Property } from './Property.entity';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  GCS = 'gcs',
  AZURE = 'azure',
  DIGITALOCEAN = 'digitalocean',
  CLOUDFLARE = 'cloudflare',
}

@Entity('storage_config')
@Index(['propertyId'])
@Index(['provider'])
@Index(['isDefault'])
@Index(['isActive'])
@Unique(['uuid'])
export class StorageConfig {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'property_id' })
  propertyId: number | null;

  @Column({
    type: 'enum',
    enum: ['local', 's3', 'gcs', 'azure', 'digitalocean', 'cloudflare'],
    default: StorageProvider.LOCAL,
  })
  provider: StorageProvider;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any> | null;

  // AWS S3
  @Column({ type: 'varchar', length: 255, nullable: true, name: 's3_bucket' })
  s3Bucket: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 's3_region' })
  s3Region: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 's3_access_key_id' })
  s3AccessKeyId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 's3_secret_access_key' })
  s3SecretAccessKey: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 's3_endpoint' })
  s3Endpoint: string | null;

  @Column({ type: 'boolean', nullable: true, default: false, name: 's3_use_path_style' })
  s3UsePathStyle: boolean | null;

  // Google Cloud Storage
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'gcs_bucket' })
  gcsBucket: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'gcs_project_id' })
  gcsProjectId: string | null;

  @Column({ type: 'text', nullable: true, name: 'gcs_key_file' })
  gcsKeyFile: string | null;

  // Azure Blob Storage
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'azure_account_name' })
  azureAccountName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'azure_account_key' })
  azureAccountKey: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'azure_container' })
  azureContainer: string | null;

  // DigitalOcean Spaces
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'do_space_name' })
  doSpaceName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'do_region' })
  doRegion: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'do_access_key' })
  doAccessKey: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'do_secret_key' })
  doSecretKey: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'do_endpoint' })
  doEndpoint: string | null;

  // Cloudflare R2
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cf_account_id' })
  cfAccountId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cf_access_key_id' })
  cfAccessKeyId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cf_secret_access_key' })
  cfSecretAccessKey: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'cf_bucket_name' })
  cfBucketName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cf_endpoint' })
  cfEndpoint: string | null;

  // Configurações gerais
  @Column({ type: 'int', unsigned: true, nullable: true, default: 10485760, name: 'max_file_size' })
  maxFileSize: number | null;

  @Column({ type: 'json', nullable: true, name: 'allowed_extensions' })
  allowedExtensions: string[] | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'base_url' })
  baseUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cdn_url' })
  cdnUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property: Property | null;

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
