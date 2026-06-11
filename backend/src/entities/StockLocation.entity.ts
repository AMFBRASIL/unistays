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

export enum StockLocationType {
    PRINCIPAL = 'principal',
    SATELITE = 'satelite',
    TRANSITO = 'transito',
    DESCARTE = 'descarte',
}

@Entity('stock_locations')
@Index(['propertyId'])
@Index(['type'])
@Index(['isActive'])
export class StockLocation {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
    uuid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: StockLocationType,
        default: StockLocationType.PRINCIPAL,
    })
    type: StockLocationType;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'int', unsigned: true, nullable: true, name: 'property_id' })
    propertyId: number | null;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;

    @ManyToOne(() => Property, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'property_id' })
    property: Property | null;

    constructor() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}
