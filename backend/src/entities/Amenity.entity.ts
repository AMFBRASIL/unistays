import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RoomType } from './RoomType.entity';

export enum AmenityCategory {
  COMFORT = 'comfort',
  ENTERTAINMENT = 'entertainment',
  WELLNESS = 'wellness',
  CONVENIENCE = 'convenience',
}

export enum AmenityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('amenities')
@Index(['category'])
@Index(['status'])
export class Amenity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_chargeable' })
  isChargeable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @Column({
    type: 'enum',
    enum: AmenityStatus,
    default: AmenityStatus.ACTIVE,
  })
  status: AmenityStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToMany(() => RoomType, (roomType) => roomType.amenities)
  roomTypes: RoomType[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
