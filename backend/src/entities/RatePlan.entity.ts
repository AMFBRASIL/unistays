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

export enum RatePlanType {
  RACK = 'rack',
  CORPORATE = 'corporate',
  GROUP = 'group',
  PROMOTIONAL = 'promotional',
  PACKAGE = 'package',
  LONG_STAY = 'long_stay',
}

export enum RatePlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('rate_plans')
@Index(['propertyId'])
@Index(['status'])
@Index(['type'])
@Unique(['propertyId', 'code'])
export class RatePlan {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'int', unsigned: true, name: 'property_id' })
  propertyId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RatePlanType,
    default: RatePlanType.RACK,
  })
  type: RatePlanType;

  @Column({
    type: 'enum',
    enum: RatePlanStatus,
    default: RatePlanStatus.ACTIVE,
  })
  status: RatePlanStatus;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_rate' })
  baseRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0, name: 'discount_percentage' })
  discountPercentage: number | null;

  @Column({ type: 'int', nullable: true, name: 'min_stay' })
  minStay: number | null;

  @Column({ type: 'int', nullable: true, name: 'max_stay' })
  maxStay: number | null;

  @Column({ type: 'int', nullable: true, name: 'advance_booking_days' })
  advanceBookingDays: number | null;

  @Column({ type: 'json', nullable: true, name: 'cancellation_policy' })
  cancellationPolicy: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  restrictions: Record<string, any> | null;

  @Column({ type: 'date', nullable: true, name: 'valid_from' })
  validFrom: Date | null;

  @Column({ type: 'date', nullable: true, name: 'valid_to' })
  validTo: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @OneToMany(() => Reservation, (reservation) => reservation.ratePlan)
  reservations: Reservation[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
