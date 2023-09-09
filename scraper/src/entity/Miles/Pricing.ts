import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleSize } from "./VehicleSize";

@Entity({
  name: "MilesPricing",
})
export class Pricing {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => VehicleSize, (size) => size.pricing)
  size: VehicleSize;

  @Column()
  discounted: boolean;

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @CreateDateColumn()
  added: Date;
}
