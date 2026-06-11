import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Property } from './Property.entity';

export type StorageLocationType =
  | 'almoxarifado'
  | 'deposito'
  | 'refrigerado'
  | 'governanca'
  | 'manutencao'
  | 'cofre'
  | 'quarto'
  | 'cozinha'
  | 'bar'
  | 'lavanderia';

export type StorageLocationTemperature =
  | 'ambient'
  | 'refrigerated'
  | 'frozen'
  | 'ultra_frozen'
  | 'heated';

export type StorageLocationStatus = 'active' | 'inactive' | 'maintenance' | 'blocked';

@Entity('storage_locations')
@Index(['propertyId'])
@Index(['type'])
@Index(['status'])
export class StorageLocation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true })
  uuid: string;

  @Column({ type: 'int', unsigned: true, name: 'property_id' })
  propertyId: number;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: [
      'almoxarifado',
      'deposito',
      'refrigerado',
      'governanca',
      'manutencao',
      'cofre',
      'quarto',
      'cozinha',
      'bar',
      'lavanderia',
    ],
    default: 'almoxarifado',
  })
  type: StorageLocationType;

  @Column({ type: 'int', unsigned: true, nullable: true })
  capacity: number | null;

  @Column({ type: 'int', unsigned: true, default: 0, name: 'current_occupancy' })
  currentOccupancy: number;

  @Column({
    type: 'enum',
    enum: ['ambient', 'refrigerated', 'frozen', 'ultra_frozen', 'heated'],
    default: 'ambient',
    name: 'temperature_control',
  })
  temperatureControl: StorageLocationTemperature;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'temperature_min' })
  temperatureMin: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'temperature_max' })
  temperatureMax: number | null;

  @Column({ type: 'tinyint', default: 0, name: 'is_restricted' })
  isRestricted: boolean;

  @Column({ type: 'tinyint', default: 0, name: 'requires_approval' })
  requiresApproval: boolean;

  @Column({ type: 'tinyint', default: 0, name: 'requires_count' })
  requiresCount: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'count_frequency_days' })
  countFrequencyDays: number | null;

  @Column({ type: 'tinyint', default: 0, name: 'allow_negative_stock' })
  allowNegativeStock: boolean;

  @Column({ type: 'tinyint', default: 1, name: 'fifo_required' })
  fifoRequired: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance', 'blocked'],
    default: 'active',
  })
  status: StorageLocationStatus;

  @Column({ type: 'tinyint', default: 0, name: 'is_default' })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property | null;
}
