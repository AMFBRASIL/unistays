
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('equipment_categories')
export class EquipmentCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    color: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    active: boolean;

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
