import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
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
  @JoinColumn({ name: "sizeId" })
  size: VehicleSize;
  @Column()
  sizeId: number;

  @Column("int2")
  seats: number;

  @Column()
  electric: boolean;

  @Column("int2")
  enginePower: number;

  @Column("char")
  transmission: keyof typeof MilesVehicleTransmissionReturn;

  @Column()
  fuelType: keyof typeof MilesVehicleFuelReturn;

  @OneToMany(() => VehicleMeta, (meta) => meta.model)
  vehicles: VehicleMeta[];

  @CreateDateColumn()
  added: Date;
}
