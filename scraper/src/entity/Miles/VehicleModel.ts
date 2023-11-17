import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
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
  @Index({ unique: true })
  name: string;

  @ManyToOne(() => VehicleSize, (size) => size.models)
  size: VehicleSize;

  @Column("int2")
  seats: number;

  @Column()
  electric: boolean;

  @Column("int2")
  enginePower: number;

  @Column("varchar")
  transmission: keyof typeof MilesVehicleTransmissionReturn;

  @Column("varchar")
  fuelType: keyof typeof MilesVehicleFuelReturn;

  @OneToMany(() => VehicleMeta, (meta) => meta.model)
  vehicles: VehicleMeta[];

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
