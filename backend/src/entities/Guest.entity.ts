import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Reservation } from './Reservation.entity';

export enum GuestTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('guests')
@Index(['email'])
@Index(['documentNumber'])
@Index(['tier'])
@Index(['firstName', 'lastName'])
export class Guest {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: ['cpf', 'passport', 'rg', 'cnh', 'other'],
    nullable: true,
  })
  documentType: string | null;

  @Column({ name: 'document_number', type: 'varchar', length: 50, nullable: true })
  documentNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'Brasil' })
  nationality: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    nullable: true,
  })
  gender: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string | null;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'Brasil' })
  country: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  // Virtual property for full name
  get name(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Virtual property for CPF (from documentNumber when type is cpf)
  get cpf(): string | null {
    return this.documentType === 'cpf' ? this.documentNumber : null;
  }

  @Column({
    type: 'enum',
    enum: GuestTier,
    default: GuestTier.BRONZE,
  })
  tier: GuestTier;

  @Column({ name: 'loyalty_points', type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({ name: 'total_stays', type: 'int', default: 0 })
  totalStays: number;

  @Column({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'json', nullable: true })
  preferences: string[] | null;

  @Column({ type: 'json', nullable: true })
  tags: string[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'marketing_consent', type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({
    type: 'enum',
    enum: ['physical', 'legal'],
    default: 'physical',
  })
  type: 'physical' | 'legal';

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp: string | null;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName: string | null;

  @Column({ name: 'trade_name', type: 'varchar', length: 255, nullable: true })
  tradeName: string | null;

  @Column({ name: 'state_registration', type: 'varchar', length: 50, nullable: true })
  stateRegistration: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cnpj: string | null;

  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName: string | null;

  @Column({ name: 'address_number', type: 'varchar', length: 20, nullable: true })
  addressNumber: string | null;

  @Column({ name: 'address_complement', type: 'varchar', length: 100, nullable: true })
  addressComplement: string | null;

  @Column({ name: 'address_neighborhood', type: 'varchar', length: 100, nullable: true })
  addressNeighborhood: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string | null;

  @Column({ name: 'member_since', type: 'date', nullable: true })
  memberSince: Date | null;

  @Column({ name: 'marketing_email', type: 'boolean', default: true })
  marketingEmail: boolean;

  @Column({ name: 'marketing_sms', type: 'boolean', default: true })
  marketingSms: boolean;

  @Column({ name: 'marketing_whatsapp', type: 'boolean', default: true })
  marketingWhatsapp: boolean;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 255, nullable: true })
  emergencyContactName: string | null;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone: string | null;

  @Column({ name: 'emergency_contact_relation', type: 'varchar', length: 50, nullable: true })
  emergencyContactRelation: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Reservation, (reservation) => reservation.guest)
  reservations: Reservation[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
