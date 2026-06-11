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
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Property, PropertyType } from './Property.entity';
import { Amenity } from './Amenity.entity';

export enum RoomTypeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('room_types')
@Index(['propertyId'])
@Index(['status'])
@Index(['propertyType'])
@Unique(['propertyId', 'code'])
export class RoomType {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'int', unsigned: true, name: 'property_id' })
  propertyId: number;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ['hotel', 'apart-hotel', 'loft', 'temporada', 'hostel', 'resort'],
    name: 'property_type',
  })
  propertyType: PropertyType;

  @Column({ type: 'int', default: 2, name: 'max_guests' })
  maxGuests: number;

  @Column({ type: 'int', default: 2, name: 'max_adults' })
  maxAdults: number;

  @Column({ type: 'int', default: 1, name: 'max_children' })
  maxChildren: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'base_price' })
  basePrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'adult_price' })
  adultPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'child_price' })
  childPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'infant_price' })
  infantPrice: number;

  @Column({
    type: 'enum',
    enum: ['per_unit', 'per_person'],
    default: 'per_unit',
    name: 'pricing_style',
  })
  pricingStyle: 'per_unit' | 'per_person';

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'size_m2' })
  sizeM2: number | null;

  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  @Column({
    type: 'enum',
    enum: RoomTypeStatus,
    default: RoomTypeStatus.ACTIVE,
  })
  status: RoomTypeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToMany(() => Amenity, { cascade: false })
  @JoinTable({
    name: 'room_type_amenities',
    joinColumn: { name: 'room_type_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'id' },
  })
  amenities: Amenity[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
