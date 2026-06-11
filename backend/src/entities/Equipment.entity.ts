import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EquipmentCategory } from './EquipmentCategory.entity';
import { EquipmentLocation } from './EquipmentLocation.entity';

/**
 * Status conforme equipments-schema.sql: ENUM('active', 'maintenance', 'inactive', 'broken', 'disposed', 'reserved')
 */
export enum EquipmentStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    MAINTENANCE = 'maintenance',
    BROKEN = 'broken',
    DISPOSED = 'disposed',
    RESERVED = 'reserved',
}

/**
 * Entidade alinhada à tabela equipments do equipments-schema.sql.
 * Colunas mapeadas com o nome exato do schema (snake_case / maiúsculas onde definido).
 */
@Entity('equipments')
export class Equipment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'UUID', type: 'varchar', length: 36 })
    uuid: string;

    @Column({ name: 'protocol', type: 'varchar', length: 30, nullable: true })
    protocol: string | null;

    @Column({ name: 'property_id', type: 'int', unsigned: true })
    propertyId: number;

    @Column({ name: 'category_id', type: 'int', unsigned: true })
    categoryId: number;

    @ManyToOne(() => EquipmentCategory, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: EquipmentCategory;

    @Column({ name: 'CODE', type: 'varchar', length: 50 })
    code: string;

    @Column({ name: 'NAME', type: 'varchar', length: 200 })
    name: string;

    @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'brand', type: 'varchar', length: 100, nullable: true })
    manufacturer: string | null;

    @Column({ name: 'model', type: 'varchar', length: 100, nullable: true })
    model: string | null;

    @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
    serialNumber: string | null;

    @Column({ name: 'purchase_date', type: 'date', nullable: true })
    purchaseDate: Date | null;

    @Column({ name: 'location_id', type: 'int', unsigned: true, nullable: true })
    locationId: number | null;

    @ManyToOne(() => EquipmentLocation, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    locationRelation: EquipmentLocation | null;

    @Column({ name: 'location_detail', type: 'varchar', length: 255, nullable: true })
    locationDetail: string | null;

    @Column({ name: 'warranty_end_date', type: 'date', nullable: true })
    warrantyExpiry: Date | null;

    @Column({ name: 'STATUS', type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE })
    status: EquipmentStatus;

    @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
    imageUrl: string | null;

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
