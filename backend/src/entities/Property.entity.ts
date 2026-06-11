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
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.entity';
import { Unit } from './Unit.entity';
import { Reservation } from './Reservation.entity';

export enum PropertyType {
  HOTEL = 'hotel',
  APART_HOTEL = 'apart-hotel',
  LOFT = 'loft',
  TEMPORADA = 'temporada',
  HOSTEL = 'hostel',
  RESORT = 'resort',
}

export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('properties')
@Index(['type'])
@Index(['status'])
@Index(['ownerId'])
export class Property {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  type: PropertyType;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.ACTIVE,
  })
  status: PropertyStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'address_number' })
  addressNumber: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'zip_code' })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Brasil' })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'tax_id' })
  taxId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string | null;

  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any> | null;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'owner_id' })
  ownerId: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, default: 0, name: 'commission_rate' })
  commissionRate: number | null;

  @Column({
    type: 'enum',
    enum: ['per-stay', 'weekly', 'biweekly', 'monthly'],
    nullable: true,
    name: 'cleaning_schedule',
  })
  cleaningSchedule: string | null;

  @Column({ type: 'json', nullable: true })
  services: Record<string, any> | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'wifi_network' })
  wifiNetwork: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'wifi_password' })
  wifiPassword: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User | null;

  @OneToMany(() => Unit, (unit) => unit.property)
  units: Unit[];

  @OneToMany(() => Reservation, (reservation) => reservation.property)
  reservations: Reservation[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
