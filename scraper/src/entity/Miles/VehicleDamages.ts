import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  @JoinColumn({ name: "vehicleMetaId" })
  vehicle: VehicleMeta;
  @Column()
  vehicleMetaId: number;

  @Column()
  title: string;

  @Column()
  damages: string;

  @CreateDateColumn()
  added: Date;
}
