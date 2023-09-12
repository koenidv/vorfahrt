import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { City } from "./City";
import { Pricing } from "./Pricing";

@Entity({
  name: "MilesVehicleCurrent",
})
export class VehicleCurrent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => VehicleMeta, (meta) => meta.current)
  @JoinColumn()
  @Index({ unique: true })
  vehicle: VehicleMeta;

  @Column({
    type: "enum",
    enum: MilesVehicleStatus,
  })
  status: typeof MilesVehicleStatus;

  @Column("point")
  location: string | null;

  @ManyToOne(() => City)
  @JoinColumn({ name: "cityId" })
  city: City;
  @Column()
  cityId: number;

  @Column("int2")
  fuelPercent: number;

  @Column("int2")
  range: number;

  @ManyToOne(() => Pricing)
  @JoinColumn({ name: "pricingId" })
  pricing: Pricing;
  @Column()
  pricingId: number;

  @Column("decimal")
  pricePreBooking: number;

  @Column()
  charging: boolean;

  @Column("int2")
  coverageGsm: number;

  @Column("int2")
  coverageSatellites: number;

  @UpdateDateColumn()
  updated: Date;
}
