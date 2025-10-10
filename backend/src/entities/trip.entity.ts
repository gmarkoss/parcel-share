import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Parcel } from './parcel.entity';

export enum TransportType {
  CAR = 'car',
  BUS = 'bus',
  TRAIN = 'train',
}

export enum TripStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromLocation: string;

  @Column()
  toLocation: string;

  @Column('decimal', { precision: 10, scale: 7 })
  fromLat: number;

  @Column('decimal', { precision: 10, scale: 7 })
  fromLng: number;

  @Column('decimal', { precision: 10, scale: 7 })
  toLat: number;

  @Column('decimal', { precision: 10, scale: 7 })
  toLng: number;

  @Column({ type: 'enum', enum: TransportType })
  transportType: TransportType;

  @Column({ type: 'timestamp' })
  departureTime: Date;

  @Column({ type: 'timestamp' })
  arrivalTime: Date;

  @Column('int')
  availableCapacity: number; // number of parcels that can be carried

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.PLANNED })
  status: TripStatus;

  @ManyToOne(() => User, (user) => user.trips, { eager: true })
  @JoinColumn({ name: 'travelerId' })
  traveler: User;

  @Column()
  travelerId: string;

  @OneToMany(() => Parcel, (parcel) => parcel.trip)
  parcels: Parcel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

