import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './User.entity';

export interface PermissionLevel {
  read?: boolean;
  write?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface GroupPermissions {
  [module: string]: PermissionLevel;
}

@Entity('user_groups')
@Index(['name'])
export class UserGroup {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 36, unique: true, default: () => 'UUID()' })
  uuid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  permissions: GroupPermissions | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany('User', (user: User) => user.group)
  users: User[];

  constructor() {
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
