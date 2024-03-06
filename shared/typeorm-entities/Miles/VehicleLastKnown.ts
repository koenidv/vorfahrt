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
  @Index({ })
  status: string;

  @Column({ type: "float" })
  latitude: number;

  @Column({ type: "float" })
  longitude: number;

  @Column()
  charging: boolean;

  @Column()
  charge: number;

  @Column()
  range: number;

  @Column()
  discounted: boolean;

  @Column()
  damageCount: number;

  @Column({ nullable: true })
  coverageGsm: number;

  @Column({ nullable: true })
  coverageGps: number;

  @UpdateDateColumn({
    precision: 0,
  })
  updated: Date;
}
