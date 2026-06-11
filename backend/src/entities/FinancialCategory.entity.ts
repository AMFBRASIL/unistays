import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum FinancialCategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('financial_categories')
@Index(['type'])
@Index(['isActive'])
@Index(['sortOrder'])
export class FinancialCategory {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: FinancialCategoryType })
  type: FinancialCategoryType;

  @Column({ type: 'varchar', length: 50, default: 'DollarSign' })
  icon: string;

  @Column({ type: 'varchar', length: 50, default: 'slate-500' })
  color: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
