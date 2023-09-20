import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Pricing } from "./Pricing";

@Entity({
  name: "MilesPricingHistory",
})
export class PricingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pricing)
  current: Pricing;

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @Column("decimal", { nullable: true })
  pricePreBooking: number;

  @CreateDateColumn()
  until: Date;
}
