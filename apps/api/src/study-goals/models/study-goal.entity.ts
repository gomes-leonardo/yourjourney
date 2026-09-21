import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/models/user.entity.js';

@Entity('study_goals')
export class StudyGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  exam_type: string;

  @Column()
  taxonomy: string;

  @Column({ type: 'date' })
  exam_date: string;

  @Column()
  weekly_hours: number;

  @Column()
  difficult_subjects: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
