import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmailTemplateCategory } from './EmailTemplateCategory.entity';

@Entity('email_templates')
export class PmsEmailTemplate {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ name: 'category_id', type: 'varchar', length: 36 })
  categoryId: string;

  @Column({ name: 'content_html', type: 'longtext' })
  contentHtml: string;

  @Column({ name: 'content_text', type: 'text', nullable: true })
  contentText: string | null;

  @Column({ name: 'preview_text', type: 'varchar', length: 255, nullable: true })
  previewText: string | null;

  @Column({ name: 'from_name', type: 'varchar', length: 255, nullable: true })
  fromName: string | null;

  @Column({ name: 'from_email', type: 'varchar', length: 255, nullable: true })
  fromEmail: string | null;

  @Column({ name: 'reply_to', type: 'varchar', length: 255, nullable: true })
  replyTo: string | null;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 36, nullable: true })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => EmailTemplateCategory, (c) => c.templates, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: EmailTemplateCategory;
}
