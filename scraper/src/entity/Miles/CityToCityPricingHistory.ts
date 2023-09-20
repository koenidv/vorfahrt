import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CityToCityPricing } from "./CityToCityPricing";

@Entity({
  name: "MilesCityToCityPricingHistory",
})
export class CityToCityPricingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CityToCityPricing)
  cityToCity: CityToCityPricing;

  @Column("decimal")
  price: number;

  @CreateDateColumn()
  until: Date;
}
