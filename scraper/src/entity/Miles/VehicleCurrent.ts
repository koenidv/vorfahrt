import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { City } from "./City";

@Entity({
  name: "MilesVehicleCurrent",
})
export class VehicleCurrent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => VehicleMeta, (meta) => meta.current)
  vehicle: VehicleMeta;

  @Column({
    type: "enum",
    enum: MilesVehicleStatus,
  })
  status: typeof MilesVehicleStatus;

  @Column("point")
  location: string | null;

  @ManyToOne(() => City)
  city: City;

  @Column("int2")
  fuelPercent: number;

  @Column("int2")
  range: number;

  @Column("decimal")
  priceKm: number;

  @Column("decimal")
  pricePause: number;

  @Column("decimal")
  priceUnlock: number;

  @Column("decimal")
  pricePreBooking: number;

  @Column()
  discounted: boolean;

  @Column()
  charging: boolean;

  @Column("int2")
  coverageGsm: number;

  @Column("int2")
  coverageSatellites: number;

  @UpdateDateColumn()
  updated: Date;
}
