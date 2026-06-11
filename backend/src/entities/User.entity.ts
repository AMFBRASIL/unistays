import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn, OneToMany, ManyToMany, JoinTable,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Reservation } from './Reservation.entity';
import { Transaction } from './Transaction.entity';
import { UserGroup } from './UserGroup.entity';
import { Property } from './Property.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  HOUSEKEEPING = 'housekeeping',
  ACCOUNTANT = 'accountant',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['email'])
@Index(['status'])

export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  /* 
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole; */

  @Column({ type: 'int', unsigned: true, nullable: true, name: 'user_group_id' })
  userGroupId: number | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'datetime', nullable: true, name: 'last_login' })
  lastLogin: Date | null;

  @Column({ type: 'boolean', default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt: Date | null;

  @Column({ type: 'boolean', default: false, name: 'two_factor_enabled' })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'two_factor_secret' })
  twoFactorSecret: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_reset_token' })
  passwordResetToken: string | null;

  @Column({ type: 'datetime', nullable: true, name: 'password_reset_expires' })
  passwordResetExpires: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Reservation, (reservation) => reservation.createdBy)
  reservations: Reservation[];

  @OneToMany(() => Transaction, (transaction) => transaction.createdBy)
  transactions: Transaction[];

  @ManyToOne(() => UserGroup, (group) => group.users, { nullable: true })
  @JoinColumn({ name: 'user_group_id' })
  group: UserGroup | null;

  @ManyToMany(() => Property)
  @JoinTable({
    name: 'user_properties',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'property_id', referencedColumnName: 'id' }
  })
  properties: Property[];



  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
