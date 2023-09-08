import {
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
  city: City;

  @OneToOne(() => Polygon)
  @JoinColumn()
  data: Polygon;

  @CreateDateColumn()
  added: Date;
}
