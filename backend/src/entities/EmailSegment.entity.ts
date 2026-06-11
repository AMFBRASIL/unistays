import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Generated } from 'typeorm';

@Entity('email_segments')
export class EmailSegment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    @Generated("uuid")
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, default: 'users' })
    icon: string;

    @Column({ type: 'varchar', length: 50, default: 'bg-blue-500/10 text-blue-500' })
    color: string;

    @Column({ type: 'json', nullable: true })
    criteria: any;

    @Column({ type: 'int', default: 0, name: 'contacts_count' })
    contactsCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}
