import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Property } from './Property.entity';
import { Reservation } from './Reservation.entity';
import { RoomType } from './RoomType.entity';

export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  CHECKOUT = 'checkout',
  CLEANING = 'cleaning',
  MAINTENANCE = 'maintenance',
  BLOCKED = 'blocked',
}

@Entity('units')
@Index(['propertyId'])
@Index(['status'])
@Unique(['propertyId', 'number'])
export class Unit {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'int', unsigned: true, name: 'property_id' })
  propertyId: number;

  @Column({ type: 'varchar', length: 50 })
  number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'room_type_id' })
  roomTypeId: number | null;

  @Column({ type: 'int', default: 1 })
  floor: number;

  @Column({ type: 'int', default: 2 })
  capacity: number;

  @Column({ type: 'int', default: 2, name: 'max_capacity' })
  maxCapacity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  beds: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'size_m2' })
  sizeM2: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  view: string | null;

  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.AVAILABLE,
  })
  status: UnitStatus;

  @Column({ type: 'json', nullable: true })
  rates: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  } | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Property, (property) => property.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => RoomType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomType | null;

  @OneToMany(() => Reservation, (reservation) => reservation.unit)
  reservations: Reservation[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
