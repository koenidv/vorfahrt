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
import { VehicleMeta } from "./VehicleMeta";
import { Waypoint } from "./Waypoint";

export enum TripType {
  PUBLIC,
  SUBSCRIPTION,
  RELOCATION,
}

@Entity({
  name: "MilesTrip",
})
export class Trip { // todo triptype: public, subscription (won't have end point), relocation
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

  @OneToOne(() => Waypoint, (point) => point.trip, { nullable: true, cascade: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "startPoint" })
  startPoint: Waypoint;

  @OneToOne(() => Waypoint, (point) => point.trip, { nullable: true, cascade: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "endPoint" })
  endPoint: Waypoint?;

  @OneToMany(() => Waypoint, (point) => point.trip, { onDelete: "CASCADE" })
  points: Waypoint[];
}
