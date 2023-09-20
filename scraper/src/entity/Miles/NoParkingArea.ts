import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { City } from "./City";
import { Polygon } from "./Polygon";

@Entity({
  name: "MilesNoParkingArea",
})
export class NoParkingArea {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City, (city) => city.noParkingAreas)
  @JoinColumn({ name: "cityId" })
  city: City;
  
  @Column()
  cityId: number;

  @OneToOne(() => Polygon)
  @JoinColumn()
  data: Polygon;

  @CreateDateColumn()
  added: Date;
}
