import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { Unit } from './Unit.entity';

@Entity('unit_rates')
@Index(['unitId'])
@Index(['date'])
@Unique(['unitId', 'date'])
export class UnitRate {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: 'int', unsigned: true, name: 'unit_id' })
    unitId: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'daily_rate' })
    dailyRate: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'weekly_rate' })
    weeklyRate: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'monthly_rate' })
    monthlyRate: number | null;

    @Column({ type: 'int', nullable: true, name: 'min_stay' })
    minStay: number | null;

    @Column({ type: 'int', nullable: true, name: 'max_stay' })
    maxStay: number | null;

    @Column({ type: 'tinyint', default: 1 })
    available: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'unit_id' })
    unit: Unit;
}
