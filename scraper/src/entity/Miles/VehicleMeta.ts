import {
  Column,
  CreateDateColumn,
  Entity,
  In,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { VehicleModel } from "./VehicleModel";
import { City } from "./City";
import { VehicleDamage } from "./VehicleDamage";
import { VehicleCurrent } from "./VehicleCurrent";

@Entity({
  name: "MilesVehicleMeta",
})
export class VehicleMeta {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  milesId: number;

  @Column()
  @Index({ unique: true })
  licensePlate: string;

  @ManyToOne(() => VehicleModel, (model) => model.vehicles)
  @JoinColumn({ name: "modelId" })
  model: VehicleModel;
  @Column()
  modelId: number;

  @OneToOne(() => VehicleCurrent, (current) => current.vehicle, { cascade: ["insert"] })
  current: VehicleCurrent;

  @Column()
  color: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: "firstCityId" })
  firstCity: City;
  @Column()
  firstCityId: number;

  @Column()
  isCharity: boolean;

  @Column()
  imageUrl: string;

  @OneToMany(() => VehicleDamage, (damage) => damage.vehicle)
  damages: VehicleDamage[];

  @CreateDateColumn()
  added: Date;
}
