// @ts-nocheck

import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity({
  name: "TrafficFlow",
})
export class TrafficFlow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "point", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  tile: string;

  @Column({ type: "int2" })
  zoom: number;

  @Column({ type: "point", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  northwest: string;

  @Column({ type: "point", spatialFeatureType: "Point", srid: 4326 })
  @Index({ spatial: true })
  southeast: string;

  @Column({ type: "float" })
  flow: number;

  @Column({ type: "float" })
  density: number;
}
