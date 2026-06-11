import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Generated } from 'typeorm';

export enum AutomationStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    DRAFT = 'draft',
}

@Entity('email_automations')
export class EmailAutomation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    @Generated("uuid")
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50, name: 'trigger_type' })
    triggerType: string;

    @Column({ type: 'json', nullable: true, name: 'trigger_config' })
    triggerConfig: any;

    @Column({
        type: 'enum',
        enum: AutomationStatus,
        default: AutomationStatus.DRAFT,
    })
    status: AutomationStatus;

    @Column({ type: 'int', default: 0, name: 'emails_count' })
    emailsCount: number;

    @Column({ type: 'int', default: 0, name: 'sent_count' })
    sentCount: number;

    @Column({ type: 'int', default: 0, name: 'conversions_count' })
    conversionsCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
