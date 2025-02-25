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
import { Trip } from "./Trip";
import { VehicleLastKnown } from "./VehicleLastKnown";
import { Booking } from "./Booking";

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
  @JoinColumn({ name: "modelId" })
  model: VehicleModel;
  @Column({ nullable: false })
  modelId: number;

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

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];
  
  @OneToMany(() => Booking, (booking) => booking.vehicle)
  bookings: Booking[];

  @CreateDateColumn({
    precision: 0,
  })
  added: Date;
}
