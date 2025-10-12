import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Parcel } from './parcel.entity';
import { Trip } from './trip.entity';
import { User } from './user.entity';
import { MatchStatus } from '../common/enums';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Parcel, { eager: true, onDelete: 'CASCADE' })
  parcel: Parcel;

  @Column()
  parcelId: string;

  @ManyToOne(() => Trip, { eager: true, onDelete: 'CASCADE' })
  trip: Trip;

  @Column()
  tripId: string;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { eager: true })
  traveler: User;

  @Column()
  travelerId: string;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  @Column({ type: 'float', nullable: true })
  matchScore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

