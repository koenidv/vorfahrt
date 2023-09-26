import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  // todo combined index on discounted and prices

  @Column()
  discounted: boolean;

  @Column({nullable: true})
  discountReason: string;

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @Column("decimal")
  pricePreBooking: number;

  @CreateDateColumn()
  added: Date;
}
