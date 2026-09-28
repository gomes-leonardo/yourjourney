import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/models/user.entity.js';

export type MaterialStatus = 'recebido' | 'processando' | 'pronto' | 'falhou';

@Check(
  'CHK_materials_status',
  `"status" IN ('recebido', 'processando', 'pronto', 'falhou')`,
)
@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  file_name: string;

  @Column()
  storage_path: string;

  @Column({ default: 'recebido' })
  status: MaterialStatus;

  @Column({ type: 'integer', nullable: true })
  total_pages: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
