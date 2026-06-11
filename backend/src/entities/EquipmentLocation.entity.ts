import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('equipment_locations')
export class EquipmentLocation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    uuid: string;

    @Column({ name: 'property_id', type: 'int', unsigned: true })
    propertyId: number;

    @Column({ type: 'varchar', length: 20 })
    code: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'location_type', type: 'enum', enum: ['room', 'common_area', 'operational', 'leisure', 'technical', 'external'], default: 'room' })
    locationType: string;

    @Column({ name: 'parent_id', type: 'int', unsigned: true, nullable: true })
    parentId: number | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    floor: string | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    capacity: number | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

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
