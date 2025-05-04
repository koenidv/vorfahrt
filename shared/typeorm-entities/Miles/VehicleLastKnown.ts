// @ts-nocheck

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";

@Entity({
  name: "MilesVehicleLastKnown",
})
export class VehicleLastKnown {

  @PrimaryColumn()
  milesId: number;

  @OneToOne(() => VehicleMeta, (vehicle) => vehicle.lastKnown)
  @JoinColumn({ name: "milesId" })
  vehicle: VehicleMeta;

  @Column()
  @Index()
  status: string;

  @Column({ type: "float" })
  latitude: number;

  @Column({ type: "float" })
  longitude: number;

  @Column({ type: "varchar", nullable: true })
  @Index()
  postcode: string?;

  @Column()
  charging: boolean;

  @Column()
  charge: number;

  @Column()
  range: number;

  @Column()
  discounted: boolean;

  @Column({nullable: true})
  discountSource: string?;

  @Column()
  damageCount: number;

  @Column({ nullable: true })
  coverageGsm: number;

  @Column({ nullable: true })
  coverageGps: number;

  @UpdateDateColumn({
    precision: 0,
  })
  @Index()
  updated: Date;
}
