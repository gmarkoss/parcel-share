import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Match } from './match.entity';

export enum ReviewType {
  SENDER_TO_TRAVELER = 'sender_to_traveler',
  TRAVELER_TO_SENDER = 'traveler_to_sender',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match, { eager: true, onDelete: 'CASCADE' })
  match: Match;

  @Column()
  matchId: string;

  @ManyToOne(() => User, { eager: true })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, { eager: true })
  reviewee: User;

  @Column()
  revieweeId: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ default: false })
  isAnonymous: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

