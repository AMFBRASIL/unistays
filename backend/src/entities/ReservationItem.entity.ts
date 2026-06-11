import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Reservation } from './Reservation.entity';

export enum ReservationItemType {
    EXTRA = 'extra',
    SERVICE = 'service',
    PRODUCT = 'product',
    FEE = 'fee',
    OTHER = 'other',
}

@Entity('reservation_items')
export class ReservationItem {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'int', unsigned: true, name: 'reservation_id' })
    reservationId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
    totalPrice: number;

    @Column({
        type: 'enum',
        enum: ReservationItemType,
        default: ReservationItemType.EXTRA,
    })
    type: ReservationItemType;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Reservation, (reservation) => reservation.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reservation_id' })
    reservation: Reservation;
}
