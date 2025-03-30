// @ts-nocheck

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./Booking";
import { VehicleMeta } from "./VehicleMeta";
import { Waypoint } from "./Waypoint";

export enum TripType {
  PUBLIC = "public",
  SUBSCRIPTION = "subscription",
  RELOCATION = "relocation",
}

type NewType = Booking;

@Entity({
  name: "MilesTrip",
})
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleMeta, (meta) => meta.trips)
  @JoinColumn({ name: "milesId" })
  vehicle: VehicleMeta;
  @Index()
  @Column()
  milesId: number;

  @Column({
    type: "enum",
    enum: TripType,
    default: TripType.PUBLIC,
  })
  type: TripType;

  @OneToOne(() => Booking, (booking) => booking.trip, { nullable: true, cascade: true })
  @JoinColumn({ name: "fromBooking" })
  fromBooking: Booking | null;

  @Column({nullable: true})
  discount: string?;

  @OneToOne(() => Waypoint, (point) => point.trip, { nullable: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "startPoint" })
  startPoint: Waypoint;

  @OneToOne(() => Waypoint, (point) => point.trip, { nullable: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "endPoint" })
  endPoint: Waypoint?;

  @OneToMany(() => Waypoint, (point) => point.trip, { onDelete: "CASCADE" })
  points: Waypoint[];
}
