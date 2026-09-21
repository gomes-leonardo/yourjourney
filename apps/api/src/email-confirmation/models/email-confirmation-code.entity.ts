import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/models/user.entity.js';

@Entity('email_confirmation_codes')
@Index('UQ_email_confirmation_codes_active_user', ['user'], {
  unique: true,
  where: '"used_at" IS NULL AND "invalidated_at" IS NULL',
})
export class EmailConfirmationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  code_hash: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  used_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  invalidated_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
