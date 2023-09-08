import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleMeta } from "./VehicleMeta";

@Entity({
  name: "MilesVehicleDamage",
})
export class VehicleDamage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VehicleMeta, (meta) => meta.damages)
  vehicle: VehicleMeta;

  @Column()
  title: string;

  @Column()
  damages: string;

  @CreateDateColumn()
  added: Date;
}
