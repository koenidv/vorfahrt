import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";
import { ChangeEvent } from "./_ChangeEventEnum";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { City } from "./City";
import { Pricing } from "./Pricing";

@Entity({
  name: "MilesVehicleChange",
})
export class VehicleChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleMeta)
  vehicle: VehicleMeta;

  @Column({
    type: "enum",
    enum: ChangeEvent,
    default: ChangeEvent.change,
  })
  event: ChangeEvent;

  @Column({
    type: "enum",
    enum: MilesVehicleStatus,
  })
  status: typeof MilesVehicleStatus;

  @Column({
    type: "point",
    nullable: true,
  })
  location: string | null;

  @ManyToOne(() => City, { nullable: true })
  city: City;

  @Column({
    type: "int2",
    nullable: true,
  })
  fuelPercent: number;

  @Column({
    type: "int2",
    nullable: true,
  })
  range: number;

  @ManyToOne(() => Pricing, { nullable: true })
  pricing: Pricing;
  
  @Column({
    type: "decimal",
    nullable: true,
  })
  pricePreBooking: number;

  @Column({ nullable: true })
  charging: boolean;

  @Column({
    type: "int2",
    nullable: true,
  })
  coverageGsm: number;

  @Column({
    type: "int2",
    nullable: true,
  })
  coverageSatellites: number;

  @CreateDateColumn()
  added: Date;
}