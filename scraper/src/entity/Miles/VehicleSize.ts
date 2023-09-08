import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CityToCityPricing } from "./CityToCityPricing";
import { VehicleModel } from "./VehicleModel";
import { Pricing } from "./Pricing";
import { Tariff } from "./Tariff";

@Entity({
  name: "MilesVehicleSize",
})
export class VehicleSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => VehicleModel, (model) => model.size)
  models: VehicleModel[];

  @OneToOne(() => Pricing, (pricing) => pricing.size)
  pricing: Pricing;

  @OneToMany(() => Tariff, (tariff) => tariff.size)
  tariffs: Tariff[];

  @OneToMany(() => CityToCityPricing, (pricing) => pricing.size)
  cityToCityPricing: CityToCityPricing[];

  @CreateDateColumn()
  added: Date;
}
