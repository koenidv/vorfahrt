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
import { NoParkingArea } from "./NoParkingArea";

@Entity({
  name: "MilesNoParkingAreaHistory",
})
export class NoParkingAreaHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City, (city) => city.noParkingAreas)
  current: NoParkingArea;

  @OneToOne(() => Polygon)
  @JoinColumn()
  data: Polygon;

  @CreateDateColumn()
  until: Date;
}
