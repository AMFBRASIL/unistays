import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Generated } from 'typeorm';

/** @deprecated Use PmsEmailTemplate for new schema (email_templates). This entity maps to legacy table. */
@Entity('email_templates_legacy')
export class EmailTemplateLegacy {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    @Generated("uuid")
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'type', type: 'varchar', length: 50, default: 'promotional' })
    type: string;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    subject: string;

    @Column({ name: 'body_html', type: 'longtext', nullable: true })
    bodyHtml: string;

    @Column({ name: 'body_text', type: 'longtext', nullable: true })
    bodyText: string;

    @Column({ type: 'json', nullable: true })
    variables: Record<string, any>;

    @Column({ name: 'design_json', type: 'json', nullable: true })
    designJson: any;

    @Column({ type: 'text', nullable: true })
    thumbnail: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
