import {
  Column,
  CreateDateColumn,
  Entity,
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
