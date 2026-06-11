import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmailVariableGroup } from './EmailVariableGroup.entity';

@Entity('email_variables')
export class EmailVariable {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'group_id', type: 'varchar', length: 36 })
  groupId: string;

  @Column({ name: 'variable_key', type: 'varchar', length: 100 })
  variableKey: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sample_value', type: 'varchar', length: 500, nullable: true })
  sampleValue: string | null;

  @Column({ name: 'data_type', type: 'enum', enum: ['string', 'number', 'date', 'currency', 'boolean', 'url', 'email'], default: 'string' })
  dataType: string;

  @Column({ name: 'format_pattern', type: 'varchar', length: 100, nullable: true })
  formatPattern: string | null;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => EmailVariableGroup, (g) => g.variables)
  @JoinColumn({ name: 'group_id' })
  group: EmailVariableGroup;
}
