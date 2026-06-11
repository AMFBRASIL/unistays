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
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Property } from './Property.entity';
import { Reservation } from './Reservation.entity';
import { User } from './User.entity';
import { PaymentMethod } from './PaymentMethod.entity';
import { FinancialCategory } from './FinancialCategory.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}


@Entity('transactions')
@Index(['transactionNumber'])
@Index(['type'])
@Index(['status'])
@Index(['reservationId'])
@Index(['propertyId'])
@Index(['dueDate'])
export class Transaction {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'transaction_number' })
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'financial_category_id' })
  financialCategoryId: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'chart_of_account_id' })
  chartOfAccountId: number | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'payment_method_id' })
  paymentMethodId: number | null;

  @Column({ type: 'date', nullable: true, name: 'payment_date' })
  paymentDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'reservation_id' })
  reservationId: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'property_id' })
  propertyId: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'supplier_id' })
  supplierId: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'created_by' })
  createdBy: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'approved_by' })
  approvedBy: number | null;

  @Column({ type: 'datetime', nullable: true, name: 'approved_at' })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'json', nullable: true })
  attachments: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Reservation, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @ManyToOne(() => PaymentMethod, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod | null;

  @ManyToOne(() => FinancialCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'financial_category_id' })
  financialCategory: FinancialCategory | null;

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
