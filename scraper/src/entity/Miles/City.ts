import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ServiceArea } from "./ServiceArea";
import { NoParkingArea } from "./NoParkingArea";

@Entity({
  name: "MilesCity",
})
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  milesId: string;

  @Column()
  name: string;

  @Column("point")
  location: string;

  @OneToMany(() => ServiceArea, (serviceArea) => serviceArea.city)
  serviceAreas: ServiceArea[];

  @OneToMany(() => NoParkingArea, (noParkingArea) => noParkingArea.city)
  noParkingAreas: NoParkingArea[];

  @CreateDateColumn()
  added: Date;
}
