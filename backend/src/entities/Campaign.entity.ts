import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum CampaignStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed',
}

export enum CampaignType {
    PROMOTIONAL = 'promotional',
    NEWSLETTER = 'newsletter',
    AUTOMATION = 'automation',
    TRANSACTIONAL = 'transactional',
    WELCOME = 'welcome',
    REENGAGEMENT = 'reengagement',
    EVENT = 'event',
}

@Entity('campaigns')
export class Campaign {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36, unique: true, default: () => '(UUID())' })
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    subject: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    preheader: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'sender_name' })
    senderName: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'sender_email' })
    senderEmail: string;

    @Column({
        type: 'enum',
        enum: CampaignStatus,
        default: CampaignStatus.DRAFT,
    })
    status: CampaignStatus;

    @Column({
        type: 'enum',
        enum: CampaignType,
        default: CampaignType.PROMOTIONAL,
    })
    type: CampaignType;

    @Column({ type: 'datetime', nullable: true, name: 'scheduled_at' })
    scheduledAt: Date;

    @Column({ type: 'longtext', nullable: true })
    content: string;

    @Column({ type: 'json', nullable: true })
    segments: any;

    // Estatísticas
    @Column({ type: 'int', default: 0, name: 'sent_count' })
    sent: number;

    @Column({ type: 'int', default: 0, name: 'delivered_count' })
    delivered: number;

    @Column({ type: 'int', default: 0, name: 'opened_count' })
    opened: number;

    @Column({ type: 'int', default: 0, name: 'clicked_count' })
    clicked: number;

    @Column({ type: 'int', default: 0, name: 'bounced_count' })
    bounced: number;

    @Column({ type: 'int', default: 0, name: 'unsubscribed_count' })
    unsubscribed: number;

    @Column({ type: 'int', default: 0, name: 'converted_count' })
    converted: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    revenue: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    constructor() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}
