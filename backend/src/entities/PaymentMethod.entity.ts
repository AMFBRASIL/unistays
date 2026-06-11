import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36, unique: true })
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50 })
    type: string; // credit, debit, pix, cash, transfer, invoice, voucher

    // Renaming fee_percentage to fee in concept, but we can keep column name or change it.
    // The user asked to alter the table. Let's unify on 'fee' column name.
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    fee: number;

    @Column({ name: 'fee_type', type: 'varchar', length: 20, default: 'percent' })
    feeType: string; // percent, fixed

    @Column({ name: 'max_installments', type: 'int', default: 1 })
    maxInstallments: number;

    @Column({ name: 'days_to_receive', type: 'int', default: 0 })
    daysToReceive: number;

    @Column({ name: 'min_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    minValue: number;

    @Column({ name: 'max_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxValue: number;

    @Column({ name: 'requires_authorization', type: 'boolean', default: false })
    requiresAuthorization: boolean;

    @Column({ name: 'generate_receipt', type: 'boolean', default: true })
    generateReceipt: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'json', nullable: true })
    details: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @BeforeInsert()
    generateUuid() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}
