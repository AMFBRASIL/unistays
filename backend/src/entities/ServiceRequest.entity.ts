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
import { Guest } from './Guest.entity';
import { Reservation } from './Reservation.entity';

export enum ServiceRequestCategory {
    HOUSEKEEPING = 'housekeeping',
    MAINTENANCE = 'maintenance',
    ROOM_SERVICE = 'roomservice',
    CONCIERGE = 'concierge',
    TRANSPORT = 'transport',
    OTHER = 'other'
}

export enum ServiceRequestStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum ServiceRequestPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

@Entity('service_requests')
export class ServiceRequest {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 36, unique: true, default: () => '(uuid())' })
    uuid: string;

    @Column({ type: 'int', unsigned: true, name: 'guest_id' })
    guestId: number;

    @Column({ type: 'int', unsigned: true, nullable: true, name: 'reservation_id' })
    reservationId: number | null;

    @Column({
        type: 'enum',
        enum: ServiceRequestCategory,
        default: ServiceRequestCategory.OTHER
    })
    category: ServiceRequestCategory;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: ServiceRequestStatus,
        default: ServiceRequestStatus.PENDING
    })
    status: ServiceRequestStatus;

    @Column({
        type: 'enum',
        enum: ServiceRequestPriority,
        default: ServiceRequestPriority.NORMAL
    })
    priority: ServiceRequestPriority;

    @Column({ type: 'text', nullable: true, name: 'staff_notes' })
    staffNotes: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;

    @ManyToOne(() => Guest, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guest_id' })
    guest: Guest;

    @ManyToOne(() => Reservation, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'reservation_id' })
    reservation: Reservation | null;
}
