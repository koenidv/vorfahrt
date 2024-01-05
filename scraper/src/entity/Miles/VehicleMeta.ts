// @ts-nocheck

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  JoinColumn,
} from "typeorm";
import { VehicleModel } from "./VehicleModel";
import { City } from "./City";
import { VehicleDamage } from "./VehicleDamage";
import { VehicleLastKnown } from "./VehicleLastKnown";

@Entity({
  name: "MilesVehicle",
})
export class VehicleMeta {

  @PrimaryColumn()
  milesId: number;

  @OneToOne(() => VehicleLastKnown)
  lastKnown: VehicleLastKnown;

  @Column()
  @Index({ unique: true })
  licensePlate: string;

  @ManyToOne(() => VehicleModel, (model) => model.vehicles)
  model: VehicleModel;

  @Column()
  color: string;

  @ManyToOne(() => City)
  firstFoundCity: City;

  @Column()
  isCharity: boolean;

  @Column()
  // prepend this with https://api.app.miles-mobility.com/static/img/cars/small/ for the url
  image: string;

  @OneToMany(() => VehicleDamage, (damage) => damage.vehicle)
  damages: VehicleDamage[];

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
