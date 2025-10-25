import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Parcel } from './parcel.entity';
import { Trip } from './trip.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Parcel, (parcel) => parcel.sender)
  parcels: Parcel[];

  @OneToMany(() => Trip, (trip) => trip.traveler)
  trips: Trip[];

  @OneToMany(() => Parcel, (parcel) => parcel.carrier)
  carriedParcels: Parcel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


