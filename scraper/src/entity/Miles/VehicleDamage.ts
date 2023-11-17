import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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
  @Index()
  @Column()
  vehicleId: number;

  @Column()
  title: string;

  @Column("varchar", { array: true, default: "{}" })
  damages: string[];

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
