// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({
  name: "Weather",
})
export class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    precision: 0,
  })
  time: Date;

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

  @Column()
  areaname: string;

  @Column({ type: "int", nullable: true })
  weatherCode: number;

  @Column({ type: "float", nullable: true })
  temperature: number;

  @Column({ type: "float", nullable: true })
  minTemperature: number;

  @Column({ type: "float", nullable: true })
  maxTemperature: number;

  @Column({ type: "float", nullable: true })
  feelslike: number;

  @Column({ type: "float", nullable: true })
  precipitation: number;

  @Column({ type: "float", nullable: true })
  humidity: number;

  @Column({ type: "float", nullable: true })
  pressure: number;

  @Column({ type: "float", nullable: true })
  uvIndex: number;

  @Column({ type: "float", nullable: true })
  visibility: number;

  @Column({ type: "float", nullable: true })
  windspeed: number;

  @Column({ type: "float", nullable: true })
  winddirection: number;

  @Column({ type: "float", nullable: true })
  cloudcover: number;
}
