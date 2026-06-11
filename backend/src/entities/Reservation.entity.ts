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
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Property } from './Property.entity';
import { Unit } from './Unit.entity';
import { Guest } from './Guest.entity';
import { User } from './User.entity';
import { RatePlan } from './RatePlan.entity';
import { ReservationItem } from './ReservationItem.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum StayType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  LONG_STAY = 'long_stay',
}

@Entity('reservations')
@Index(['reservationNumber'])
@Index(['propertyId'])
@Index(['unitId'])
@Index(['guestId'])
@Index(['status'])
@Index(['checkIn', 'checkOut'])
@Index(['channel'])
export class Reservation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'reservation_number' })
  reservationNumber: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'confirmation_code', nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'int', unsigned: true, name: 'property_id' })
  propertyId: number;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'unit_id' })
  unitId: number | null;

  @Column({ type: 'int', unsigned: true, name: 'guest_id' })
  guestId: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({
    type: 'enum',
    enum: StayType,
    default: StayType.DAILY,
    name: 'stay_type'
  })
  stayType: StayType;

  @Column({ type: 'datetime', name: 'check_in' })
  checkIn: Date;

  @Column({ type: 'datetime', name: 'check_out' })
  checkOut: Date;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'check_in_time' })
  checkInTime: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'check_out_time' })
  checkOutTime: string | null;

  @Column({ type: 'int' })
  nights: number;

  @Column({ type: 'int', default: 1 })
  adults: number;

  @Column({ type: 'int', default: 0 })
  children: number;

  @Column({ type: 'int', default: 0 })
  infants: number;

  @Column({ type: 'int', default: 0 })
  pets: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  channel: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'booking_source' })
  bookingSource: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'purpose_of_stay' })
  purposeOfStay: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'special_occasion' })
  specialOccasion: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'rate_plan_id' })
  ratePlanId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_rate' })
  baseRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'paid_amount' })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'payment_method' })
  paymentMethod: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_brand' })
  cardBrand: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'card_transaction_id' })
  cardTransactionId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_auth_code' })
  cardAuthCode: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'card_machine_id' })
  cardMachineId: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'payment_id' })
  paymentId: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'channel_id' })
  channelId: number | null;

  @Column({ type: 'varchar', length: 20, default: 'pending', name: 'payment_status' })
  paymentStatus: string;

  @Column({ type: 'int', default: 1 })
  installments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'deposit_amount' })
  depositAmount: number;

  @Column({ type: 'boolean', default: false, name: 'deposit_paid' })
  depositPaid: boolean;

  @Column({ type: 'date', nullable: true, name: 'deposit_due_date' })
  depositDueDate: Date | null;

  @Column({ type: 'text', nullable: true, name: 'payment_notes' })
  paymentNotes: string | null;

  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'contract_value' })
  contractValue: number | null;

  @Column({ type: 'text', nullable: true, name: 'special_requests' })
  specialRequests: string | null;

  @Column({ type: 'text', nullable: true, name: 'internal_notes' })
  internalNotes: string | null;

  // Dictionary fields for Room Preferences
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'floor_preference' })
  floorPreference: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'view_preference' })
  viewPreference: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'smoking_preference' })
  smokingPreference: string | null;

  @Column({ type: 'boolean', default: false, name: 'accessibility_needs' })
  accessibilityNeeds: boolean;

  @Column({ type: 'text', nullable: true, name: 'accessibility_notes' })
  accessibilityNotes: string | null;

  @Column({ type: 'text', nullable: true, name: 'pet_details' })
  petDetails: string | null;

  // Agency / OTA Fields
  @Column({ type: 'boolean', default: false, name: 'is_agency' })
  isAgency: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'agency_name' })
  agencyName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'agency_contact' })
  agencyContact: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'agency_email' })
  agencyEmail: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'agency_commission' })
  agencyCommission: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'commission_amount' })
  commissionAmount: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'external_id' })
  externalId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'voucher_number' })
  voucherNumber: string | null;

  @Column({ type: 'text', nullable: true, name: 'agency_notes' })
  agencyNotes: string | null;

  // Confirmation Flags
  @Column({ type: 'boolean', default: false, name: 'send_email_confirmation' })
  sendEmailConfirmation: boolean;

  @Column({ type: 'boolean', default: false, name: 'send_whatsapp_confirmation' })
  sendWhatsAppConfirmation: boolean;

  @Column({ type: 'boolean', default: false, name: 'agreed_to_terms' })
  agreedToTerms: boolean;

  @Column({ type: 'text', nullable: true, name: 'cancellation_reason' })
  cancellationReason: string | null;

  @Column({ type: 'datetime', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'cancelled_by' })
  cancelledBy: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'created_by' })
  createdBy: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'operator_name' })
  operatorName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => Unit, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit | null;

  @ManyToOne(() => Guest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ManyToOne(() => RatePlan, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rate_plan_id' })
  ratePlan: RatePlan | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelled_by' })
  canceller: User | null;

  @OneToMany(() => ReservationItem, (item) => item.reservation, { cascade: true })
  items: ReservationItem[];

  @ManyToMany(() => Guest)
  @JoinTable({
    name: 'reservation_guests',
    joinColumn: { name: 'reservation_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'guest_id', referencedColumnName: 'id' },
  })
  accompanyingGuests: Guest[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
