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

  @Column("timestampz")
  startTime: Date;

  @Column("timestampz")
  endTime: Date;

  @OneToOne(() => Trip, (trip) => trip.fromBooking, { nullable: true, cascade: true })
  trip: Trip;
}
