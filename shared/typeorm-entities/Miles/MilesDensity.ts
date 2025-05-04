// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";

@Entity({
  name: "MilesDensity",
})
export class MilesDensity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  @Index()
  postcode: string;

  @Column()
  small: number;
  @Column()
  medium: number;
  @Column()
  large: number;
  @Column()
  extralarge: number;
  @Column()
  premium: number;

  @CreateDateColumn({
    precision: 0,
  })
  time: Date;
}
