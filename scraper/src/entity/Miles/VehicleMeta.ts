import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleModel } from "./VehicleModel";
import { City } from "./City";
import { VehicleDamage } from "./VehicleDamages";
import { VehicleCurrent } from "./VehicleCurrent";

@Entity({
  name: "MilesVehicleMeta",
})
export class VehicleMeta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  milesId: string;

  @Column()
  licensePlate: string;

  @ManyToOne(() => VehicleModel, (model) => model.vehicles)
  model: VehicleModel;

  @OneToOne(() => VehicleCurrent, (current) => current.vehicle)
  current: VehicleCurrent;

  @Column()
  color: string;

  @ManyToOne(() => City)
  firstCity: City;

  @Column()
  imageUrl: string;

  @OneToMany(() => VehicleDamage, (damage) => damage.vehicle)
  damages: VehicleDamage[];

  @CreateDateColumn()
  added: Date;
}
