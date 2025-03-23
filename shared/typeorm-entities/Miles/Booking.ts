// @ts-nocheck

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";
import { Trip } from "./Trip";

@Entity({
  name: "MilesBooking",
})
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleMeta, (meta) => meta.bookings)
  @JoinColumn({ name: "milesId" })
  vehicle: VehicleMeta;
  @Index()
  @Column()
  milesId: number;

  @Column("timestamptz", { nullable: false })
  startTime: Date;

  @Column("timestamptz", { nullable: true })
  endTime: Date;

  // not using location as typeorm will consistently break it on update

  @Column({ type: "float" })
  longitude: number;

  @Column({ type: "float" })
  latitude: number;

  @Column({ nullable: true })
  postcode: string?;

  @OneToOne(() => Trip, (trip) => trip.fromBooking, { nullable: true })
  trip: Trip | null;
}
