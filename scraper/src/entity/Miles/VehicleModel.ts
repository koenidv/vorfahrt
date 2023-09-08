import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CityToCityPricing } from "./CityToCityPricing";
import { VehicleSize } from "./VehicleSize";
import { VehicleMeta } from "./VehicleMeta";

@Entity({
  name: "MilesVehicleModel",
})
export class VehicleModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => VehicleSize, (size) => size.models)
  size: VehicleSize;

  @OneToMany(() => CityToCityPricing, (pricing) => pricing.size)
  cityToCityPricing: CityToCityPricing[];

  @Column("int2")
  seats: number;

  @Column()
  electric: boolean;

  @Column("int2")
  enginePower: number;

  @Column("char")
  transmission: string; // todo should be transmission enum from abfahrt

  @Column()
  fuelType: string; // todo should be fuelType enum from abfahrt

  @OneToMany(() => VehicleMeta, (meta) => meta.model)
  vehicles: VehicleMeta[];

  @CreateDateColumn()
  added: Date;
}
