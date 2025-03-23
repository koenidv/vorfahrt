// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Point,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Trip } from "./Trip";

@Entity({
  name: "MilesPoint",
})
export class Waypoint {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Trip, (trip) => trip.points)
  @JoinColumn()
  trip: Trip;

  @CreateDateColumn({
    precision: 0,
  })
  @Index({})
  time: Date;

  @Column()
  @Index({})
  status: string;

  @Column({ type: "point", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  location: string;

  @Column({ type: "varchar", nullable: true })
  postcode: string?;

  setLocation(longitude: number, latitude: number, postcode: string?) {
    this.location = `(${longitude}, ${latitude})`;
    this.postcode = postcode;
  }
  get latitude(): number {
    return parseFloat(this.location.split(",")[1].replace(")", "").trim());
  }
  get longitude(): number {
    return parseFloat(this.location.split(",")[0].replace("(", "").trim());
  }

  @Column({ type: "int" })
  rangeRemaining: number;
}
