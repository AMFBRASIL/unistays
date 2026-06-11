import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum MaintenanceType {
    PREVENTIVA = 'preventiva',
    CORRETIVA = 'corretiva',
    INSPECAO = 'inspecao',
    OUTROS = 'outros',
}

export enum MaintenancePriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
}

export enum MaintenanceStatus {
    PENDING = 'pending',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    OVERDUE = 'overdue',
}

@Entity('maintenance_orders')
export class MaintenanceOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 36 })
    uuid: string;

    @Column({ name: 'property_id', type: 'int', nullable: true })
    propertyId: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255 })
    equipment: string;

    @Column({ name: 'equipment_id', type: 'int', unsigned: true, nullable: true })
    equipmentId: number;

    @Column({ name: 'category_id', type: 'int', unsigned: true, nullable: true })
    categoryId: number;

    @Column({ name: 'unit_id', type: 'int', unsigned: true, nullable: true })
    unitId: number;

    @Column({ type: 'varchar', length: 255 })
    location: string;

    @Column({ type: 'enum', enum: MaintenanceType, default: MaintenanceType.PREVENTIVA })
    type: MaintenanceType;

    @Column({ type: 'enum', enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
    priority: MaintenancePriority;

    @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.PENDING })
    status: MaintenanceStatus;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'due_date', type: 'datetime', nullable: true })
    dueDate: Date;

    @Column({ name: 'scheduled_date', type: 'datetime', nullable: true })
    scheduledDate: Date;

    @Column({ name: 'completed_date', type: 'datetime', nullable: true })
    completedDate: Date;

    @Column({ name: 'assigned_to', type: 'varchar', length: 255, nullable: true })
    assignedTo: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cost: number;

    @Column({ type: 'json', nullable: true })
    images: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date;

    @BeforeInsert()
    generateUuid() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}
