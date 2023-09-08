import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleSize } from "./VehicleSize";

@Entity({
  name: "MilesTariff",
})
export class Tariff {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleSize, (size) => size.tariffs)
  size: VehicleSize;

  @Column("interval")
  duration: string;

  @Column("int2")
  distance: number;

  @Column("decimal")
  price: number;

  @Column("decimal")
  additionalPriceKm: number;

  @CreateDateColumn()
  added: Date;
}
