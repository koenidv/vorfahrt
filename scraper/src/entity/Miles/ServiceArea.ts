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
  name: "MilesServiceArea",
})
export class ServiceArea {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City, (city) => city.serviceAreas)
  city: City;

  @OneToOne(() => Polygon)
  @JoinColumn()
  data: Polygon;

  @CreateDateColumn()
  added: Date;
}
