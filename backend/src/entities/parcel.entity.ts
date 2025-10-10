import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Trip } from './trip.entity';

export enum ParcelStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ParcelSize {
  SMALL = 'small', // fits in bag
  MEDIUM = 'medium', // small box
  LARGE = 'large', // large box
}

@Entity('parcels')
export class Parcel {
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

  @Column({ type: 'enum', enum: ParcelSize })
  size: ParcelSize;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rewardAmount: number;

  @Column({ type: 'timestamp' })
  desiredPickupDate: Date;

  @Column({ type: 'timestamp' })
  desiredDeliveryDate: Date;

  @Column({
    type: 'enum',
    enum: ParcelStatus,
    default: ParcelStatus.REQUESTED,
  })
  status: ParcelStatus;

  @ManyToOne(() => User, (user) => user.parcels, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.carriedParcels, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'carrierId' })
  carrier: User;

  @Column({ nullable: true })
  carrierId: string;

  @ManyToOne(() => Trip, (trip) => trip.parcels, { nullable: true })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column({ nullable: true })
  tripId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

