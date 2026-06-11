import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Guest } from './Guest.entity';

@Entity('guest_password_reset_tokens')
@Index(['tokenHash'])
@Index(['guestId'])
export class GuestPasswordResetToken {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /** SHA-256 hex do token enviado por e-mail (nunca armazenar o token em claro). */
  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'int', unsigned: true, name: 'guest_id' })
  guestId: number;

  @ManyToOne(() => Guest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @Column({ type: 'datetime', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
