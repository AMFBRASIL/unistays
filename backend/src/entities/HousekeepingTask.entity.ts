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
import { Unit } from './Unit.entity';
import { User } from './User.entity';

export enum HousekeepingTaskCategory {
    CLEANING = 'cleaning',
    ARRANGEMENT = 'arrangement',
    MAINTENANCE = 'maintenance',
}

export enum HousekeepingTaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    BLOCKED = 'blocked',
}

export enum HousekeepingTaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity('housekeeping_tasks')
@Index(['propertyId'])
@Index(['unitId'])
@Index(['status'])
@Index(['category'])
export class HousekeepingTask {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
    uuid: string;

    @Column({ type: 'int', unsigned: true, name: 'property_id' })
    propertyId: number;

    @Column({ type: 'int', unsigned: true, name: 'unit_id' })
    unitId: number;

    @Column({
        type: 'enum',
        enum: HousekeepingTaskCategory,
    })
    category: HousekeepingTaskCategory;

    @Column({ type: 'varchar', length: 100 })
    type: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({
        type: 'enum',
        enum: HousekeepingTaskStatus,
        default: HousekeepingTaskStatus.PENDING,
    })
    status: HousekeepingTaskStatus;

    @Column({
        type: 'enum',
        enum: HousekeepingTaskPriority,
        default: HousekeepingTaskPriority.MEDIUM,
    })
    priority: HousekeepingTaskPriority;

    @Column({ type: 'int', unsigned: true, nullable: true, name: 'assignee_id' })
    assigneeId: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'estimated_time' })
    estimatedTime: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'datetime', nullable: true, name: 'scheduled_at' })
    scheduledAt: Date | null;

    @Column({ type: 'datetime', nullable: true, name: 'started_at' })
    startedAt: Date | null;

    @Column({ type: 'datetime', nullable: true, name: 'completed_at' })
    completedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;

    @ManyToOne(() => Property, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'unit_id' })
    unit: Unit;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'assignee_id' })
    assignee: User | null;

    constructor() {
        if (!this.uuid) {
            this.uuid = uuidv4();
        }
    }
}
