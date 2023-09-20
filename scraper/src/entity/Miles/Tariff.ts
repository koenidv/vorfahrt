import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  @JoinColumn({ name: "sizeId" })
  size: VehicleSize;
  @Column()
  sizeId: number;

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
