import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

export enum BookingChannelStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Entity('booking_channels')
export class BookingChannel {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string; // "Booking.com", "Airbnb", etc.

    @Column({ type: 'varchar', length: 50, unique: true })
    slug: string; // "booking", "airbnb", etc. - useful for code logic/icons

    @Column({ type: 'varchar', length: 50, default: 'bg-primary' })
    color: string; // "bg-blue-500", etc. for UI customization

    @Column({
        type: 'enum',
        enum: BookingChannelStatus,
        default: BookingChannelStatus.ACTIVE,
    })
    status: BookingChannelStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    defaultCommission: number; // Default commission % for this channel

    @Column({ type: 'json', nullable: true })
    metadata: any; // Flexible field for API keys, mapping IDs, etc.

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}
