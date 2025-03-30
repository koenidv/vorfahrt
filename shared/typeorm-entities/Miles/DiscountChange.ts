// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";

@Entity({
  name: "MilesDiscountChange",
})
export class DiscountChange {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleMeta, (meta) => meta.bookings)
  @JoinColumn({ name: "milesId" })
  vehicle: VehicleMeta;
  @Index()
  @Column()
  milesId: number;

  @CreateDateColumn({
    precision: 0,
  })
  time: Date;

  @Column()
  discount: string; // use NONE for no discount

}
