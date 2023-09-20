import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CityToCityPricing } from "./CityToCityPricing";
import { VehicleSize } from "./VehicleSize";
import { VehicleMeta } from "./VehicleMeta";
import { MilesVehicleFuelReturn, MilesVehicleTransmissionReturn } from "@koenidv/abfahrt";

@Entity({
  name: "MilesVehicleModel",
})
export class VehicleModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => VehicleSize, (size) => size.models)
  @JoinColumn({ name: "sizeId" })
  size: VehicleSize;
  @Column()
  sizeId: number;

  @OneToMany(() => CityToCityPricing, (pricing) => pricing.size)
  cityToCityPricing: CityToCityPricing[];

  @Column("int2")
  seats: number;

  @Column()
  electric: boolean;

  @Column("int2")
  enginePower: number;

  @Column("char")
  transmission: typeof MilesVehicleTransmissionReturn;

  @Column()
  fuelType: typeof MilesVehicleFuelReturn;

  @OneToMany(() => VehicleMeta, (meta) => meta.model)
  vehicles: VehicleMeta[];

  @CreateDateColumn()
  added: Date;
}
