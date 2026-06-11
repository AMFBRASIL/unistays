import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PmsEmailTemplate } from './PmsEmailTemplate.entity';

@Entity('email_template_categories')
export class EmailTemplateCategory {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Mail' })
  icon: string;

  @Column({ type: 'varchar', length: 50, default: 'text-blue-400' })
  color: string;

  @Column({ name: 'bg_color', type: 'varchar', length: 50, default: 'bg-blue-500/10' })
  bgColor: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PmsEmailTemplate, (t) => t.category)
  templates: PmsEmailTemplate[];
}
